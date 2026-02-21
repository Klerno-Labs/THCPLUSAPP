import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculateLoyaltyTier } from "@/lib/utils";
import type { LoyaltyTier } from "@prisma/client";

export const dynamic = "force-dynamic";

// ─── GET: Recalculate Loyalty Tiers (Vercel Cron) ───────
export async function GET(request: NextRequest) {
  try {
    // ── Verify cron secret ──
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Get all profiles with loyalty points ──
    const profiles = await prisma.profile.findMany({
      select: {
        id: true,
        loyaltyPoints: true,
        loyaltyTier: true,
      },
    });

    let updatedCount = 0;
    const updates: Array<{ id: string; newTier: LoyaltyTier }> = [];

    // ── Calculate correct tier for each profile ──
    for (const profile of profiles) {
      const correctTier = calculateLoyaltyTier(
        profile.loyaltyPoints
      ) as LoyaltyTier;

      if (correctTier !== profile.loyaltyTier) {
        updates.push({ id: profile.id, newTier: correctTier });
      }
    }

    // ── Batch update changed tiers ──
    if (updates.length > 0) {
      // Group updates by target tier for efficient batch operations
      const tierGroups = new Map<LoyaltyTier, string[]>();

      for (const update of updates) {
        const existing = tierGroups.get(update.newTier) || [];
        existing.push(update.id);
        tierGroups.set(update.newTier, existing);
      }

      await prisma.$transaction(
        Array.from(tierGroups.entries()).map(([tier, ids]) =>
          prisma.profile.updateMany({
            where: { id: { in: ids } },
            data: { loyaltyTier: tier },
          })
        )
      );

      updatedCount = updates.length;
    }

    return NextResponse.json({
      message: `Loyalty tier recalculation complete`,
      totalProfiles: profiles.length,
      updatedCount,
      updates: updates.map((u) => ({
        profileId: u.id,
        newTier: u.newTier,
      })),
    });
  } catch (error) {
    console.error("GET /api/cron/loyalty-tiers error:", error);
    return NextResponse.json(
      { error: "Failed to recalculate loyalty tiers" },
      { status: 500 }
    );
  }
}
