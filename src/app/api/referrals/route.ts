import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ─── Helper: generate referral code ─────────────────────
function generateReferralCode(name: string): string {
  const prefix = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const digits = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}${digits}`;
}

// ─── GET: Fetch referral info for current user ──────────
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get profile, generate referral code if missing
    let profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        referralCode: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Auto-generate referral code on first call
    if (!profile.referralCode) {
      let code = generateReferralCode(profile.name);

      // Ensure uniqueness (retry up to 5 times)
      let attempts = 0;
      while (attempts < 5) {
        const existing = await prisma.profile.findUnique({
          where: { referralCode: code },
        });
        if (!existing) break;
        code = generateReferralCode(profile.name);
        attempts++;
      }

      profile = await prisma.profile.update({
        where: { id: session.user.id },
        data: { referralCode: code },
        select: {
          id: true,
          name: true,
          referralCode: true,
        },
      });
    }

    // Get referral stats
    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      select: {
        id: true,
        pointsAwarded: true,
        createdAt: true,
      },
    });

    const referralCount = referrals.length;
    const totalPointsEarned = referrals.reduce(
      (sum, r) => sum + r.pointsAwarded,
      0
    );

    return NextResponse.json({
      referralCode: profile.referralCode,
      referralCount,
      totalPointsEarned,
    });
  } catch (error) {
    console.error("GET /api/referrals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral info" },
      { status: 500 }
    );
  }
}

// ─── POST: Apply a referral code ────────────────────────
const applyReferralSchema = z.object({
  code: z
    .string()
    .min(1, "Referral code is required")
    .max(20, "Invalid referral code"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = applyReferralSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { code } = parsed.data;
    const normalizedCode = code.toUpperCase().trim();

    // Find the referrer by code
    const referrer = await prisma.profile.findUnique({
      where: { referralCode: normalizedCode },
      select: { id: true, name: true },
    });

    if (!referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    // Cannot refer yourself
    if (referrer.id === userId) {
      return NextResponse.json(
        { error: "You cannot use your own referral code" },
        { status: 400 }
      );
    }

    // Check if user has already been referred
    const existingReferral = await prisma.referral.findUnique({
      where: { referredId: userId },
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: "You have already used a referral code" },
        { status: 400 }
      );
    }

    const POINTS_AWARDED = 10;

    // Atomic transaction: create referral + award points to both users
    await prisma.$transaction(async (tx) => {
      // Create the referral record
      await tx.referral.create({
        data: {
          referrerId: referrer.id,
          referredId: userId,
          pointsAwarded: POINTS_AWARDED,
        },
      });

      // Award points to the referrer
      await tx.profile.update({
        where: { id: referrer.id },
        data: { loyaltyPoints: { increment: POINTS_AWARDED } },
      });

      // Award points to the referred user
      await tx.profile.update({
        where: { id: userId },
        data: { loyaltyPoints: { increment: POINTS_AWARDED } },
      });

      // Create loyalty transaction for referrer
      await tx.loyaltyTransaction.create({
        data: {
          customerId: referrer.id,
          points: POINTS_AWARDED,
          type: "BONUS",
          description: "Referral bonus",
        },
      });

      // Create loyalty transaction for referred user
      await tx.loyaltyTransaction.create({
        data: {
          customerId: userId,
          points: POINTS_AWARDED,
          type: "BONUS",
          description: "Referral bonus",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Referral applied! You and ${referrer.name} each earned ${POINTS_AWARDED} bonus points.`,
      pointsAwarded: POINTS_AWARDED,
    });
  } catch (error) {
    console.error("POST /api/referrals error:", error);
    return NextResponse.json(
      { error: "Failed to apply referral code" },
      { status: 500 }
    );
  }
}
