import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── GET: Expire Old Redemptions (Vercel Cron) ──────────
export async function GET(request: NextRequest) {
  try {
    // ── Verify cron secret ──
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // ── Find all expired pending redemptions ──
    const expiredRedemptions = await prisma.redemption.findMany({
      where: {
        status: "PENDING",
        expiresAt: {
          lt: now,
        },
      },
    });

    if (expiredRedemptions.length === 0) {
      return NextResponse.json({
        message: "No redemptions to expire",
        count: 0,
      });
    }

    // ── Expire each redemption and refund points ──
    for (const redemption of expiredRedemptions) {
      await prisma.$transaction(async (tx) => {
        // Update redemption status to EXPIRED
        await tx.redemption.update({
          where: { id: redemption.id },
          data: { status: "EXPIRED" },
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
            description: `Refund: ${redemption.rewardLabel} redemption expired`,
          },
        });
      });
    }

    return NextResponse.json({
      message: `Expired ${expiredRedemptions.length} redemption(s)`,
      count: expiredRedemptions.length,
    });
  } catch (error) {
    console.error("GET /api/cron/expire-redemptions error:", error);
    return NextResponse.json(
      { error: "Failed to expire redemptions" },
      { status: 500 }
    );
  }
}
