"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Calendar,
  ShoppingCart,
  Users,
  BarChart3,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

// ─── Types ───────────────────────────────────────────────
type ExportFormat = "csv" | "pdf";
type ExportType = "orders" | "customers" | "analytics";

// ─── Helpers ─────────────────────────────────────────────
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function customersToCSV(customers: any[]): string {
  const headers = [
    "Name",
    "Phone",
    "Email",
    "Loyalty Tier",
    "Loyalty Points",
    "Total Orders",
    "Total Spent",
    "Joined At",
    "Last Order At",
    "Staff Notes",
  ];

  const escapeCsv = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = customers.map((c) => [
    escapeCsv(c.name),
    escapeCsv(c.phone),
    escapeCsv(c.email),
    escapeCsv(c.loyaltyTier),
    escapeCsv(c.loyaltyPoints),
    escapeCsv(c.totalOrders),
    escapeCsv(
      c.totalSpent != null
        ? `$${Number(c.totalSpent).toFixed(2)}`
        : ""
    ),
    escapeCsv(c.joinedAt ? c.joinedAt.split("T")[0] : ""),
    escapeCsv(c.lastOrderAt ? c.lastOrderAt.split("T")[0] : ""),
    escapeCsv(c.staffNotes),
  ]);

  return [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
}

// ─── Export Section Component ────────────────────────────
interface ExportSectionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  type: ExportType;
  showDateRange?: boolean;
}

function ExportSection({
  title,
  description,
  icon: Icon,
  type,
  showDateRange = false,
}: ExportSectionProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const { toast } = useToast();

  const handleExport = useCallback(async () => {
    // PDF export is not yet available — show a toast and bail out early
    if (format === "pdf") {
      toast({
        title: "PDF export coming soon",
        description:
          "PDF generation is not yet available. Please export as CSV instead.",
      });
      return;
    }

    setStatus("loading");

    try {
      const dateStr = new Date().toISOString().split("T")[0];

      if (type === "orders") {
        const params = new URLSearchParams({ format: "csv" });
        if (dateFrom) params.set("startDate", dateFrom);
        if (dateTo) params.set("endDate", dateTo);

        const res = await fetch(`/api/export/orders?${params.toString()}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? `Request failed with status ${res.status}`);
        }
        const csvText = await res.text();
        downloadBlob(csvText, `thc-plus-orders-${dateStr}.csv`, "text/csv");
      } else if (type === "analytics") {
        const params = new URLSearchParams({ format: "csv" });
        if (dateFrom) params.set("startDate", dateFrom);
        if (dateTo) params.set("endDate", dateTo);

        const res = await fetch(`/api/export/analytics?${params.toString()}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? `Request failed with status ${res.status}`);
        }
        const csvText = await res.text();
        downloadBlob(csvText, `thc-plus-analytics-${dateStr}.csv`, "text/csv");
      } else if (type === "customers") {
        const res = await fetch("/api/customers");
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error ?? `Request failed with status ${res.status}`);
        }
        const customers = await res.json();
        const csvText = customersToCSV(customers);
        downloadBlob(csvText, `thc-plus-customers-${dateStr}.csv`, "text/csv");
      }

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (err: any) {
      console.error("Export error:", err);
      toast({
        title: "Export failed",
        description: err?.message ?? "An unexpected error occurred.",
        variant: "destructive",
      });
      setStatus("idle");
    }
  }, [format, type, dateFrom, dateTo, toast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-6"
    >
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-[#090F09] p-3">
          <Icon className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-zinc-200">{title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>

          {/* Date Range */}
          {showDateRange && (
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  From
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  To
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Format + Download */}
          <div className="mt-4 flex items-center gap-3">
            {/* Format Toggle */}
            <div className="flex overflow-hidden rounded-lg border border-emerald-900/30">
              <button
                onClick={() => setFormat("csv")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  format === "csv"
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "bg-[#090F09] text-zinc-500 hover:text-zinc-300"
                )}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                CSV
              </button>
              <button
                onClick={() => setFormat("pdf")}
                className={cn(
                  "flex items-center gap-1.5 border-l border-emerald-900/30 px-3 py-2 text-xs font-medium transition-colors",
                  format === "pdf"
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "bg-[#090F09] text-zinc-500 hover:text-zinc-300"
                )}
              >
                <FileText className="h-3.5 w-3.5" />
                PDF
              </button>
            </div>

            {/* PDF coming-soon badge */}
            {format === "pdf" && (
              <span className="flex items-center gap-1 rounded-md bg-zinc-800/60 px-2 py-1 text-xs text-zinc-500">
                <Clock className="h-3 w-3" />
                Coming soon
              </span>
            )}

            {/* Download Button */}
            {format === "csv" && (
              <Button
                size="sm"
                onClick={handleExport}
                disabled={status === "loading"}
                className={cn(
                  "gap-2 transition-all",
                  status === "done" &&
                    "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20"
                )}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : status === "done" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download CSV
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Export Page ──────────────────────────────────────────
export default function ExportPage() {
  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">
          <Download className="mr-2 inline-block h-6 w-6 text-emerald-400" />
          Export Data
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Download your data as CSV for reporting and analysis
        </p>
      </div>

      {/* ─── Export Sections ──────────────────────────────── */}
      <div className="space-y-4">
        <ExportSection
          title="Orders Export"
          description="Export all orders with customer details, item lists, totals, and status. Filter by date range to narrow results."
          icon={ShoppingCart}
          type="orders"
          showDateRange
        />

        <ExportSection
          title="Customer List Export"
          description="Export your complete customer directory including contact information, loyalty tier, points balance, and order history summary."
          icon={Users}
          type="customers"
        />

        <ExportSection
          title="Analytics Summary Export"
          description="Export KPIs, performance metrics, top products, category breakdowns, and AI insights for the selected period."
          icon={BarChart3}
          type="analytics"
          showDateRange
        />
      </div>

      {/* ─── Export Info ──────────────────────────────────── */}
      <div className="mt-8 rounded-xl border border-emerald-900/20 bg-emerald-950/20 p-5">
        <h3 className="text-sm font-semibold text-emerald-400">
          Export Information
        </h3>
        <ul className="mt-2 space-y-1.5 text-xs text-zinc-500">
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-emerald-600" />
            CSV exports open directly in Excel, Google Sheets, or any
            spreadsheet application.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-emerald-600" />
            PDF exports are coming soon and will include formatted tables and
            summary statistics suitable for printing.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-emerald-600" />
            Orders and analytics exports are fetched live from the server.
            Customer exports are assembled client-side from live data.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-emerald-600" />
            For compliance purposes, all export activities are logged with
            timestamp and staff ID.
          </li>
        </ul>
      </div>
    </div>
  );
}
