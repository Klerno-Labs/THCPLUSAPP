import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai, ANALYTICS_INSIGHTS_PROMPT } from "@/lib/openai";

export const dynamic = "force-dynamic";

// ─── GET: Generate AI Analytics Insights (Nightly Cron) ─
export async function GET(request: NextRequest) {
  try {
    // ── Verify cron secret ──
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Determine yesterday's date range ──
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfDay = new Date(yesterday);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(yesterday);
    endOfDay.setHours(23, 59, 59, 999);

    // ── Aggregate yesterday's order data ──
    const [
      totalOrders,
      completedOrders,
      cancelledOrders,
      expiredOrders,
      ordersByHour,
      topProductItems,
    ] = await Promise.all([
      // Total orders placed yesterday
      prisma.order.count({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      }),

      // Completed (picked up)
      prisma.order.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: "PICKED_UP",
        },
      }),

      // Cancelled
      prisma.order.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: "CANCELLED",
        },
      }),

      // Expired
      prisma.order.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          status: "EXPIRED",
        },
      }),

      // Orders by hour for peak hour detection
      prisma.$queryRaw<Array<{ hour: number; count: bigint }>>`
        SELECT EXTRACT(HOUR FROM "createdAt") as hour, COUNT(*) as count
        FROM "Order"
        WHERE "createdAt" >= ${startOfDay} AND "createdAt" <= ${endOfDay}
        GROUP BY EXTRACT(HOUR FROM "createdAt")
        ORDER BY count DESC
      `,

      // Top products by order count
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: { createdAt: { gte: startOfDay, lte: endOfDay } },
        },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
    ]);

    // ── Enrich top products with names ──
    const productIds = topProductItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const topProducts = topProductItems.map((item) => {
      const product = productMap.get(item.productId);
      return {
        productId: item.productId,
        name: product?.name || "Unknown",
        quantity: item._sum.quantity || 0,
        price: product?.price || 0,
      };
    });

    // ── Determine peak hour ──
    const peakHourData = ordersByHour.length > 0 ? ordersByHour[0] : null;
    const peakHour = peakHourData ? Number(peakHourData.hour) : null;

    // ── Format hourly breakdown for AI ──
    const hourlyBreakdown = ordersByHour
      .map(
        (h) =>
          `${Number(h.hour).toString().padStart(2, "0")}:00 - ${Number(h.count)} orders`
      )
      .join("\n");

    const topProductsSummary = topProducts
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} - ${p.quantity} units ($${p.price.toFixed(2)} each)`
      )
      .join("\n");

    // ── Send to GPT-4o for insight generation ──
    const dataPrompt = `YESTERDAY'S DATA (${startOfDay.toISOString().split("T")[0]}):

SUMMARY:
- Total orders: ${totalOrders}
- Completed (picked up): ${completedOrders}
- Cancelled: ${cancelledOrders}
- Expired: ${expiredOrders}
- Completion rate: ${totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0}%
- Peak hour: ${peakHour !== null ? `${peakHour}:00` : "N/A"}

ORDERS BY HOUR:
${hourlyBreakdown || "No data"}

TOP PRODUCTS:
${topProductsSummary || "No data"}

Provide 3-5 actionable insights as a JSON array: [{ "title": "...", "body": "...", "type": "info|warning|success|tip" }]`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: ANALYTICS_INSIGHTS_PROMPT },
        { role: "user", content: dataPrompt },
      ],
      temperature: 0.5,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    let insights: Array<{
      title: string;
      body: string;
      type: string;
    }> = [];

    try {
      const parsed = JSON.parse(rawContent);
      insights = parsed.insights || parsed;
      if (!Array.isArray(insights)) {
        insights = [];
      }
    } catch {
      console.error("Failed to parse AI insights:", rawContent);
    }

    // ── Save to AnalyticsDaily ──
    const analyticsRecord = await prisma.analyticsDaily.upsert({
      where: { date: startOfDay },
      update: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        topProducts: topProducts as any,
        peakHour,
        aiInsights: insights as any,
      },
      create: {
        date: startOfDay,
        totalOrders,
        completedOrders,
        cancelledOrders,
        topProducts: topProducts as any,
        peakHour,
        aiInsights: insights as any,
      },
    });

    return NextResponse.json({
      message: "AI insights generated successfully",
      date: startOfDay.toISOString().split("T")[0],
      summary: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        expiredOrders,
        peakHour,
      },
      topProducts,
      insights,
      analyticsId: analyticsRecord.id,
    });
  } catch (error) {
    console.error("GET /api/cron/ai-insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI insights" },
      { status: 500 }
    );
  }
}
