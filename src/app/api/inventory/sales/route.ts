import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── GET: Sales & Profit Data (Owner Only) ─────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date filter
    let dateFrom: Date | null = null;
    const now = new Date();
    switch (range) {
      case "today":
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "7d":
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "all":
        dateFrom = null;
        break;
      default:
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch completed orders (PICKED_UP = fully completed sale)
    const completedOrders = await prisma.order.findMany({
      where: {
        status: "PICKED_UP",
        ...(dateFrom ? { pickedUpAt: { gte: dateFrom } } : {}),
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                costPrice: true,
                category: { select: { nameEn: true } },
                weight: true,
              },
            },
          },
        },
        customer: { select: { name: true } },
      },
      orderBy: { pickedUpAt: "desc" },
    });

    // ─── Per-Product Sales Aggregation ──────────────────────
    const productSalesMap = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        weight: string | null;
        costPrice: number | null;
        unitsSold: number;
        revenue: number;
        totalCost: number | null;
      }
    >();

    for (const order of completedOrders) {
      for (const item of order.items) {
        const existing = productSalesMap.get(item.productId);
        const itemRevenue = item.unitPriceAtOrder * item.quantity;
        const itemCost =
          item.product.costPrice != null
            ? item.product.costPrice * item.quantity
            : null;

        if (existing) {
          existing.unitsSold += item.quantity;
          existing.revenue += itemRevenue;
          if (itemCost != null) {
            existing.totalCost =
              (existing.totalCost ?? 0) + itemCost;
          }
        } else {
          productSalesMap.set(item.productId, {
            id: item.productId,
            name: item.product.name,
            category: item.product.category.nameEn,
            weight: item.product.weight,
            costPrice: item.product.costPrice,
            unitsSold: item.quantity,
            revenue: itemRevenue,
            totalCost: itemCost,
          });
        }
      }
    }

    const productSales = Array.from(productSalesMap.values()).map((p) => ({
      ...p,
      revenue: Math.round(p.revenue * 100) / 100,
      totalCost: p.totalCost != null ? Math.round(p.totalCost * 100) / 100 : null,
      profit:
        p.totalCost != null
          ? Math.round((p.revenue - p.totalCost) * 100) / 100
          : null,
      margin:
        p.totalCost != null && p.revenue > 0
          ? Math.round(((p.revenue - p.totalCost) / p.revenue) * 100)
          : null,
    }));

    // Sort by revenue desc
    productSales.sort((a, b) => b.revenue - a.revenue);

    // ─── Per-Order Breakdown ────────────────────────────────
    const orderBreakdown = completedOrders.map((order) => {
      let orderRevenue = 0;
      let orderCost: number | null = 0;
      let hasCostData = false;

      const items = order.items.map((item) => {
        const lineRevenue = item.unitPriceAtOrder * item.quantity;
        const lineCost =
          item.product.costPrice != null
            ? item.product.costPrice * item.quantity
            : null;

        orderRevenue += lineRevenue;
        if (lineCost != null) {
          orderCost = (orderCost ?? 0) + lineCost;
          hasCostData = true;
        }

        return {
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPriceAtOrder,
          lineRevenue: Math.round(lineRevenue * 100) / 100,
          lineCost: lineCost != null ? Math.round(lineCost * 100) / 100 : null,
          lineProfit:
            lineCost != null
              ? Math.round((lineRevenue - lineCost) * 100) / 100
              : null,
        };
      });

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.name ?? order.guestName ?? "Guest",
        pickedUpAt: order.pickedUpAt?.toISOString() ?? order.createdAt.toISOString(),
        totalItems: order.totalItems,
        revenue: Math.round(orderRevenue * 100) / 100,
        cost: hasCostData ? Math.round((orderCost ?? 0) * 100) / 100 : null,
        profit: hasCostData
          ? Math.round((orderRevenue - (orderCost ?? 0)) * 100) / 100
          : null,
        items,
      };
    });

    // ─── Summary KPIs ──────────────────────────────────────
    const totalOrders = completedOrders.length;
    const totalUnitsSold = productSales.reduce((s, p) => s + p.unitsSold, 0);
    const totalRevenue = productSales.reduce((s, p) => s + p.revenue, 0);
    const productsWithCost = productSales.filter((p) => p.totalCost != null);
    const totalCost = productsWithCost.reduce(
      (s, p) => s + (p.totalCost ?? 0),
      0
    );
    const totalProfit =
      productsWithCost.length > 0
        ? Math.round((totalRevenue - totalCost) * 100) / 100
        : null;
    const avgMargin =
      productsWithCost.length > 0 && totalRevenue > 0
        ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100)
        : null;

    return NextResponse.json({
      summary: {
        totalOrders,
        totalUnitsSold,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfit,
        avgMargin,
      },
      productSales,
      orders: orderBreakdown,
    });
  } catch (error) {
    console.error("GET /api/inventory/sales error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
}
