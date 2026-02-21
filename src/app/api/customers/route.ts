import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// ─── GET: List Customers ────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["OWNER", "MANAGER"].includes((session.user as any).role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: Prisma.ProfileWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const customers = await prisma.profile.findMany({
      where,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        staffNotes: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalItems: true,
            createdAt: true,
            items: {
              select: {
                unitPriceAtOrder: true,
                quantity: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to include computed fields
    const result = customers.map((c) => {
      const totalSpent = c.orders.reduce(
        (sum, o) =>
          sum +
          o.items.reduce(
            (itemSum, item) => itemSum + item.unitPriceAtOrder * item.quantity,
            0
          ),
        0
      );
      const lastOrder = c.orders[0];

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        loyaltyTier: c.loyaltyTier,
        loyaltyPoints: c.loyaltyPoints,
        staffNotes: c.staffNotes || "",
        totalOrders: c._count.orders,
        totalSpent,
        joinedAt: c.createdAt.toISOString(),
        lastOrderAt: lastOrder?.createdAt.toISOString() || null,
        orders: c.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          itemCount: o.totalItems,
          total: o.items.reduce(
            (sum, item) => sum + item.unitPriceAtOrder * item.quantity,
            0
          ),
          date: o.createdAt.toISOString(),
        })),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
