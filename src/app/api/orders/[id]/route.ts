import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateOrderStatusSchema } from "@/lib/validations";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
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
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        customer: true,
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

    // Build update data with relevant timestamps
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (staffNotes !== undefined) {
      updateData.staffNotes = staffNotes;
    }

    if (estimatedReadyTime) {
      updateData.estimatedReadyTime = new Date(estimatedReadyTime);
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

      return order;
    });

    // ── Determine customer phone and language for SMS ──
    const customerPhone =
      updatedOrder.customer?.phone || updatedOrder.guestPhone;
    const language =
      updatedOrder.customer?.preferredLanguage || "en";

    // ── Send SMS based on status ──
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
        await sendSms({ to: customerPhone, body: smsBody }).catch(
          (err) => {
            console.error("SMS send failed:", err);
          }
        );
      }
    }

    // ── Trigger Pusher events ──
    const statusPayload: OrderStatusChangedEvent = {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      previousStatus,
      newStatus: status,
      updatedAt: updatedOrder.updatedAt.toISOString(),
    };

    await Promise.all([
      pusherServer.trigger(
        CHANNELS.order(updatedOrder.id),
        EVENTS.orderStatusChanged,
        statusPayload
      ),
      pusherServer.trigger(
        CHANNELS.adminOrders,
        EVENTS.orderStatusChanged,
        statusPayload
      ),
    ]);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`PATCH /api/orders/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
