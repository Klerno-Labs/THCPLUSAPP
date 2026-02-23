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
  ShoppingBag,
  Receipt,
  ChevronDown,
  ChevronRight,
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

interface SalesSummary {
  totalOrders: number;
  totalUnitsSold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number | null;
  avgMargin: number | null;
}

interface ProductSale {
  id: string;
  name: string;
  category: string;
  weight: string | null;
  costPrice: number | null;
  unitsSold: number;
  revenue: number;
  totalCost: number | null;
  profit: number | null;
  margin: number | null;
}

interface OrderLineItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineRevenue: number;
  lineCost: number | null;
  lineProfit: number | null;
}

interface OrderBreakdown {
  id: string;
  orderNumber: string;
  customerName: string;
  pickedUpAt: string;
  totalItems: number;
  revenue: number;
  cost: number | null;
  profit: number | null;
  items: OrderLineItem[];
}

type Tab = "stock" | "sales";
type SortField = "name" | "quantity" | "price" | "costPrice" | "margin" | "totalProfit";
type SalesSortField = "name" | "unitsSold" | "revenue" | "profit" | "margin";
type StockFilter = "all" | "inStock" | "lowStock" | "outOfStock";
type DateRange = "today" | "7d" | "30d" | "90d" | "all";

// ─── Formatters ─────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

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

// ─── Custom Tooltips ────────────────────────────────────
function StockChartTooltip({ active, payload }: any) {
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

function SalesChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-emerald-900/30 bg-[#111A11] px-3 py-2 shadow-lg">
      <p className="text-sm font-medium text-white">{data.name}</p>
      <p className="text-xs text-emerald-400">Revenue: {fmt(data.revenue)}</p>
      {data.profit != null && (
        <p className="text-xs text-gold-400">Profit: {fmt(data.profit)}</p>
      )}
      <p className="text-xs text-zinc-500">{data.unitsSold} units sold</p>
    </div>
  );
}

