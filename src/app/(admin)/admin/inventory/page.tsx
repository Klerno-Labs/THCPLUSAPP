"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Warehouse,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  ArrowUpDown,
  Package,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Types ──────────────────────────────────────────────
interface InventoryProduct {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  costPrice: number | null;
  margin: number | null;
  unitProfit: number | null;
  totalRetailValue: number;
  totalCostValue: number | null;
  totalProfit: number | null;
  inStock: boolean;
  weight: string | null;
  lowStock: boolean;
  imageUrl: string | null;
}

interface Summary {
  totalProducts: number;
  totalUnits: number;
  totalRetailValue: number;
  totalCostValue: number;
  totalPotentialProfit: number | null;
  avgMargin: number | null;
  lowStockCount: number;
  outOfStockCount: number;
}

type SortField = "name" | "quantity" | "price" | "costPrice" | "margin" | "totalProfit";
type StockFilter = "all" | "inStock" | "lowStock" | "outOfStock";

// ─── Formatters ─────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

// ─── KPI Card ───────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className="text-lg font-bold text-white sm:text-xl">{value}</p>
          {sub && <p className="text-xs text-zinc-500">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip for Chart ───────────────────────────
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-emerald-900/30 bg-[#111A11] px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-white">{data.name}</p>
      <p className="text-xs text-emerald-400">Profit: {fmt(data.totalProfit)}</p>
      <p className="text-xs text-zinc-500">Margin: {data.margin}%</p>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/inventory");
      if (res.status === 401) {
        setError("Access denied. Owner account required.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data.products);
      setSummary(data.summary);
    } catch {
      setError("Failed to load inventory data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Categories for filter dropdown
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

  // Filtered + sorted products
  const filtered = useMemo(() => {
    let list = [...products];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (stockFilter === "inStock") {
      list = list.filter((p) => p.inStock && p.quantity > 5);
    } else if (stockFilter === "lowStock") {
      list = list.filter((p) => p.lowStock);
    } else if (stockFilter === "outOfStock") {
      list = list.filter((p) => p.quantity === 0 || !p.inStock);
    }

    list.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (sortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          return sortDir === "asc"
            ? aVal.localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal as string);
        case "quantity":
          aVal = a.quantity;
          bVal = b.quantity;
          break;
        case "price":
          aVal = a.price;
          bVal = b.price;
          break;
        case "costPrice":
          aVal = a.costPrice ?? 0;
          bVal = b.costPrice ?? 0;
          break;
        case "margin":
          aVal = a.margin ?? 0;
          bVal = b.margin ?? 0;
          break;
        case "totalProfit":
          aVal = a.totalProfit ?? 0;
          bVal = b.totalProfit ?? 0;
          break;
      }

      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return list;
  }, [products, search, categoryFilter, stockFilter, sortField, sortDir]);

  // Chart data — top 10 by total profit
  const chartData = useMemo(
    () =>
      [...products]
        .filter((p) => p.totalProfit != null && p.totalProfit > 0)
        .sort((a, b) => (b.totalProfit ?? 0) - (a.totalProfit ?? 0))
        .slice(0, 10)
        .map((p) => ({
          name: p.name.length > 14 ? p.name.substring(0, 14) + "..." : p.name,
          totalProfit: p.totalProfit ?? 0,
          margin: p.margin ?? 0,
        })),
    [products]
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-emerald-400" : ""}`} />
    </button>
  );

  // ─── Loading / Error States ───────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchInventory}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 pt-16 sm:p-6 lg:pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <p className="text-sm text-zinc-500">
          Stock levels, costs, and profit margins — owner access only
        </p>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            icon={Warehouse}
            label="Total Units"
            value={summary.totalUnits.toLocaleString()}
            sub={`${summary.totalProducts} products`}
            color="bg-emerald-600"
            delay={0}
          />
          <KpiCard
            icon={DollarSign}
            label="Retail Value"
            value={fmt(summary.totalRetailValue)}
            sub="If all sold at list price"
            color="bg-blue-600"
            delay={0.05}
          />
          <KpiCard
            icon={Package}
            label="Cost Value"
            value={fmt(summary.totalCostValue)}
            sub="Total wholesale cost"
            color="bg-orange-600"
            delay={0.1}
          />
          <KpiCard
            icon={TrendingUp}
            label="Potential Profit"
            value={summary.totalPotentialProfit != null ? fmt(summary.totalPotentialProfit) : "—"}
            sub={summary.avgMargin != null ? `${summary.avgMargin}% avg margin` : "Set cost prices"}
            color="bg-gold-600"
            delay={0.15}
          />
        </div>
      )}

      {/* Alerts */}
      {summary && (summary.lowStockCount > 0 || summary.outOfStockCount > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-3"
        >
          {summary.outOfStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-900/30 bg-red-950/20 px-3 py-2 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {summary.outOfStockCount} out of stock
            </div>
          )}
          {summary.lowStockCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-900/30 bg-yellow-950/20 px-3 py-2 text-sm text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
              {summary.lowStockCount} low stock (≤5 units)
            </div>
          )}
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-[#111A11] px-3 py-2 text-sm text-zinc-300"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="rounded-lg border border-border bg-[#111A11] px-3 py-2 text-sm text-zinc-300"
        >
          <option value="all">All Stock</option>
          <option value="inStock">In Stock</option>
          <option value="lowStock">Low Stock</option>
          <option value="outOfStock">Out of Stock</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto rounded-xl border border-emerald-900/30 bg-[#111A11]">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-emerald-900/20">
              <th className="px-4 py-3 text-left">
                <SortHeader field="name">Product</SortHeader>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Category
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader field="quantity">Qty</SortHeader>
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader field="costPrice">Cost</SortHeader>
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader field="price">Retail</SortHeader>
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader field="margin">Margin</SortHeader>
              </th>
              <th className="px-3 py-3 text-right">
                <SortHeader field="totalProfit">Stock Profit</SortHeader>
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-emerald-900/10 transition-colors hover:bg-emerald-950/20 ${
                  p.quantity === 0 || !p.inStock
                    ? "bg-red-950/10"
                    : p.lowStock
                    ? "bg-yellow-950/10"
                    : ""
                }`}
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-white">{p.name}</span>
                  {p.weight && (
                    <span className="ml-2 text-xs text-zinc-500">{p.weight}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-zinc-400">{p.category}</td>
                <td className="px-3 py-3 text-right font-mono text-white">
                  {p.quantity}
                </td>
                <td className="px-3 py-3 text-right font-mono text-zinc-400">
                  {p.costPrice != null ? fmt(p.costPrice) : "—"}
                </td>
                <td className="px-3 py-3 text-right font-mono text-white">
                  {fmt(p.price)}
                </td>
                <td className="px-3 py-3 text-right">
                  {p.margin != null ? (
                    <span
                      className={`font-mono ${
                        p.margin >= 50
                          ? "text-emerald-400"
                          : p.margin >= 30
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {p.margin}%
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right font-mono">
                  {p.totalProfit != null ? (
                    <span className="text-emerald-400">{fmt(p.totalProfit)}</span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {p.quantity === 0 || !p.inStock ? (
                    <span className="inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                      Out
                    </span>
                  ) : p.lowStock ? (
                    <span className="inline-flex rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
                      Low
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                  No products match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-600">
        Showing {filtered.length} of {products.length} products
      </p>

      {/* Profit Breakdown Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4 sm:p-6"
        >
          <h2 className="mb-4 text-base font-semibold text-white">
            Top 10 — Profit by Product (in-stock value)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
              <XAxis
                type="number"
                tick={{ fill: "#71717a", fontSize: 11 }}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={110}
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="totalProfit" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i < 3 ? "#D4AF37" : "#10B981"}
                    fillOpacity={1 - i * 0.07}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
