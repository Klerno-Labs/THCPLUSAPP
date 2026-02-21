"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Brain,
  Calendar,
  Lightbulb,
  AlertTriangle,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
type DateRange = "7d" | "30d" | "90d" | "1y";

interface KpisResponse {
  todayOrders: number;
  todayCompleted: number;
  activeOrders: number;
  avgProcessingMin: number;
  todayChange: number;
}

interface TimeseriesPoint {
  date: string;
  orders: number;
  completed: number;
}

interface TopProduct {
  name: string;
  sales: number;
}

interface CompletionResponse {
  completed: number;
  cancelled: number;
  expired: number;
  pending: number;
}

interface CategoryItem {
  name: string;
  value: number;
}

interface AiInsight {
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "tip";
}

interface AnalyticsResponse {
  kpis: KpisResponse;
  timeseries: TimeseriesPoint[];
  topProducts: TopProduct[];
  completion: CompletionResponse;
  categories: CategoryItem[];
  aiInsights: AiInsight[];
}

// ─── Helpers ─────────────────────────────────────────────

/** Build KPI cards dynamically from the API kpis object */
function buildKpiCards(kpis: KpisResponse) {
  return [
    {
      label: "Today's Orders",
      value: String(kpis.todayOrders),
      change: kpis.todayChange,
      changeLabel: "vs yesterday",
      icon: ShoppingCart,
      iconColor: "text-emerald-400",
    },
    {
      label: "Completed",
      value: String(kpis.todayCompleted),
      change: kpis.todayChange,
      changeLabel: "vs yesterday",
      icon: CheckCircle2,
      iconColor: "text-green-400",
    },
    {
      label: "Avg Processing",
      value: `${kpis.avgProcessingMin} min`,
      change: 0,
      changeLabel: "avg this period",
      icon: Clock,
      iconColor: "text-[#D4AF37]",
    },
    {
      label: "Active Now",
      value: String(kpis.activeOrders),
      change: 0,
      changeLabel: "active orders",
      icon: Activity,
      iconColor: "text-sky-400",
    },
  ];
}

/** Map API completion object to pie chart data with colors */
function buildCompletionData(completion: CompletionResponse) {
  return [
    { name: "Completed", value: completion.completed, color: "#10B981" },
    { name: "Cancelled", value: completion.cancelled, color: "#EF4444" },
    { name: "Expired", value: completion.expired, color: "#6B7280" },
    { name: "Pending", value: completion.pending, color: "#F59E0B" },
  ];
}

/** Assign stable colors to category entries */
const CATEGORY_COLORS = [
  "#10B981",
  "#D4AF37",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#6B7280",
  "#EF4444",
  "#EC4899",
];

