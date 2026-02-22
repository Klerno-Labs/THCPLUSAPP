import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateOrderStatusSchema } from "@/lib/validations";
import { getPusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import {
  sendSms,
  getOrderReadySms,
  getOrderConfirmedSms,
  getOrderCancelledSms,
} from "@/lib/twilio";
import type { OrderStatusChangedEvent } from "@/types/app.types";

interface RouteContext {
  params: { id: string };
}

// ─── GET: Single Order ──────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: { select: { id: true, name: true, phone: true, loyaltyTier: true } },
        guestSession: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Staff can access any order; customers can only access their own
    const isStaff = ["OWNER", "MANAGER", "STAFF"].includes((session.user as any).role);
    if (!isStaff && order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`GET /api/orders/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update Order Status ─────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER", "STAFF"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, staffNotes, cancelReason, estimatedReadyTime } =
      parsed.data;

    // Fetch current order to get previous status
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (!currentOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const previousStatus = currentOrder.status;

    // Validate status transition
    const VALID_TRANSITIONS: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["PICKED_UP", "CANCELLED"],
      PICKED_UP: [],
      CANCELLED: [],
      EXPIRED: [],
    };

    const allowedNext = VALID_TRANSITIONS[previousStatus] || [];
    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 400 }
      );
    }

    // Build update data with relevant timestamps
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (staffNotes !== undefined) {
      updateData.staffNotes = staffNotes;
    }

    if (estimatedReadyTime) {
      const d = new Date(estimatedReadyTime);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid estimatedReadyTime date" }, { status: 400 });
      }
      updateData.estimatedReadyTime = d;
    }

    switch (status) {
      case "CONFIRMED":
        updateData.confirmedAt = new Date();
        break;
      case "READY":
        updateData.readyAt = new Date();
        break;
      case "PICKED_UP":
        updateData.pickedUpAt = new Date();
        break;
      case "CANCELLED":
        updateData.cancelledAt = new Date();
        if (cancelReason) {
          updateData.cancelReason = cancelReason;
        }
        break;
    }

    // Update order and create status history in a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          items: { include: { product: true } },
          customer: true,
          guestSession: true,
          statusHistory: { orderBy: { createdAt: "desc" } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          note:
            staffNotes ||
            `Status changed from ${previousStatus} to ${status}`,
        },
      });

      // ── Award loyalty points on pickup ──
      if (status === "PICKED_UP" && order.customerId) {
        const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
        const pointsEarned = Math.max(1, itemCount); // 1 point per item, minimum 1

        await tx.profile.update({
          where: { id: order.customerId },
          data: { loyaltyPoints: { increment: pointsEarned } },
        });

        await tx.loyaltyTransaction.create({
          data: {
            customerId: order.customerId,
            points: pointsEarned,
            type: "EARNED",
            description: `Earned ${pointsEarned} point${pointsEarned > 1 ? "s" : ""} for order #${order.orderNumber}`,
            orderId: order.id,
          },
        });
      }

      return order;
    });

    // ── Determine customer phone and language for SMS ──
    const customerPhone =
      updatedOrder.customer?.phone || updatedOrder.guestPhone;
    const language =
      updatedOrder.customer?.preferredLanguage || "en";

    // ── Send SMS based on status ──
    console.log(`[Order ${updatedOrder.orderNumber}] Status → ${status} | Phone: ${customerPhone || "none"} | Lang: ${language}`);

    if (customerPhone) {
      let smsBody: string | null = null;

      switch (status) {
        case "READY":
          smsBody = getOrderReadySms(updatedOrder.orderNumber, language);
          break;
        case "CONFIRMED":
          smsBody = getOrderConfirmedSms(
            updatedOrder.orderNumber,
            language
          );
          break;
        case "CANCELLED":
          smsBody = getOrderCancelledSms(
            updatedOrder.orderNumber,
            language
          );
          break;
      }

      if (smsBody) {
        const smsResult = await sendSms({ to: customerPhone, body: smsBody }).catch(
          (err) => {
            console.error("SMS send failed:", err);
            return { success: false, error: err };
          }
        );
        console.log(`[Order ${updatedOrder.orderNumber}] SMS result:`, JSON.stringify(smsResult));
      } else {
        console.log(`[Order ${updatedOrder.orderNumber}] No SMS for status "${status}"`);
      }
    } else {
      console.log(`[Order ${updatedOrder.orderNumber}] No phone — skipping SMS`);
    }

    // ── Trigger Pusher events (graceful when not configured) ──
    const pusher = getPusherServer();
    if (pusher) {
      const statusPayload: OrderStatusChangedEvent = {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        previousStatus,
        newStatus: status,
        updatedAt: updatedOrder.updatedAt.toISOString(),
      };

      await Promise.all([
        pusher.trigger(
          CHANNELS.order(updatedOrder.id),
          EVENTS.orderStatusChanged,
          statusPayload
        ),
        pusher.trigger(
          CHANNELS.adminOrders,
          EVENTS.orderStatusChanged,
          statusPayload
        ),
      ]).catch((err) => console.error("Pusher trigger failed:", err));
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`PATCH /api/orders/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
