import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import { getPusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import type { OrderCreatedEvent } from "@/types/app.types";

export const dynamic = "force-dynamic";

// ─── POST: Create New Order ─────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, customerId, guestName, guestPhone, guestSessionId } =
      parsed.data;

    // ── Auth check: if customerId is provided, verify it matches the session ──
    if (customerId) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: "Authentication required for customer orders" },
          { status: 401 }
        );
      }
      if ((session.user as any).id !== customerId) {
        return NextResponse.json(
          { error: "Forbidden: customerId does not match authenticated user" },
          { status: 403 }
        );
      }
    }

    // Determine phone number for rate limiting
    let phone: string | null = null;
    if (customerId) {
      const customer = await prisma.profile.findUnique({
        where: { id: customerId },
        select: { phone: true },
      });
      phone = customer?.phone ?? null;
    } else if (guestPhone) {
      phone = guestPhone;
    }

    // ── Rate Limit: max 3 orders per phone per hour (graceful when KV not configured) ──
    let rateLimited = false;
    if (phone) {
      try {
        const { kv } = await import("@vercel/kv");
        const rateLimitKey = `order-rate:${phone}`;
        const current = await kv.get<number>(rateLimitKey);

        if (current !== null && current >= 3) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              message:
                "Maximum 3 orders per hour. Please wait before placing another order.",
            },
            { status: 429 }
          );
        }

        if (current === null) {
          await kv.set(rateLimitKey, 1, { ex: 3600 });
        } else {
          await kv.incr(rateLimitKey);
        }
        rateLimited = true;
      } catch {
        // KV not configured — fall through to in-memory rate limiting
      }
    }

    if (!rateLimited) {
      // In-memory fallback rate limit
      const g = globalThis as unknown as { __orderRateLimit?: Map<string, { count: number; resetAt: number }> };
      if (!g.__orderRateLimit) g.__orderRateLimit = new Map();
      const key = customerId || guestPhone || 'unknown';
      const entry = g.__orderRateLimit.get(key);
      const now = Date.now();
      if (entry && entry.resetAt > now && entry.count >= 5) {
        return NextResponse.json({ error: "Too many orders. Please try again later." }, { status: 429 });
      }
      if (!entry || entry.resetAt <= now) {
        g.__orderRateLimit.set(key, { count: 1, resetAt: now + 60000 });
      } else {
        entry.count++;
      }
    }

    // ── Validate products exist and are in stock ──
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, inStock: true },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are unavailable or out of stock" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // ── Generate unique order number ──
    const orderNumber = generateOrderNumber();

    // ── Calculate total items ──
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // ── Create order + items in a transaction ──
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerId || null,
          guestSessionId: guestSessionId || null,
          guestName: guestName || null,
          guestPhone: guestPhone || null,
          status: "PENDING",
          totalItems,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          items: {
            create: items
              .map((item) => {
                const product = productMap.get(item.productId);
                if (!product) return null; // validated above
                return {
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPriceAtOrder: product.price,
                  productSnapshot: {
                    name: product.name,
                    price: product.price,
                    thcPercentage: product.thcPercentage,
                    cbdPercentage: product.cbdPercentage,
                    strainType: product.strainType,
                    weight: product.weight,
                    imageUrl: product.imageUrl,
                  },
                };
              })
              .filter(Boolean) as any[],
          },
        },
        include: {
          items: { include: { product: true } },
          customer: true,
          guestSession: true,
        },
      });

      // ── Decrement inventory for each ordered product ──
      for (const item of items) {
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
        if (updatedProduct.quantity <= 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { inStock: false },
          });
        }
      }

      // ── Create initial status history entry ──
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: "PENDING",
          note: "Order placed",
        },
      });

      return newOrder;
    });

    // ── Trigger Pusher event for admin dashboard (graceful) ──
    const pusher = getPusherServer();
    if (pusher) {
      const pusherPayload: OrderCreatedEvent = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName:
          order.customer?.name || order.guestName || "Guest",
        totalItems: order.totalItems,
        createdAt: order.createdAt.toISOString(),
      };

      await pusher
        .trigger(CHANNELS.adminOrders, EVENTS.orderCreated, pusherPayload)
        .catch((err) => console.error("Pusher trigger failed:", err));
    }

    // ── Trigger AI scoring (fire and forget) ──
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    fetch(`${baseUrl}/api/ai/score-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal-call": "true" },
      body: JSON.stringify({
        orderId: order.id,
        items: order.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.unitPriceAtOrder,
        })),
        customerTier: order.customer?.loyaltyTier || null,
        createdAt: order.createdAt.toISOString(),
        expiresAt: order.expiresAt?.toISOString() || null,
      }),
    }).catch((err) => {
      console.error("AI scoring trigger failed:", err);
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// ─── GET: List Orders (Admin) ───────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER", "STAFF"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: true } },
          customer: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
