import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { formatDate, formatTime, formatPrice, getOrderStatusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

// ─── GET: Export Orders as CSV or PDF ───────────────────
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const format = searchParams.get("format") || "csv";

    // ── Build date filter ──
    const where: Record<string, unknown> = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
      }
    }

    // ── Fetch orders ──
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        customer: { select: { name: true, phone: true, loyaltyTier: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      return generateCsvResponse(orders);
    }

    if (format === "pdf") {
      return await generatePdfResponse(orders, startDate, endDate);
    }

    return NextResponse.json(
      { error: "Invalid format. Use 'csv' or 'pdf'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /api/export/orders error:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
}

// ─── CSV Generation ─────────────────────────────────────
function generateCsvResponse(orders: any[]) {
  const headers = [
    "Order Number",
    "Status",
    "Customer Name",
    "Customer Phone",
    "Loyalty Tier",
    "Total Items",
    "Items Detail",
    "Order Total",
    "AI Score",
    "Created At",
    "Confirmed At",
    "Ready At",
    "Picked Up At",
    "Cancelled At",
    "Expires At",
    "Staff Notes",
    "Cancel Reason",
  ];

  const rows = orders.map((order) => {
    const customerName =
      order.customer?.name || order.guestName || "Guest";
    const customerPhone =
      order.customer?.phone || order.guestPhone || "";
    const loyaltyTier = order.customer?.loyaltyTier || "N/A";

    const itemsDetail = order.items
      .map(
        (item: any) =>
          `${item.product.name} x${item.quantity} @ ${formatPrice(item.unitPriceAtOrder)}`
      )
      .join("; ");

    const orderTotal = order.items.reduce(
      (sum: number, item: any) =>
        sum + item.unitPriceAtOrder * item.quantity,
      0
    );

    return [
      order.orderNumber,
      getOrderStatusLabel(order.status),
      customerName,
      customerPhone,
      loyaltyTier,
      order.totalItems,
      itemsDetail,
      formatPrice(orderTotal),
      order.aiPriorityScore ?? "N/A",
      order.createdAt ? `${formatDate(order.createdAt)} ${formatTime(order.createdAt)}` : "",
      order.confirmedAt ? `${formatDate(order.confirmedAt)} ${formatTime(order.confirmedAt)}` : "",
      order.readyAt ? `${formatDate(order.readyAt)} ${formatTime(order.readyAt)}` : "",
      order.pickedUpAt ? `${formatDate(order.pickedUpAt)} ${formatTime(order.pickedUpAt)}` : "",
      order.cancelledAt ? `${formatDate(order.cancelledAt)} ${formatTime(order.cancelledAt)}` : "",
      order.expiresAt ? `${formatDate(order.expiresAt)} ${formatTime(order.expiresAt)}` : "",
      order.staffNotes || "",
      order.cancelReason || "",
    ];
  });

  // Escape CSV values
  const escapeCsv = (value: string | number) => {
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="thc-plus-orders-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

// ─── PDF Generation ─────────────────────────────────────
async function generatePdfResponse(
  orders: any[],
  startDate: string | null,
  endDate: string | null
) {
  try {
    // Dynamic import for @react-pdf/renderer (server-side only)
    const { renderToBuffer, Document, Page, Text, View, StyleSheet } =
      await import("@react-pdf/renderer");
    const React = (await import("react")).default;

    const dateRange = [
      startDate ? formatDate(startDate) : "Beginning",
      endDate ? formatDate(endDate) : "Present",
    ].join(" - ");

    const totalRevenue = orders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce(
          (itemSum: number, item: any) =>
            itemSum + item.unitPriceAtOrder * item.quantity,
          0
        )
      );
    }, 0);

    const styles = StyleSheet.create({
      page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
      header: { marginBottom: 20 },
      title: { fontSize: 22, fontWeight: "bold", color: "#16a34a" },
      subtitle: { fontSize: 12, color: "#666", marginTop: 4 },
      summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
      },
      summaryItem: { alignItems: "center" },
      summaryLabel: { fontSize: 9, color: "#666" },
      summaryValue: { fontSize: 16, fontWeight: "bold", marginTop: 2 },
      tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f3f4f6",
        padding: 6,
        marginBottom: 2,
        fontWeight: "bold",
        fontSize: 8,
      },
      tableRow: {
        flexDirection: "row",
        padding: 6,
        borderBottomWidth: 0.5,
        borderBottomColor: "#e5e7eb",
        fontSize: 8,
      },
      col1: { width: "15%" },
      col2: { width: "12%" },
      col3: { width: "18%" },
      col4: { width: "8%", textAlign: "center" },
      col5: { width: "12%", textAlign: "right" },
      col6: { width: "8%", textAlign: "center" },
      col7: { width: "27%" },
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

    const statusCounts = orders.reduce(
      (acc: Record<string, number>, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      },
      {}
    );

    const PdfDocument = React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: "A4", style: styles.page },
        // Header
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.title }, "THC Plus"),
          React.createElement(
            Text,
            { style: styles.subtitle },
            `Order Report | ${dateRange}`
          ),
          React.createElement(
            Text,
            { style: { ...styles.subtitle, fontSize: 9 } },
            `Generated: ${formatDate(new Date())} | Total Orders: ${orders.length}`
          )
        ),
        // Summary
        React.createElement(
          View,
          { style: styles.summaryRow },
          React.createElement(
            View,
            { style: styles.summaryItem },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Total Orders"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              String(orders.length)
            )
          ),
          React.createElement(
            View,
            { style: styles.summaryItem },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Revenue"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              formatPrice(totalRevenue)
            )
          ),
          React.createElement(
            View,
            { style: styles.summaryItem },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Completed"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              String(statusCounts["PICKED_UP"] || 0)
            )
          ),
          React.createElement(
            View,
            { style: styles.summaryItem },
            React.createElement(
              Text,
              { style: styles.summaryLabel },
              "Cancelled"
            ),
            React.createElement(
              Text,
              { style: styles.summaryValue },
              String(statusCounts["CANCELLED"] || 0)
            )
          )
        ),
        // Table header
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: styles.col1 }, "Order #"),
          React.createElement(Text, { style: styles.col2 }, "Status"),
          React.createElement(Text, { style: styles.col3 }, "Customer"),
          React.createElement(Text, { style: styles.col4 }, "Items"),
          React.createElement(Text, { style: styles.col5 }, "Total"),
          React.createElement(Text, { style: styles.col6 }, "AI Score"),
          React.createElement(Text, { style: styles.col7 }, "Date")
        ),
        // Table rows (limit to 50 per page)
        ...orders.slice(0, 200).map((order, i) => {
          const orderTotal = order.items.reduce(
            (sum: number, item: any) =>
              sum + item.unitPriceAtOrder * item.quantity,
            0
          );
          return React.createElement(
            View,
            {
              key: order.id,
              style: {
                ...styles.tableRow,
                backgroundColor: i % 2 === 0 ? "#ffffff" : "#fafafa",
              },
            },
            React.createElement(
              Text,
              { style: styles.col1 },
              order.orderNumber
            ),
            React.createElement(
              Text,
              { style: styles.col2 },
              getOrderStatusLabel(order.status)
            ),
            React.createElement(
              Text,
              { style: styles.col3 },
              order.customer?.name || order.guestName || "Guest"
            ),
            React.createElement(
              Text,
              { style: styles.col4 },
              String(order.totalItems)
            ),
            React.createElement(
              Text,
              { style: styles.col5 },
              formatPrice(orderTotal)
            ),
            React.createElement(
              Text,
              { style: styles.col6 },
              order.aiPriorityScore ? String(order.aiPriorityScore) : "-"
            ),
            React.createElement(
              Text,
              { style: styles.col7 },
              `${formatDate(order.createdAt)} ${formatTime(order.createdAt)}`
            )
          );
        }),
        // Footer
        React.createElement(
          Text,
          { style: styles.footer },
          "THC Plus | 8302 N Eldridge Pkwy, Houston, TX | Confidential"
        )
      )
    );

    const pdfBuffer = await renderToBuffer(PdfDocument as any);

    // Upload to Vercel Blob
    const filename = `exports/orders-report-${new Date().toISOString().split("T")[0]}-${Date.now()}.pdf`;
    const blob = await put(filename, pdfBuffer, {
      access: "private",
      contentType: "application/pdf",
    });

    return NextResponse.json({
      url: blob.url,
      filename,
      orderCount: orders.length,
    });
  } catch (pdfError) {
    console.error("PDF generation error:", pdfError);
    return NextResponse.json(
      { error: "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}