function buildCategoryData(categories: CategoryItem[]) {
  return categories.map((cat, i) => ({
    ...cat,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
}

/** Calculate completion rate percentage */
function completionRate(completion: CompletionResponse): string {
  const total =
    completion.completed +
    completion.cancelled +
    completion.expired +
    completion.pending;
  if (total === 0) return "0.0";
  return ((completion.completed / total) * 100).toFixed(1);
}

/** Format date strings for chart display */
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Custom Tooltip ──────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-emerald-900/30 bg-[#111A11] px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Loading Spinner ─────────────────────────────────────
function LoadingOverlay() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-sm text-zinc-500">Loading analytics...</p>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center">
      <p className="text-xs text-zinc-600">No {label} data available</p>
    </div>
  );
}

// ─── Analytics Dashboard Page ────────────────────────────
export default function AnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (!res.ok) throw new Error(`Failed to fetch analytics (${res.status})`);
      const json: AnalyticsResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange, fetchAnalytics]);

  // ─── Derived data ─────────────────────────────────────
  const kpiCards = data ? buildKpiCards(data.kpis) : [];
  const timeseriesData = data
    ? data.timeseries.map((pt) => ({
        ...pt,
        date: formatDateLabel(pt.date),
      }))
    : [];
  const completionData = data ? buildCompletionData(data.completion) : [];
  const categoryData = data ? buildCategoryData(data.categories) : [];
  const topProducts = data ? data.topProducts : [];
  const aiInsights = data ? data.aiInsights : [];

  // ─── Insight rendering helpers ─────────────────────────
  const insightIcons: Record<string, React.ElementType> = {
    info: Lightbulb,
    warning: AlertTriangle,
    success: TrendingUp,
    tip: Sparkles,
  };

  const insightColors: Record<string, { icon: string; border: string; bg: string }> = {
    info: {
      icon: "text-sky-400",
      border: "border-sky-500/20",
      bg: "bg-sky-500/5",
    },
    warning: {
      icon: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
    },
    success: {
      icon: "text-emerald-400",
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/5",
    },
    tip: {
      icon: "text-violet-400",
      border: "border-violet-500/20",
      bg: "bg-violet-500/5",
    },
  };

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <BarChart3 className="mr-2 inline-block h-6 w-6 text-emerald-400" />
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Performance overview and AI-powered insights
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2 rounded-xl border border-emerald-900/30 bg-[#111A11] p-1">
          <Calendar className="ml-2 h-4 w-4 text-zinc-500" />
          {(["7d", "30d", "90d", "1y"] as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                dateRange === range
                  ? "bg-emerald-600/15 text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {range === "7d"
                ? "7 Days"
                : range === "30d"
                ? "30 Days"
                : range === "90d"
                ? "90 Days"
                : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Loading State ─────────────────────────────────── */}
      {loading && <LoadingOverlay />}

      {/* ─── Error State ───────────────────────────────────── */}
      {!loading && error && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-red-900/30 bg-red-900/5 px-8 py-6">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => fetchAnalytics(dateRange)}
              className="mt-1 rounded-lg bg-emerald-600/15 px-4 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-600/25"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ─── Dashboard Content ─────────────────────────────── */}
      {!loading && !error && data && (
        <>
          {/* ─── KPI Cards ───────────────────────────────────── */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                        {kpi.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-zinc-100">
                        {kpi.value}
                      </p>
                    </div>
                    <div className="rounded-lg bg-[#090F09] p-2.5">
                      <Icon className={cn("h-5 w-5", kpi.iconColor)} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    {kpi.change > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    ) : kpi.change < 0 ? (
                      <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                    ) : null}
                    {kpi.change !== 0 && (
                      <span
                        className={
                          kpi.change > 0 ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        {Math.abs(kpi.change)}%
                      </span>
                    )}
                    <span className="text-zinc-600">{kpi.changeLabel}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ─── Charts Row 1 ────────────────────────────────── */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Orders Over Time — Line Chart */}
            <div className="xl:col-span-2 rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-200">
                  Orders Over Time
                </h3>
              </div>
              {timeseriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={timeseriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
                    <XAxis
                      dataKey="date"
                      stroke="#555"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis stroke="#555" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", color: "#888" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: "#10B981", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Orders"
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#D4AF37"
                      strokeWidth={2}
                      dot={{ fill: "#D4AF37", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState label="timeseries" />
              )}
            </div>

            {/* Completion Rate — Donut Chart */}
            <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-200">
                Completion Rate
              </h3>
              {completionData.some((d) => d.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [`${value}`, name]}
                        contentStyle={{
                          background: "#111A11",
                          border: "1px solid #1a3a1a",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#ddd",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex flex-wrap justify-center gap-4">
                    {completionData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: entry.color }}
                        />
                        <span className="text-[11px] text-zinc-400">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-3xl font-bold text-emerald-400">
                      {completionRate(data.completion)}%
                    </p>
                    <p className="text-xs text-zinc-500">Completion Rate</p>
                  </div>
                </>
              ) : (
                <EmptyState label="completion" />
              )}
            </div>
          </div>

          {/* ─── Charts Row 2 ────────────────────────────────── */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Top Products — Bar Chart */}
            <div className="xl:col-span-2 rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-200">
                Top Products
              </h3>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#1a2e1a"
                      horizontal={false}
                    />
                    <XAxis type="number" stroke="#555" fontSize={11} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#555"
                      fontSize={11}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#111A11",
                        border: "1px solid #1a3a1a",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#ddd",
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#10B981"
                      radius={[0, 4, 4, 0]}
                      name="Units Sold"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState label="product" />
              )}
            </div>

            {/* Category Breakdown — Donut Chart */}
            <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
              <h3 className="mb-4 text-sm font-semibold text-zinc-200">
                Category Breakdown
              </h3>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          `${value}`,
                          name,
                        ]}
                        contentStyle={{
                          background: "#111A11",
                          border: "1px solid #1a3a1a",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#ddd",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {categoryData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: entry.color }}
                        />
                        <span className="text-[11px] text-zinc-400">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState label="category" />
              )}
            </div>
          </div>

          {/* ─── AI Insights Panel ───────────────────────────── */}
          <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-zinc-200">AI Insights</h3>
              <span className="rounded-full bg-emerald-600/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Powered by AI
              </span>
            </div>

            {aiInsights.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {aiInsights.map((insight, idx) => {
                  const Icon = insightIcons[insight.type] ?? Lightbulb;
                  const colors = insightColors[insight.type] ?? insightColors.info;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-lg border p-4",
                        colors.border,
                        colors.bg
                      )}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className={cn("h-4 w-4", colors.icon)} />
                        <h4 className="text-sm font-semibold text-zinc-200">
                          {insight.title}
                        </h4>
                      </div>
                      <p className="text-xs leading-relaxed text-zinc-400">
                        {insight.body}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <EmptyState label="insight" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
