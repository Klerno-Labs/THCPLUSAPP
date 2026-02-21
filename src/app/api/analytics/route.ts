import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// ─── GET: Analytics Dashboard Data ──────────────────────
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
    const range = searchParams.get("range") || "7d";

    // Calculate date range
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    let daysBack = 7;
    if (range === "30d") daysBack = 30;
    else if (range === "90d") daysBack = 90;
    else if (range === "1y") daysBack = 365;

    const rangeStart = new Date(startOfToday);
    rangeStart.setDate(rangeStart.getDate() - daysBack);

    // ── KPIs ──
    const [todayOrders, todayCompleted, activeOrders, yesterdayOrders] =
      await Promise.all([
        prisma.order.count({
          where: { createdAt: { gte: startOfToday } },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: startOfToday },
            status: "PICKED_UP",
          },
        }),
        prisma.order.count({
          where: {
            status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] },
          },
        }),
        prisma.order.count({
          where: {
            createdAt: {
              gte: new Date(startOfToday.getTime() - 86400000),
              lt: startOfToday,
            },
          },
        }),
      ]);

    // Avg processing time (confirmedAt to readyAt for today's completed orders)
    const completedWithTimes = await prisma.order.findMany({
      where: {
        createdAt: { gte: startOfToday },
        readyAt: { not: null },
        confirmedAt: { not: null },
      },
      select: { confirmedAt: true, readyAt: true },
    });

    let avgProcessingMin = 0;
    if (completedWithTimes.length > 0) {
      const totalMs = completedWithTimes.reduce((sum, o) => {
        return sum + (o.readyAt!.getTime() - o.confirmedAt!.getTime());
      }, 0);
      avgProcessingMin = Math.round(
        totalMs / completedWithTimes.length / 60000
      );
    }

    const kpis = {
      todayOrders,
      todayCompleted,
      activeOrders,
      avgProcessingMin,
      todayChange:
        yesterdayOrders > 0
          ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100
          : 0,
    };

    // ── Timeseries: Daily order counts ──
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: rangeStart } },
      select: { createdAt: true, status: true },
    });

    const dailyMap = new Map<
      string,
      { orders: number; completed: number }
    >();
    for (let d = 0; d < daysBack; d++) {
      const date = new Date(startOfToday);
      date.setDate(date.getDate() - d);
      const key = date.toISOString().split("T")[0];
      dailyMap.set(key, { orders: 0, completed: 0 });
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().split("T")[0];
      const entry = dailyMap.get(key);
      if (entry) {
        entry.orders++;
        if (order.status === "PICKED_UP") {
          entry.completed++;
        }
      }
    }

    const timeseries = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ── Top Products ──
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { createdAt: { gte: rangeStart } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    const productIds = topProducts.map((tp) => tp.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productNameMap = new Map(products.map((p) => [p.id, p.name]));

    const topProductsData = topProducts.map((tp) => ({
      name: productNameMap.get(tp.productId) || "Unknown",
      sales: tp._sum.quantity || 0,
    }));

    // ── Completion Breakdown ──
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: rangeStart } },
      _count: true,
    });

    const completion = {
      completed:
        statusCounts.find((s) => s.status === "PICKED_UP")?._count || 0,
      cancelled:
        statusCounts.find((s) => s.status === "CANCELLED")?._count || 0,
      expired:
        statusCounts.find((s) => s.status === "EXPIRED")?._count || 0,
      pending:
        (statusCounts.find((s) => s.status === "PENDING")?._count || 0) +
        (statusCounts.find((s) => s.status === "CONFIRMED")?._count || 0) +
        (statusCounts.find((s) => s.status === "PREPARING")?._count || 0) +
        (statusCounts.find((s) => s.status === "READY")?._count || 0),
    };

    // ── Category Breakdown ──
    const categoryBreakdown = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { createdAt: { gte: rangeStart } } },
      _sum: { quantity: true },
    });

    const allProducts = await prisma.product.findMany({
      where: {
        id: { in: categoryBreakdown.map((cb) => cb.productId) },
      },
      select: { id: true, category: { select: { nameEn: true } } },
    });
    const productCatMap = new Map(
      allProducts.map((p) => [p.id, p.category.nameEn])
    );

    const catTotals = new Map<string, number>();
    for (const item of categoryBreakdown) {
      const cat = productCatMap.get(item.productId) || "Other";
      catTotals.set(cat, (catTotals.get(cat) || 0) + (item._sum.quantity || 0));
    }

    const categories = Array.from(catTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // ── AI Insights (from AnalyticsDaily) ──
    const recentAnalytics = await prisma.analyticsDaily.findMany({
      where: {
        aiInsights: { not: Prisma.DbNull },
      },
      orderBy: { date: "desc" },
      take: 5,
      select: { aiInsights: true, date: true },
    });

    const aiInsights: Array<{
      title: string;
      body: string;
      type: string;
    }> = [];
    for (const record of recentAnalytics) {
      const insights = record.aiInsights as
        | Array<{ title: string; body: string; type: string }>
        | null;
      if (insights && Array.isArray(insights)) {
        aiInsights.push(...insights);
      }
    }

    return NextResponse.json({
      kpis,
      timeseries,
      topProducts: topProductsData,
      completion,
      categories,
      aiInsights: aiInsights.slice(0, 6),
    });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
