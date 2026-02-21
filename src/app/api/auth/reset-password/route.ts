import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, newPassword } = body;

    if (!phone || !code || !newPassword) {
      return NextResponse.json(
        { error: "Phone, code, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Clean and format the phone number
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    const formattedPhone = cleanPhone.startsWith("1")
      ? `+${cleanPhone}`
      : `+1${cleanPhone}`;

    // Retrieve the stored code — try Vercel KV first, then in-memory fallback
    let storedCode: string | null = null;
    let usedKv = false;

    try {
      const { kv } = await import("@vercel/kv");
      storedCode = await kv.get<string>(`reset:${formattedPhone}`);
      usedKv = true;
    } catch {
      // KV unavailable — try in-memory fallback
      const g = globalThis as unknown as {
        __resetCodes?: Map<string, { code: string; expiresAt: number }>;
      };
      const entry = g.__resetCodes?.get(formattedPhone);
      if (entry && entry.expiresAt > Date.now()) {
        storedCode = entry.code;
      } else if (entry) {
        // Expired — clean up
        g.__resetCodes?.delete(formattedPhone);
      }
    }

    if (!storedCode || storedCode !== code) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    // Verify the profile exists
    const profile = await prisma.profile.findUnique({
      where: { phone: formattedPhone },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    // Hash the new password and update the profile
    const hashedPassword = await hash(newPassword, 12);

    await prisma.profile.update({
      where: { phone: formattedPhone },
      data: { hashedPassword },
    });

    // Delete the code after successful reset
    try {
      if (usedKv) {
        const { kv } = await import("@vercel/kv");
        await kv.del(`reset:${formattedPhone}`);
      } else {
        const g = globalThis as unknown as {
          __resetCodes?: Map<string, { code: string; expiresAt: number }>;
        };
        g.__resetCodes?.delete(formattedPhone);
      }
    } catch {
      // Non-critical — code will expire on its own
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
