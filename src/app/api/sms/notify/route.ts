import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendSms } from "@/lib/twilio";
import { z } from "zod";

const smsNotifySchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
  message: z.string().min(1, "Message is required").max(1600),
});

// ─── POST: Send SMS Notification ────────────────────────
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER", "STAFF"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = smsNotifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { phone, message } = parsed.data;

    const result = await sendSms({ to: phone, body: message });

    if (result.success) {
      return NextResponse.json({
        success: true,
        sid: result.sid,
        message: "SMS sent successfully",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send SMS",
      },
      { status: 502 }
    );
  } catch (error) {
    console.error("POST /api/sms/notify error:", error);
    return NextResponse.json(
      { error: "Failed to send SMS notification" },
      { status: 500 }
    );
  }
}
