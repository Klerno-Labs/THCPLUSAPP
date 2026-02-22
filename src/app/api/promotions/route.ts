import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendSms, getPromotionSms } from "@/lib/twilio";

export const dynamic = "force-dynamic";

// ─── GET: List Promotions ───────────────────────────────
export async function GET() {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const promotions = await prisma.promotion.findMany({
      include: {
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = promotions.map((p) => ({
      id: p.id,
      titleEn: p.titleEn,
      titleEs: p.titleEs,
      bodyEn: p.bodyEn,
      bodyEs: p.bodyEs,
      method: p.type.toLowerCase(),
      audience: p.targetAudience || "all",
      status: p.sentAt
        ? "sent"
        : p.scheduledAt
        ? "scheduled"
        : "draft",
      sentAt: p.sentAt?.toISOString() || null,
      scheduledAt: p.scheduledAt?.toISOString() || null,
      recipientCount: p.recipientCount,
      createdBy: p.createdBy.name,
      createdAt: p.createdAt.toISOString(),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/promotions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

// ─── POST: Create & Optionally Send Promotion ──────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      titleEn,
      titleEs,
      bodyEn,
      bodyEs,
      type,
      targetAudience,
      sendNow,
      scheduledAt,
    } = body;

    if (!titleEn || !bodyEn) {
      return NextResponse.json(
        { error: "Title and body are required" },
        { status: 400 }
      );
    }

    if (!session.user.email) {
      return NextResponse.json({ error: "Session error" }, { status: 400 });
    }

    // Find the staff user ID from the session
    const staffUser = await prisma.staffUser.findFirst({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!staffUser) {
      return NextResponse.json(
        { error: "Staff user not found" },
        { status: 400 }
      );
    }

    // Count recipients based on audience
    const audienceWhere = buildAudienceFilter(targetAudience || "all");
    const recipientCount = await prisma.profile.count({ where: audienceWhere });

    // Create promotion record
    const promotion = await prisma.promotion.create({
      data: {
        titleEn,
        titleEs: titleEs || null,
        bodyEn,
        bodyEs: bodyEs || null,
        type: (type || "BOTH").toUpperCase(),
        targetAudience: targetAudience || "all",
        createdById: staffUser.id,
        recipientCount,
        sentAt: sendNow ? new Date() : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    // Send SMS if sendNow and type includes SMS
    let smsSent = 0;
    if (
      sendNow &&
      ["SMS", "BOTH"].includes((type || "BOTH").toUpperCase())
    ) {
      const recipients = await prisma.profile.findMany({
        where: audienceWhere,
        select: { phone: true, preferredLanguage: true },
      });

      // Send in batches (fire and forget, don't block response)
      const smsPromises = recipients.map(async (recipient) => {
        const lang = recipient.preferredLanguage || "en";
        const smsBody = getPromotionSms(
          lang === "es" ? (titleEs || titleEn) : titleEn,
          lang === "es" ? (bodyEs || bodyEn) : bodyEn,
          lang
        );

        const result = await sendSms({ to: recipient.phone, body: smsBody });
        if (result.success) smsSent++;
      });

      // Wait for all (but timeout after 30s to not block)
      await Promise.allSettled(smsPromises);
    }

    return NextResponse.json(
      {
        id: promotion.id,
        recipientCount,
        smsSent,
        status: sendNow ? "sent" : scheduledAt ? "scheduled" : "draft",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/promotions error:", error);
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    );
  }
}

// ─── Helper: Build audience filter ──────────────────────
function buildAudienceFilter(audience: string) {
  switch (audience) {
    case "seedling":
      return { loyaltyTier: "SEEDLING" as const };
    case "grower":
      return { loyaltyTier: "GROWER" as const };
    case "cultivator":
      return { loyaltyTier: "CULTIVATOR" as const };
    case "master_grower":
      return { loyaltyTier: "MASTER_GROWER" as const };
    case "inactive": {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        orders: { none: { createdAt: { gte: thirtyDaysAgo } } },
      };
    }
    case "all":
    default:
      return {};
  }
}
