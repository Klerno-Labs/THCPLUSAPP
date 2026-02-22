import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendSms, getOrderExpiredSms } from "@/lib/twilio";

export const dynamic = "force-dynamic";

// ─── GET: Expire Old Orders (Vercel Cron) ───────────────
export async function GET(request: NextRequest) {
  try {
    // ── Verify cron secret ──
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // ── Find expired orders ──
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: {
          notIn: ["PICKED_UP", "CANCELLED", "EXPIRED"],
        },
        expiresAt: {
          lt: now,
        },
      },
      include: {
        customer: {
          select: { phone: true, preferredLanguage: true },
        },
      },
    });

    if (expiredOrders.length === 0) {
      return NextResponse.json({
        message: "No orders to expire",
        count: 0,
      });
    }

    // ── Batch update all expired orders ──
    const orderIds = expiredOrders.map((o) => o.id);

    await prisma.$transaction(async (tx) => {
      // Update all orders to EXPIRED status
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "EXPIRED" },
      });

      // Create status history entries for each order
      await tx.orderStatusHistory.createMany({
        data: orderIds.map((orderId) => ({
          orderId,
          status: "EXPIRED" as const,
          note: "Automatically expired - pickup window elapsed",
        })),
      });
    });

    // ── Send expiry SMS to each customer (fire and forget) ──
    const smsPromises = expiredOrders.map(async (order) => {
      const phone = order.customer?.phone || order.guestPhone;
      if (!phone) return null;

      const language = order.customer?.preferredLanguage || "en";
      const smsBody = getOrderExpiredSms(order.orderNumber, language);

      return sendSms({ to: phone, body: smsBody }).catch((err) => {
        console.error(
          `Failed to send expiry SMS for order ${order.orderNumber}:`,
          err
        );
      });
    });

    await Promise.allSettled(smsPromises);

    return NextResponse.json({
      message: `Expired ${expiredOrders.length} order(s)`,
      count: expiredOrders.length,
      orderNumbers: expiredOrders.map((o) => o.orderNumber),
    });
  } catch (error) {
    console.error("GET /api/cron/expire-orders error:", error);
    return NextResponse.json(
      { error: "Failed to expire orders" },
      { status: 500 }
    );
  }
}
