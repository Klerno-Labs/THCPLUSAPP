import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { formatDate } from "@/lib/utils";

// ─── GET: Export Analytics Report as PDF ────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // ── Build date filter ──
    const where: Record<string, unknown> = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    // ── Fetch analytics data ──
    const analyticsRecords = await prisma.analyticsDaily.findMany({
      where,
      orderBy: { date: "desc" },
    });

    if (analyticsRecords.length === 0) {
      return NextResponse.json(
        { error: "No analytics data found for the specified date range" },
        { status: 404 }
      );
    }

    // ── Compute aggregate metrics ──
    const totalOrders = analyticsRecords.reduce(
      (sum, r) => sum + r.totalOrders,
      0
    );
    const totalCompleted = analyticsRecords.reduce(
      (sum, r) => sum + r.completedOrders,
      0
    );
    const totalCancelled = analyticsRecords.reduce(
      (sum, r) => sum + r.cancelledOrders,
      0
    );
    const avgDailyOrders =
      analyticsRecords.length > 0
        ? (totalOrders / analyticsRecords.length).toFixed(1)
        : "0";
    const completionRate =
      totalOrders > 0
        ? ((totalCompleted / totalOrders) * 100).toFixed(1)
        : "0";

    // ── Aggregate top products across the range ──
    const productCounts = new Map<
      string,
      { name: string; quantity: number }
    >();
    for (const record of analyticsRecords) {
      const topProducts = record.topProducts as
        | Array<{ name: string; productId: string; quantity: number }>
        | null;
      if (topProducts && Array.isArray(topProducts)) {
        for (const p of topProducts) {
          const existing = productCounts.get(p.productId);
          if (existing) {
            existing.quantity += p.quantity;
          } else {
            productCounts.set(p.productId, {
              name: p.name,
              quantity: p.quantity,
            });
          }
        }
      }
    }

    const topProductsAgg = Array.from(productCounts.entries())
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 10)
      .map(([id, data]) => ({ productId: id, ...data }));

    // ── Collect all AI insights ──
    const allInsights: Array<{
      date: string;
      title: string;
      body: string;
      type: string;
    }> = [];
    for (const record of analyticsRecords) {
      const insights = record.aiInsights as
        | Array<{ title: string; body: string; type: string }>
        | null;
      if (insights && Array.isArray(insights)) {
        for (const insight of insights) {
          allInsights.push({
            date: formatDate(record.date),
            ...insight,
          });
        }
      }
    }

    // ── Peak hours frequency ──
    const peakHourCounts = new Map<number, number>();
    for (const record of analyticsRecords) {
      if (record.peakHour !== null) {
        peakHourCounts.set(
          record.peakHour,
          (peakHourCounts.get(record.peakHour) || 0) + 1
        );
      }
    }
    const mostCommonPeakHour = Array.from(peakHourCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // ── Generate PDF ──
    const { renderToBuffer, Document, Page, Text, View, StyleSheet } =
      await import("@react-pdf/renderer");
    const React = (await import("react")).default;

    const dateRange = [
      startDate ? formatDate(startDate) : "Beginning",
      endDate ? formatDate(endDate) : "Present",
    ].join(" - ");

    const styles = StyleSheet.create({
      page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
      header: { marginBottom: 24 },
      title: { fontSize: 24, fontWeight: "bold", color: "#16a34a" },
      subtitle: { fontSize: 12, color: "#666", marginTop: 4 },
      sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 8,
        color: "#1f2937",
        borderBottomWidth: 1,
        borderBottomColor: "#16a34a",
        paddingBottom: 4,
      },
      summaryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16,
      },
      summaryCard: {
        width: "33%",
        padding: 8,
        marginBottom: 8,
      },
      summaryLabel: { fontSize: 9, color: "#666" },
      summaryValue: { fontSize: 18, fontWeight: "bold", marginTop: 2 },
      tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f3f4f6",
        padding: 6,
        fontWeight: "bold",
        fontSize: 9,
      },
      tableRow: {
        flexDirection: "row",
        padding: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: "#e5e7eb",
        fontSize: 9,
      },
      insightCard: {
        padding: 10,
        marginBottom: 8,
        backgroundColor: "#f9fafb",
        borderLeftWidth: 3,
        borderLeftColor: "#16a34a",
      },
      insightTitle: { fontSize: 10, fontWeight: "bold" },
      insightBody: { fontSize: 9, color: "#4b5563", marginTop: 2 },
      insightDate: { fontSize: 8, color: "#9ca3af", marginTop: 2 },
      footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: "center",
        fontSize: 8,
        color: "#999",
      },
    });

    const PdfDocument = React.createElement(
      Document,
      null,
      // Page 1: Summary & Daily Breakdown
      React.createElement(
        Page,
        { size: "A4", style: styles.page },
        // Header
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(
            Text,
            { style: styles.title },
            "THC Plus Analytics"
          ),
          React.createElement(
            Text,
            { style: styles.subtitle },
            `Report Period: ${dateRange}`
          ),
          React.createElement(
            Text,
            { style: { ...styles.subtitle, fontSize: 9 } },
            `Generated: ${formatDate(new Date())} | ${analyticsRecords.length} day(s) of data`
          )
        ),
        // Summary Section
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Summary"
        ),
        React.createElement(
          View,
          { style: styles.summaryGrid },
          React.createElement(
            View,
            { style: styles.summaryCard },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Total Orders"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              String(totalOrders)
            )
          ),
          React.createElement(
            View,
            { style: styles.summaryCard },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Completed"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              String(totalCompleted)
            )
          ),
          React.createElement(
            View,
            { style: styles.summaryCard },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Cancelled"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              String(totalCancelled)
            )
          ),
          React.createElement(
            View,
            { style: styles.summaryCard },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Avg Daily Orders"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              avgDailyOrders
            )
          ),
          React.createElement(
            View,
            { style: styles.summaryCard },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Completion Rate"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              `${completionRate}%`
            )
          ),
          React.createElement(
            View,
            { style: styles.summaryCard },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Most Common Peak Hour"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              mostCommonPeakHour
                ? `${mostCommonPeakHour[0]}:00`
                : "N/A"
            )
          )
        ),
        // Top Products Section
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Top Products"
        ),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(
            Text,
            { style: { width: "10%" } },
            "Rank"
          ),
          React.createElement(
            Text,
            { style: { width: "60%" } },
            "Product"
          ),
          React.createElement(
            Text,
            { style: { width: "30%", textAlign: "right" } },
            "Units Sold"
          )
        ),
        ...topProductsAgg.map((product, i) =>
          React.createElement(
            View,
            {
              key: product.productId,
              style: {
                ...styles.tableRow,
                backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa",
              },
            },
            React.createElement(
              Text,
              { style: { width: "10%" } },
              `#${i + 1}`
            ),
            React.createElement(
              Text,
              { style: { width: "60%" } },
              product.name
            ),
            React.createElement(
              Text,
              { style: { width: "30%", textAlign: "right" } },
              String(product.quantity)
            )
          )
        ),
        // Daily Breakdown
        React.createElement(
          Text,
          { style: styles.sectionTitle },
          "Daily Breakdown"
        ),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(
            Text,
            { style: { width: "25%" } },
            "Date"
          ),
          React.createElement(
            Text,
            { style: { width: "15%", textAlign: "center" } },
            "Orders"
          ),
          React.createElement(
            Text,
            { style: { width: "15%", textAlign: "center" } },
            "Completed"
          ),
          React.createElement(
            Text,
            { style: { width: "15%", textAlign: "center" } },
            "Cancelled"
          ),
          React.createElement(
            Text,
            { style: { width: "15%", textAlign: "center" } },
            "Peak Hr"
          ),
          React.createElement(
            Text,
            { style: { width: "15%", textAlign: "center" } },
            "Rate"
          )
        ),
        ...analyticsRecords.slice(0, 30).map((record, i) =>
          React.createElement(
            View,
            {
              key: record.id,
              style: {
                ...styles.tableRow,
                backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa",
              },
            },
            React.createElement(
              Text,
              { style: { width: "25%" } },
              formatDate(record.date)
            ),
            React.createElement(
              Text,
              { style: { width: "15%", textAlign: "center" } },
              String(record.totalOrders)
            ),
            React.createElement(
              Text,
              { style: { width: "15%", textAlign: "center" } },
              String(record.completedOrders)
            ),
            React.createElement(
              Text,
              { style: { width: "15%", textAlign: "center" } },
              String(record.cancelledOrders)
            ),
            React.createElement(
              Text,
              { style: { width: "15%", textAlign: "center" } },
              record.peakHour !== null ? `${record.peakHour}:00` : "-"
            ),
            React.createElement(
              Text,
              { style: { width: "15%", textAlign: "center" } },
              record.totalOrders > 0
                ? `${((record.completedOrders / record.totalOrders) * 100).toFixed(0)}%`
                : "-"
            )
          )
        ),
        // Footer
        React.createElement(
          Text,
          { style: styles.footer },
          "THC Plus | 8302 N Eldridge Pkwy, Houston, TX | Confidential"
        )
      ),
      // Page 2: AI Insights (if any)
      allInsights.length > 0
        ? React.createElement(
            Page,
            { size: "A4", style: styles.page },
            React.createElement(
              Text,
              { style: styles.sectionTitle },
              "AI-Generated Insights"
            ),
            ...allInsights.slice(0, 20).map((insight, i) =>
              React.createElement(
                View,
                { key: `insight-${i}`, style: styles.insightCard },
                React.createElement(
                  Text,
                  { style: styles.insightTitle },
                  insight.title
                ),
                React.createElement(
                  Text,
                  { style: styles.insightBody },
                  insight.body
                ),
                React.createElement(
                  Text,
                  { style: styles.insightDate },
                  insight.date
                )
              )
            ),
            React.createElement(
              Text,
              { style: styles.footer },
              "THC Plus | 8302 N Eldridge Pkwy, Houston, TX | Confidential"
            )
          )
        : null
    );

    const pdfBuffer = await renderToBuffer(PdfDocument as any);

    // ── Upload to Vercel Blob ──
    const filename = `exports/analytics-report-${new Date().toISOString().split("T")[0]}-${Date.now()}.pdf`;
    const blob = await put(filename, pdfBuffer, {
      access: "public",
      contentType: "application/pdf",
    });

    return NextResponse.json({
      url: blob.url,
      filename,
      daysIncluded: analyticsRecords.length,
      summary: {
        totalOrders,
        totalCompleted,
        totalCancelled,
        completionRate: `${completionRate}%`,
        avgDailyOrders,
      },
    });
  } catch (error) {
    console.error("GET /api/export/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to export analytics report" },
      { status: 500 }
    );
  }
}
