import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import { prisma } from "@/lib/db";
import { sendSms } from "@/lib/twilio";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Clean and format the phone number
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      // Still return 200 to not reveal if phone exists
      return NextResponse.json({ success: true });
    }

    const formattedPhone = cleanPhone.startsWith("1")
      ? `+${cleanPhone}`
      : `+1${cleanPhone}`;

    // Look up the profile — but always return 200 regardless
    const profile = await prisma.profile.findUnique({
      where: { phone: formattedPhone },
    });

    if (profile) {
      // Generate a 6-digit numeric code
      const code = randomInt(100000, 999999).toString();

      // Try to store in Vercel KV with 10-minute TTL
      let stored = false;
      try {
        const { kv } = await import("@vercel/kv");
        await kv.set(`reset:${formattedPhone}`, code, { ex: 600 });
        stored = true;
      } catch (kvError) {
        console.warn(
          "[forgot-password] Vercel KV unavailable, using in-memory fallback:",
          kvError
        );
      }

      // Fallback: store in global memory (for development / when KV is unavailable)
      if (!stored) {
        const g = globalThis as unknown as {
          __resetCodes?: Map<string, { code: string; expiresAt: number }>;
        };
        if (!g.__resetCodes) {
          g.__resetCodes = new Map();
        }
        g.__resetCodes.set(formattedPhone, {
          code,
          expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        });
      }

      // Send the SMS
      await sendSms({
        to: formattedPhone,
        body: `Your THC Plus password reset code is: ${code}. It expires in 10 minutes.`,
      });
    }

    // Always return success to not reveal if the phone exists
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    // Still return 200 for security
    return NextResponse.json({ success: true });
  }
}
