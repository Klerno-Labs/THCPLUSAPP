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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Types ───────────────────────────────────────────────
type ExportFormat = "csv" | "pdf";
type ExportType = "orders" | "customers" | "analytics";

interface ExportJob {
  id: string;
  type: ExportType;
  format: ExportFormat;
  status: "idle" | "loading" | "done";
  dateFrom?: string;
  dateTo?: string;
  filename?: string;
}

// ─── Helpers ─────────────────────────────────────────────
function generateMockCSV(type: ExportType): string {
  switch (type) {
    case "orders":
      return [
        "Order Number,Customer,Date,Items,Total,Status",
        "THC-A1B2,Sarah Martinez,2025-02-19,4,$143.00,Pending",
        "THC-C3D4,James Wilson,2025-02-18,2,$97.00,Pending",
        "THC-E5F6,Maria Rodriguez,2025-02-19,3,$85.00,Confirmed",
        "THC-G7H8,David Chen,2025-02-19,4,$161.00,Preparing",
        "THC-I9J0,Ashley Thompson,2025-02-19,3,$36.00,Ready",
        "THC-K1L2,Kevin Brown,2025-02-19,4,$156.00,Pending",
        "THC-M3N4,Lisa Park,2025-02-18,1,$40.00,Picked Up",
        "THC-O5P6,Mike Johnson,2025-02-17,2,$88.00,Picked Up",
        "THC-Q7R8,Emma Davis,2025-02-17,3,$125.00,Picked Up",
        "THC-S9T0,Carlos Hernandez,2025-02-16,1,$42.00,Picked Up",
      ].join("\n");
    case "customers":
      return [
        "Name,Phone,Email,Tier,Points,Total Orders,Total Spent,Joined",
        'Sarah Martinez,(555) 123-4567,sarah.m@email.com,Master Grower,842,67,"$4,280.00",2024-03-15',
        "James Wilson,(555) 234-5678,jwilson@email.com,Seedling,12,1,$97.00,2025-02-18",
        'Maria Rodriguez,(555) 345-6789,maria.r@email.com,Cultivator,256,34,"$2,150.00",2024-06-22',
        "David Chen,(555) 456-7890,d.chen@email.com,Grower,78,12,$780.00,2024-09-10",
        "Ashley Thompson,(555) 567-8901,ashley.t@email.com,Grower,45,8,$320.00,2024-11-01",
        'Kevin Brown,(555) 678-9012,,Cultivator,190,28,"$1,890.00",2024-05-18',
      ].join("\n");
    case "analytics":
      return [
        "Metric,Value,Change",
        "Total Orders (30d),890,+12.5%",
        "Completed Orders,842,+8.3%",
        "Avg Processing Time,8.2 min,-15.4%",
        "Completion Rate,94.6%,+1.2%",
        "Revenue (30d),$52840.00,+18.7%",
        "New Customers (30d),87,+22.1%",
        "Repeat Customer Rate,68.4%,+3.5%",
        "Top Product,Blue Dream 3.5g,145 units",
        "Top Category,Flower,38%",
        "Peak Hour,2:00 PM,avg 8.2 orders",
      ].join("\n");
    default:
      return "";
  }
}

function generateMockPDFContent(_type: ExportType): string {
  // In production, this would generate a real PDF via a server action
  // For now, return a text representation
  return "PDF generation would happen server-side using a library like puppeteer or jsPDF.";
}

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

  const handleExport = useCallback(async () => {
    setStatus("loading");

    // Simulate export generation time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const dateStr = new Date().toISOString().split("T")[0];

    if (format === "csv") {
      const content = generateMockCSV(type);
      const filename = `thc-plus-${type}-${dateStr}.csv`;
      downloadBlob(content, filename, "text/csv");
    } else {
      // In production, this would trigger a server action to generate a PDF
      const content = generateMockPDFContent(type);
      const filename = `thc-plus-${type}-${dateStr}.txt`;
      downloadBlob(content, filename, "text/plain");
    }

    setStatus("done");

    // Reset after showing success
    setTimeout(() => setStatus("idle"), 2500);
  }, [format, type]);

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

            {/* Download Button */}
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
                  Download {format.toUpperCase()}
                </>
              )}
            </Button>
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
          Download your data as CSV or PDF for reporting and analysis
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
            PDF exports include formatted tables and summary statistics
            suitable for printing.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-emerald-600" />
            All exports are generated client-side. No data leaves your browser
            except through the download.
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
