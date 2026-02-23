import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { customerSignupSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const REFERRAL_SIGNUP_BONUS = 25; // Enough for a free pre-roll
const REFERRER_BONUS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = customerSignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, password, email, referralCode } = parsed.data;

    // Clean phone number — digits only
    const cleanPhone = phone.replace(/\D/g, "");

    const formattedPhone = cleanPhone.startsWith("1")
      ? `+${cleanPhone}`
      : `+1${cleanPhone}`;

    // Check if phone already exists
    const existing = await prisma.profile.findUnique({
      where: { phone: formattedPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this phone number already exists" },
        { status: 409 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await prisma.profile.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Validate referral code if provided
    let referrer: { id: string; name: string } | null = null;
    const trimmedCode = referralCode?.trim();
    if (trimmedCode) {
      const referrerProfile = await prisma.profile.findUnique({
        where: { referralCode: trimmedCode.toUpperCase() },
        select: { id: true, name: true },
      });
      if (!referrerProfile) {
        return NextResponse.json(
          { error: "Invalid referral code" },
          { status: 400 }
        );
      }
      referrer = referrerProfile;
    }

    const hashedPassword = await hash(password, 12);

    // Create the account with bonus points if referred
    const newUser = await prisma.profile.create({
      data: {
        name: name.trim(),
        phone: formattedPhone,
        email: email?.trim() || null,
        hashedPassword,
        loyaltyPoints: referrer ? REFERRAL_SIGNUP_BONUS : 0,
      },
    });

    // Process referral if code was valid
    if (referrer) {
      await prisma.$transaction([
        // Create referral record
        prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: newUser.id,
            pointsAwarded: REFERRAL_SIGNUP_BONUS,
          },
        }),
        // Log loyalty transaction for new user
        prisma.loyaltyTransaction.create({
          data: {
            customerId: newUser.id,
            points: REFERRAL_SIGNUP_BONUS,
            type: "BONUS",
            description: `Welcome bonus — referred by ${referrer.name}`,
          },
        }),
        // Award referrer their bonus
        prisma.profile.update({
          where: { id: referrer.id },
          data: { loyaltyPoints: { increment: REFERRER_BONUS } },
        }),
        // Log loyalty transaction for referrer
        prisma.loyaltyTransaction.create({
          data: {
            customerId: referrer.id,
            points: REFERRER_BONUS,
            type: "BONUS",
            description: `Referral bonus — ${name.trim()} joined`,
          },
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      referralApplied: !!referrer,
      bonusPoints: referrer ? REFERRAL_SIGNUP_BONUS : 0,
    });
  } catch (error: any) {
    console.error("POST /api/auth/signup error:", error);

    // Handle Prisma unique constraint violation (race condition)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this phone number or email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
