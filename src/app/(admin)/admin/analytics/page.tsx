"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Brain,
  Calendar,
  Lightbulb,
  AlertTriangle,
  Sparkles,
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
type TimeRange = "daily" | "weekly" | "monthly";
type DateRange = "7d" | "30d" | "90d" | "1y";

interface KPICard {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  iconColor: string;
}

interface AiInsight {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "success" | "tip";
}

// ─── Mock Data ───────────────────────────────────────────
const KPI_DATA: KPICard[] = [
  {
    label: "Today's Orders",
    value: "47",
    change: 12.5,
    changeLabel: "vs yesterday",
    icon: ShoppingCart,
    iconColor: "text-emerald-400",
  },
  {
    label: "Completed",
    value: "38",
    change: 8.3,
    changeLabel: "vs yesterday",
    icon: CheckCircle2,
    iconColor: "text-green-400",
  },
  {
    label: "Avg Processing",
    value: "8.2 min",
    change: -15.4,
    changeLabel: "vs last week",
    icon: Clock,
    iconColor: "text-[#D4AF37]",
  },
  {
    label: "Active Now",
    value: "12",
    change: 33.3,
    changeLabel: "vs this time yesterday",
    icon: Users,
    iconColor: "text-sky-400",
  },
];

const DAILY_ORDER_DATA = [
  { date: "Mon", orders: 32, completed: 28 },
  { date: "Tue", orders: 45, completed: 42 },
  { date: "Wed", orders: 38, completed: 35 },
  { date: "Thu", orders: 52, completed: 48 },
  { date: "Fri", orders: 61, completed: 56 },
  { date: "Sat", orders: 78, completed: 72 },
  { date: "Sun", orders: 55, completed: 50 },
];

const WEEKLY_ORDER_DATA = [
  { date: "W1", orders: 210, completed: 195 },
  { date: "W2", orders: 245, completed: 228 },
  { date: "W3", orders: 198, completed: 180 },
  { date: "W4", orders: 267, completed: 252 },
];

const MONTHLY_ORDER_DATA = [
  { date: "Sep", orders: 820, completed: 756 },
  { date: "Oct", orders: 945, completed: 878 },
  { date: "Nov", orders: 1102, completed: 1028 },
  { date: "Dec", orders: 1380, completed: 1290 },
  { date: "Jan", orders: 1050, completed: 985 },
  { date: "Feb", orders: 890, completed: 842 },
];

const TOP_PRODUCTS_DATA = [
  { name: "Blue Dream 3.5g", sales: 145 },
  { name: "OG Kush Cart 1g", sales: 128 },
  { name: "Sour Diesel 7g", sales: 112 },
  { name: "Mango Gummies", sales: 98 },
  { name: "Jack Herer Pre", sales: 87 },
  { name: "Wedding Cake", sales: 76 },
  { name: "CBD Tincture", sales: 68 },
  { name: "Live Resin 1g", sales: 62 },
  { name: "Choco Bar 100mg", sales: 55 },
  { name: "N. Lights 7g", sales: 48 },
];

const COMPLETION_DATA = [
  { name: "Completed", value: 842, color: "#10B981" },
  { name: "Cancelled", value: 35, color: "#EF4444" },
  { name: "Expired", value: 13, color: "#6B7280" },
];

const CATEGORY_DATA = [
  { name: "Flower", value: 38, color: "#10B981" },
  { name: "Edibles", value: 22, color: "#D4AF37" },
  { name: "Vaporizers", value: 18, color: "#3B82F6" },
  { name: "Pre-Rolls", value: 12, color: "#8B5CF6" },
  { name: "Concentrates", value: 6, color: "#F59E0B" },
  { name: "Other", value: 4, color: "#6B7280" },
];

const AI_INSIGHTS: AiInsight[] = [
  {
    id: "ai1",
    title: "Saturday Peak Detected",
    body: "Saturday orders are 42% higher than weekday average. Consider scheduling extra staff for Saturday shifts to reduce processing time.",
    type: "info",
  },
  {
    id: "ai2",
    title: "Blue Dream Stock Alert",
    body: "At current sales velocity (21/day), Blue Dream 3.5g will be out of stock in approximately 4 days. Recommend reordering now.",
    type: "warning",
  },
  {
    id: "ai3",
    title: "Processing Time Improved",
    body: "Average order processing time decreased by 15.4% this week (from 9.7 to 8.2 minutes). Staff training initiative is showing results.",
    type: "success",
  },
  {
    id: "ai4",
    title: "Edibles Trending Up",
    body: "Edible sales increased 28% month-over-month. Consider expanding the edibles category with new product offerings, particularly gummies and chocolate bars.",
    type: "tip",
  },
];

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

// ─── Analytics Dashboard Page ────────────────────────────
export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  const orderData =
    timeRange === "daily"
      ? DAILY_ORDER_DATA
      : timeRange === "weekly"
      ? WEEKLY_ORDER_DATA
      : MONTHLY_ORDER_DATA;

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

      {/* ─── KPI Cards ───────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_DATA.map((kpi, i) => {
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
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <span
                  className={
                    kpi.change > 0 ? "text-emerald-400" : "text-emerald-400"
                  }
                >
                  {Math.abs(kpi.change)}%
                </span>
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
            <div className="flex gap-1 rounded-lg bg-[#090F09] p-1">
              {(["daily", "weekly", "monthly"] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium capitalize transition-colors",
                    timeRange === range
                      ? "bg-emerald-600/20 text-emerald-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={orderData}>
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
        </div>

        {/* Completion Rate — Donut Chart */}
        <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-200">
            Completion Rate
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={COMPLETION_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {COMPLETION_DATA.map((entry, index) => (
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
          <div className="mt-2 flex justify-center gap-4">
            {COMPLETION_DATA.map((entry) => (
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
            <p className="text-3xl font-bold text-emerald-400">94.6%</p>
            <p className="text-xs text-zinc-500">Completion Rate</p>
          </div>
        </div>
      </div>

      {/* ─── Charts Row 2 ────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Top 10 Products — Bar Chart */}
        <div className="xl:col-span-2 rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-200">
            Top 10 Products
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={TOP_PRODUCTS_DATA} layout="vertical">
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
        </div>

        {/* Category Breakdown — Donut Chart */}
        <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
          <h3 className="mb-4 text-sm font-semibold text-zinc-200">
            Category Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={CATEGORY_DATA}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {CATEGORY_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value}%`,
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
            {CATEGORY_DATA.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: entry.color }}
                />
                <span className="text-[11px] text-zinc-400">
                  {entry.name} ({entry.value}%)
                </span>
              </div>
            ))}
          </div>
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

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {AI_INSIGHTS.map((insight) => {
            const Icon = insightIcons[insight.type];
            const colors = insightColors[insight.type];

            return (
              <motion.div
                key={insight.id}
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
      </div>
    </div>
  );
}
