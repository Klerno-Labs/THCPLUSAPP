import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { customerSignupSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

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

    const { name, phone, password, email } = parsed.data;

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

    const hashedPassword = await hash(password, 12);

    await prisma.profile.create({
      data: {
        name: name.trim(),
        phone: formattedPhone,
        email: email?.trim() || null,
        hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
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
