import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRewardByKey, meetsMinTier } from "@/lib/rewards";
import { redeemRewardSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// ─── GET: Fetch Customer's Redemptions ───────────────────
export async function GET() {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user as any).role !== "CUSTOMER"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redemptions = await prisma.redemption.findMany({
      where: { customerId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(redemptions);
  } catch (error) {
    console.error("GET /api/redemptions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch redemptions" },
      { status: 500 }
    );
  }
}

// ─── POST: Redeem a Reward ───────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      (session.user as any).role !== "CUSTOMER"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = redeemRewardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { rewardKey } = parsed.data;

    // ── Look up reward ──
    const reward = getRewardByKey(rewardKey);
    if (!reward) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      );
    }

    // ── Fetch customer profile ──
    const profile = await prisma.profile.findUnique({
      where: { id: (session.user as any).id },
    });
    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // ── Validate enough points ──
    if (profile.loyaltyPoints < reward.pointsCost) {
      return NextResponse.json(
        { error: "Insufficient loyalty points" },
        { status: 400 }
      );
    }

    // ── Validate tier requirement ──
    if (!meetsMinTier(profile.loyaltyTier, reward.minTier)) {
      return NextResponse.json(
        { error: "Your loyalty tier does not meet the minimum requirement" },
        { status: 403 }
      );
    }

    // ── Check no existing PENDING redemption for same reward ──
    const existingPending = await prisma.redemption.findFirst({
      where: {
        customerId: (session.user as any).id,
        rewardKey,
        status: "PENDING",
      },
    });
    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending redemption for this reward" },
        { status: 409 }
      );
    }

    // ── Create redemption in transaction ──
    const redemption = await prisma.$transaction(async (tx) => {
      // Decrement loyalty points
      await tx.profile.update({
        where: { id: (session.user as any).id },
        data: { loyaltyPoints: { decrement: reward.pointsCost } },
      });

      // Create loyalty transaction
      await tx.loyaltyTransaction.create({
        data: {
          customerId: (session.user as any).id,
          type: "REDEEMED",
          points: -reward.pointsCost,
          description: `Redeemed: ${reward.label}`,
        },
      });

      // Create redemption
      const newRedemption = await tx.redemption.create({
        data: {
          customerId: (session.user as any).id,
          rewardKey: reward.key,
          rewardLabel: reward.label,
          pointsCost: reward.pointsCost,
          status: "PENDING",
          expiresAt: new Date(
            Date.now() + reward.expirationDays * 24 * 60 * 60 * 1000
          ),
        },
      });

      return newRedemption;
    });

    return NextResponse.json(redemption, { status: 201 });
  } catch (error) {
    console.error("POST /api/redemptions error:", error);
    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    );
  }
}
