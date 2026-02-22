import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── POST: Cron job — deactivate expired deals ──────────
// Secured by CRON_SECRET environment variable
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[CRON] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Deactivate deals that have ended and are still active
    const result = await prisma.deal.updateMany({
      where: {
        isActive: true,
        endsAt: { lt: now },
      },
      data: {
        isActive: false,
      },
    });

    console.log(
      `[CRON] Expired ${result.count} deal(s) at ${now.toISOString()}`
    );

    return NextResponse.json({
      success: true,
      expiredCount: result.count,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("[CRON /api/cron/expire-deals]", error);
    return NextResponse.json(
      { error: "Failed to expire deals" },
      { status: 500 }
    );
  }
}