// ─── Order Row (expandable) ─────────────────────────────
function OrderRow({ order }: { order: OrderBreakdown }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className="cursor-pointer border-b border-emerald-900/10 transition-colors hover:bg-emerald-950/20"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            )}
            <span className="font-mono text-sm font-medium text-white">
              #{order.orderNumber}
            </span>
          </div>
        </td>
        <td className="px-3 py-3 text-sm text-zinc-400">{order.customerName}</td>
        <td className="px-3 py-3 text-sm text-zinc-400">{fmtDate(order.pickedUpAt)}</td>
        <td className="px-3 py-3 text-right font-mono text-sm text-zinc-300">
          {order.totalItems}
        </td>
        <td className="px-3 py-3 text-right font-mono text-sm text-white">
          {fmt(order.revenue)}
        </td>
        <td className="px-3 py-3 text-right font-mono text-sm text-zinc-400">
          {order.cost != null ? fmt(order.cost) : "—"}
        </td>
        <td className="px-3 py-3 text-right font-mono text-sm">
          {order.profit != null ? (
            <span className={order.profit >= 0 ? "text-emerald-400" : "text-red-400"}>
              {fmt(order.profit)}
            </span>
          ) : (
            <span className="text-zinc-600">—</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-emerald-900/10 bg-emerald-950/10">
          <td colSpan={7} className="px-8 py-3">
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs text-zinc-400"
                >
                  <span>
                    {item.quantity}x {item.productName} @ {fmt(item.unitPrice)}
                  </span>
                  <div className="flex gap-4">
                    <span>Revenue: {fmt(item.lineRevenue)}</span>
                    {item.lineCost != null && (
                      <span>Cost: {fmt(item.lineCost)}</span>
                    )}
                    {item.lineProfit != null && (
                      <span
                        className={
                          item.lineProfit >= 0 ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        Profit: {fmt(item.lineProfit)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function InventoryPage() {
  const [tab, setTab] = useState<Tab>("stock");

  // Stock state
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState<string | null>(null);

  // Sales state
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [orders, setOrders] = useState<OrderBreakdown[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("30d");

  // Stock filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Sales filters
  const [salesSearch, setSalesSearch] = useState("");
  const [salesSortField, setSalesSortField] = useState<SalesSortField>("revenue");
  const [salesSortDir, setSalesSortDir] = useState<"asc" | "desc">("desc");

  // ─── Fetch Stock Data ─────────────────────────────────
  const fetchInventory = useCallback(async () => {
    setStockLoading(true);
    setStockError(null);
    try {
      const res = await fetch("/api/inventory");
      if (res.status === 401) {
        setStockError("Access denied. Owner account required.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data.products);
      setSummary(data.summary);
    } catch {
      setStockError("Failed to load inventory data.");
    } finally {
      setStockLoading(false);
    }
  }, []);

  // ─── Fetch Sales Data ─────────────────────────────────
  const fetchSales = useCallback(async (range: DateRange) => {
    setSalesLoading(true);
    setSalesError(null);
    try {
      const res = await fetch(`/api/inventory/sales?range=${range}`);
      if (res.status === 401) {
        setSalesError("Access denied. Owner account required.");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSalesSummary(data.summary);
      setProductSales(data.productSales);
      setOrders(data.orders);
    } catch {
      setSalesError("Failed to load sales data.");
    } finally {
      setSalesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (tab === "sales") {
      fetchSales(dateRange);
    }
  }, [tab, dateRange, fetchSales]);

  // ─── Stock Filters/Sorting ────────────────────────────
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))).sort(),
    [products]
  );

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

  // ─── Sales Filters/Sorting ────────────────────────────
  const filteredSales = useMemo(() => {
    let list = [...productSales];

    if (salesSearch) {
      const q = salesSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      switch (salesSortField) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          return salesSortDir === "asc"
            ? aVal.localeCompare(bVal as string)
            : (bVal as string).localeCompare(aVal as string);
        case "unitsSold":
          aVal = a.unitsSold;
          bVal = b.unitsSold;
          break;
        case "revenue":
          aVal = a.revenue;
          bVal = b.revenue;
          break;
        case "profit":
          aVal = a.profit ?? 0;
          bVal = b.profit ?? 0;
          break;
        case "margin":
          aVal = a.margin ?? 0;
          bVal = b.margin ?? 0;
          break;
      }

      return salesSortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });

    return list;
  }, [productSales, salesSearch, salesSortField, salesSortDir]);

  // ─── Chart Data ───────────────────────────────────────
  const stockChartData = useMemo(
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

  const salesChartData = useMemo(
    () =>
      [...productSales]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)
        .map((p) => ({
          name: p.name.length > 14 ? p.name.substring(0, 14) + "..." : p.name,
          revenue: p.revenue,
          profit: p.profit ?? 0,
          unitsSold: p.unitsSold,
        })),
    [productSales]
  );

  // ─── Sort Helpers ─────────────────────────────────────
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const toggleSalesSort = (field: SalesSortField) => {
    if (salesSortField === field) {
      setSalesSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSalesSortField(field);
      setSalesSortDir("desc");
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

  const SalesSortHeader = ({
    field,
    children,
  }: {
    field: SalesSortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => toggleSalesSort(field)}
      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 ${salesSortField === field ? "text-emerald-400" : ""}`} />
    </button>
  );

  // ─── Loading / Error ──────────────────────────────────
  if (stockLoading && tab === "stock") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (stockError && tab === "stock") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <AlertTriangle className="h-10 w-10 text-red-400" />
        <p className="text-sm text-red-400">{stockError}</p>
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
        <h1 className="text-2xl font-bold text-white">Inventory & Profit Tracker</h1>
        <p className="text-sm text-zinc-500">
          Stock levels, sales tracking, and profit analysis — owner access only
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 rounded-lg border border-emerald-900/30 bg-[#0a120a] p-1">
        <button
          onClick={() => setTab("stock")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "stock"
              ? "bg-emerald-600 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Warehouse className="h-4 w-4" />
          Current Stock
        </button>
        <button
          onClick={() => setTab("sales")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "sales"
              ? "bg-emerald-600 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Sales & Profit
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════
           TAB: CURRENT STOCK
         ════════════════════════════════════════════════════════ */}
      {tab === "stock" && (
        <>
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
                value={
                  summary.totalPotentialProfit != null
                    ? fmt(summary.totalPotentialProfit)
                    : "—"
                }
                sub={
                  summary.avgMargin != null
                    ? `${summary.avgMargin}% avg margin`
                    : "Set cost prices"
                }
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
                  {summary.lowStockCount} low stock
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

          {/* Stock Profit Chart */}
          {stockChartData.length > 0 && (
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
                <BarChart data={stockChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
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
                  <Tooltip content={<StockChartTooltip />} />
                  <Bar dataKey="totalProfit" radius={[0, 4, 4, 0]}>
                    {stockChartData.map((_, i) => (
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
        </>
      )}

      {/* ════════════════════════════════════════════════════════
           TAB: SALES & PROFIT
         ════════════════════════════════════════════════════════ */}
      {tab === "sales" && (
        <>
          {/* Date Range Selector */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "today", label: "Today" },
                { key: "7d", label: "7 Days" },
                { key: "30d", label: "30 Days" },
                { key: "90d", label: "90 Days" },
                { key: "all", label: "All Time" },
              ] as { key: DateRange; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDateRange(key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  dateRange === key
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-900/30 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {salesLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
          ) : salesError ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
              <AlertTriangle className="h-10 w-10 text-red-400" />
              <p className="text-sm text-red-400">{salesError}</p>
              <Button variant="outline" size="sm" onClick={() => fetchSales(dateRange)}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              {/* Sales KPI Cards */}
              {salesSummary && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <KpiCard
                    icon={ShoppingBag}
                    label="Orders Completed"
                    value={salesSummary.totalOrders.toLocaleString()}
                    sub={`${salesSummary.totalUnitsSold} units sold`}
                    color="bg-emerald-600"
                    delay={0}
                  />
                  <KpiCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={fmt(salesSummary.totalRevenue)}
                    sub="From completed sales"
                    color="bg-blue-600"
                    delay={0.05}
                  />
                  <KpiCard
                    icon={Package}
                    label="Total Cost (COGS)"
                    value={fmt(salesSummary.totalCost)}
                    sub="Cost of goods sold"
                    color="bg-orange-600"
                    delay={0.1}
                  />
                  <KpiCard
                    icon={TrendingUp}
                    label="Total Profit"
                    value={
                      salesSummary.totalProfit != null
                        ? fmt(salesSummary.totalProfit)
                        : "—"
                    }
                    sub={
                      salesSummary.avgMargin != null
                        ? `${salesSummary.avgMargin}% avg margin`
                        : "Set cost prices"
                    }
                    color="bg-gold-600"
                    delay={0.15}
                  />
                </div>
              )}

              {/* No data state */}
              {salesSummary && salesSummary.totalOrders === 0 && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-emerald-900/30 bg-[#111A11] py-12">
                  <Receipt className="h-10 w-10 text-zinc-600" />
                  <p className="text-sm text-zinc-500">
                    No completed sales in this period.
                  </p>
                </div>
              )}

              {/* Product Sales Table */}
              {filteredSales.length > 0 && (
                <>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input
                        placeholder="Search sold products..."
                        value={salesSearch}
                        onChange={(e) => setSalesSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-emerald-900/30 bg-[#111A11]">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead>
                        <tr className="border-b border-emerald-900/20">
                          <th className="px-4 py-3 text-left">
                            <SalesSortHeader field="name">Product</SalesSortHeader>
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Category
                          </th>
                          <th className="px-3 py-3 text-right">
                            <SalesSortHeader field="unitsSold">Sold</SalesSortHeader>
                          </th>
                          <th className="px-3 py-3 text-right">
                            <SalesSortHeader field="revenue">Revenue</SalesSortHeader>
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Cost
                          </th>
                          <th className="px-3 py-3 text-right">
                            <SalesSortHeader field="profit">Profit</SalesSortHeader>
                          </th>
                          <th className="px-3 py-3 text-right">
                            <SalesSortHeader field="margin">Margin</SalesSortHeader>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSales.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-emerald-900/10 transition-colors hover:bg-emerald-950/20"
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium text-white">{p.name}</span>
                              {p.weight && (
                                <span className="ml-2 text-xs text-zinc-500">
                                  {p.weight}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-zinc-400">{p.category}</td>
                            <td className="px-3 py-3 text-right font-mono text-white">
                              {p.unitsSold}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-white">
                              {fmt(p.revenue)}
                            </td>
                            <td className="px-3 py-3 text-right font-mono text-zinc-400">
                              {p.totalCost != null ? fmt(p.totalCost) : "—"}
                            </td>
                            <td className="px-3 py-3 text-right font-mono">
                              {p.profit != null ? (
                                <span
                                  className={
                                    p.profit >= 0 ? "text-emerald-400" : "text-red-400"
                                  }
                                >
                                  {fmt(p.profit)}
                                </span>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-zinc-600">
                    {filteredSales.length} products sold in this period
                  </p>
                </>
              )}

              {/* Sales Revenue Chart */}
              {salesChartData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4 sm:p-6"
                >
                  <h2 className="mb-4 text-base font-semibold text-white">
                    Top 10 — Revenue by Product
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={salesChartData}
                      layout="vertical"
                      margin={{ left: 10, right: 20 }}
                    >
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
                      <Tooltip content={<SalesChartTooltip />} />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {salesChartData.map((_, i) => (
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

              {/* Per-Order Transaction Breakdown */}
              {orders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h2 className="text-base font-semibold text-white">
                    Transaction Breakdown
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Click any order to see line-item profit detail
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-emerald-900/30 bg-[#111A11]">
                    <table className="w-full min-w-[700px] text-sm">
                      <thead>
                        <tr className="border-b border-emerald-900/20">
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Order
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Customer
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Date
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Items
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Revenue
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Cost
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                            Profit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <OrderRow key={order.id} order={order} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
