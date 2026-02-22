import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fulfillRedemptionSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// ─── PATCH: Fulfill or Cancel a Redemption ───────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER", "STAFF"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = fulfillRedemptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, staffNotes } = parsed.data;

    // ── Find the redemption ──
    const redemption = await prisma.redemption.findUnique({
      where: { id: params.id },
    });

    if (!redemption) {
      return NextResponse.json(
        { error: "Redemption not found" },
        { status: 404 }
      );
    }

    if (redemption.status !== "PENDING") {
      return NextResponse.json(
        { error: "Redemption is not in PENDING status" },
        { status: 400 }
      );
    }

    let updatedRedemption;

    if (status === "FULFILLED") {
      // ── Mark as fulfilled ──
      updatedRedemption = await prisma.redemption.update({
        where: { id: params.id },
        data: {
          status: "FULFILLED",
          fulfilledById: (session.user as any).id,
          fulfilledAt: new Date(),
          staffNotes: staffNotes || null,
        },
      });
    } else {
      // ── Cancel and refund points ──
      updatedRedemption = await prisma.$transaction(async (tx) => {
        const updated = await tx.redemption.update({
          where: { id: params.id },
          data: {
            status: "CANCELLED",
            staffNotes: staffNotes || null,
          },
        });

        // Refund points to customer
        await tx.profile.update({
          where: { id: redemption.customerId },
          data: { loyaltyPoints: { increment: redemption.pointsCost } },
        });

        // Create adjustment transaction
        await tx.loyaltyTransaction.create({
          data: {
            customerId: redemption.customerId,
            type: "ADJUSTMENT",
            points: redemption.pointsCost,
            description: `Refund: ${redemption.rewardLabel} redemption cancelled${
              staffNotes ? ` — ${staffNotes}` : ""
            }`,
          },
        });

        return updated;
      });
    }

    return NextResponse.json(updatedRedemption);
  } catch (error) {
    console.error("PATCH /api/redemptions/admin/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update redemption" },
      { status: 500 }
    );
  }
}
