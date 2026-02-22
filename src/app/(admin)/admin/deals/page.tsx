"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────
interface DealProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  categoryId: string;
}

interface Deal {
  id: string;
  productId: string;
  product: DealProduct;
  titleEn: string;
  titleEs?: string | null;
  badgeText?: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
}

// ─── Create Deal Form ────────────────────────────────────
interface CreateFormProps {
  onClose: () => void;
  onSubmit: (data: CreatePayload) => Promise<void>;
  submitting: boolean;
  products: ProductOption[];
}

interface CreatePayload {
  productId: string;
  titleEn: string;
  titleEs?: string;
  badgeText?: string;
  startsAt: string;
  endsAt: string;
}

function CreateDealForm({
  onClose,
  onSubmit,
  submitting,
  products,
}: CreateFormProps) {
  const [form, setForm] = useState({
    productId: "",
    titleEn: "",
    titleEs: "",
    badgeText: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProduct = products.find((p) => p.id === form.productId);

  const toISO = (date: string, time: string) => {
    const d = new Date(`${date}T${time || "00:00"}`);
    return d.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.productId || !form.titleEn || !form.startDate || !form.endDate) {
      return;
    }

    const startsAt = toISO(form.startDate, form.startTime || "00:00");
    const endsAt = toISO(form.endDate, form.endTime || "23:59");

    await onSubmit({
      productId: form.productId,
      titleEn: form.titleEn,
      titleEs: form.titleEs || undefined,
      badgeText: form.badgeText || undefined,
      startsAt,
      endsAt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 my-8 w-full max-w-2xl rounded-2xl border border-emerald-900/30 bg-[#111A11] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">Create New Deal</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Product
            </label>
            {selectedProduct ? (
              <div className="flex items-center justify-between rounded-lg border border-emerald-600/30 bg-emerald-600/5 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">
                    {selectedProduct.name}
                  </p>
                  <p className="text-xs text-emerald-400">
                    ${selectedProduct.price.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, productId: "" })}
                  className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="pl-9"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-emerald-900/20 bg-[#090F09]">
                  {filteredProducts.length === 0 ? (
                    <p className="px-3 py-4 text-center text-xs text-zinc-600">
                      No products found
                    </p>
                  ) : (
                    filteredProducts.slice(0, 20).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                          setForm({ ...form, productId: product.id })
                        }
                        className="flex w-full items-center gap-3 border-b border-emerald-900/10 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-emerald-950/30"
                      >
                        <p className="flex-1 truncate text-sm text-zinc-300">
                          {product.name}
                        </p>
                        <span className="text-xs text-zinc-500">
                          ${product.price.toFixed(2)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Deal Title (EN) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Deal Title (English) *
            </label>
            <Input
              value={form.titleEn}
              onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
              placeholder="e.g. Flash Sale - 20% off pre-rolls"
              required
              disabled={submitting}
            />
          </div>

          {/* Deal Title (ES) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Deal Title (Spanish)
            </label>
            <Input
              value={form.titleEs}
              onChange={(e) => setForm({ ...form, titleEs: e.target.value })}
              placeholder="e.g. Venta flash - 20% de descuento en pre-rolls"
              disabled={submitting}
            />
          </div>

          {/* Badge Text */}
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">
              Badge Text
            </label>
            <Input
              value={form.badgeText}
              onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
              placeholder="e.g. $5 OFF, 20% OFF, BOGO"
              disabled={submitting}
            />
            <p className="mt-1 text-[10px] text-zinc-600">
              Shown on the deal card overlay. Keep it short.
            </p>
          </div>

          {/* Start Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Start Date *
              </label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Start Time
              </label>
              <Input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                disabled={submitting}
              />
            </div>
          </div>

          {/* End Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                End Date *
              </label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                End Time
              </label>
              <Input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-emerald-900/20 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Deal
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Deal Status Helpers ─────────────────────────────────
function getDealStatus(deal: Deal): "active" | "upcoming" | "expired" {
  const now = new Date();
  const start = new Date(deal.startsAt);
  const end = new Date(deal.endsAt);

  if (!deal.isActive) return "expired";
  if (now < start) return "upcoming";
  if (now > end) return "expired";
  return "active";
}

function DealStatusBadge({ deal }: { deal: Deal }) {
  const status = getDealStatus(deal);

  switch (status) {
    case "active":
      return (
        <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case "upcoming":
      return (
        <Badge className="border border-blue-500/20 bg-blue-500/10 text-blue-400">
          <Clock className="mr-1 h-3 w-3" />
          Upcoming
        </Badge>
      );
    case "expired":
      return (
        <Badge className="border border-zinc-500/20 bg-zinc-500/10 text-zinc-400">
          Expired
        </Badge>
      );
  }
}

// ─── Deals Admin Page ────────────────────────────────────
export default function DealsAdminPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "expired"
  >("all");

  // ── Fetch deals ──
  const fetchDeals = useCallback(async () => {
    try {
      setFetchError(null);
      // Fetch all deals (not just active ones) for admin view
      const res = await fetch("/api/deals?admin=true");
      if (!res.ok) throw new Error(`Failed to fetch deals (${res.status})`);
      const data: Deal[] = await res.json();
      setDeals(data);
    } catch (err) {
      console.error("Error fetching deals:", err);
      setFetchError(
        err instanceof Error ? err.message : "Failed to load deals"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch products for the create form ──
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=200");
      if (!res.ok) return;
      const data = await res.json();
      // Handle both array responses and paginated responses
      const items = Array.isArray(data) ? data : data.products || [];
      setProducts(
        items.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
          imageUrl: p.imageUrl,
        }))
      );
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, [fetchDeals, fetchProducts]);

  // ── Auto-dismiss messages ──
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // ── Create deal ──
  const handleCreate = useCallback(
    async (payload: CreatePayload) => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        const res = await fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `Failed to create deal (${res.status})`
          );
        }

        setSuccessMessage("Deal created successfully");
        setShowCreate(false);
        await fetchDeals();
      } catch (err) {
        console.error("Error creating deal:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to create deal"
        );
      } finally {
        setSubmitting(false);
      }
    },
    [fetchDeals]
  );

  // ── Toggle active ──
  const handleToggle = useCallback(
    async (deal: Deal) => {
      setTogglingId(deal.id);
      try {
        const res = await fetch(`/api/deals/${deal.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !deal.isActive }),
        });

        if (!res.ok) throw new Error("Failed to toggle deal");

        setDeals((prev) =>
          prev.map((d) =>
            d.id === deal.id ? { ...d, isActive: !d.isActive } : d
          )
        );
        setSuccessMessage(
          `Deal ${deal.isActive ? "deactivated" : "activated"}`
        );
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to toggle deal"
        );
      } finally {
        setTogglingId(null);
      }
    },
    []
  );

  // ── Delete deal ──
  const handleDelete = useCallback(
    async (deal: Deal) => {
      if (
        !window.confirm(
          `Delete deal "${deal.titleEn}"? This cannot be undone.`
        )
      )
        return;

      setDeletingId(deal.id);
      try {
        const res = await fetch(`/api/deals/${deal.id}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete deal");

        setDeals((prev) => prev.filter((d) => d.id !== deal.id));
        setSuccessMessage("Deal deleted");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to delete deal"
        );
      } finally {
        setDeletingId(null);
      }
    },
    []
  );

  // ── Filter deals ──
  const filteredDeals = deals.filter((deal) => {
    if (filterStatus === "all") return true;
    const status = getDealStatus(deal);
    if (filterStatus === "active") return status === "active" || status === "upcoming";
    return status === "expired";
  });

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Zap className="mr-2 inline-block h-6 w-6 text-amber-400" />
            Deals
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {loading
              ? "Loading..."
              : `${deals.length} deals total \u00b7 ${deals.filter((d) => getDealStatus(d) === "active").length} active`}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Create Deal
        </Button>
      </div>

      {/* ─── Filter Tabs ─────────────────────────────────── */}
      <div className="mb-4 flex gap-2">
        {(["all", "active", "expired"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              filterStatus === status
                ? "bg-emerald-600/15 text-emerald-400"
                : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ─── Success / Error Messages ────────────────────── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="flex-1 text-sm text-emerald-300">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="flex-1 text-sm text-red-300">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="rounded-lg p-1 text-red-400 hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Loading State ───────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/20 bg-[#111A11] py-16">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-500">Loading deals...</p>
        </div>
      )}

      {/* ─── Fetch Error State ───────────────────────────── */}
      {!loading && fetchError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-900/20 bg-[#111A11] py-16">
          <AlertCircle className="mb-3 h-10 w-10 text-red-500" />
          <h3 className="text-lg font-semibold text-zinc-400">
            Failed to load deals
          </h3>
          <p className="mt-1 text-sm text-zinc-600">{fetchError}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setLoading(true);
              fetchDeals();
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* ─── Deals List ──────────────────────────────────── */}
      {!loading && !fetchError && (
        <div className="space-y-3">
          {filteredDeals.map((deal) => (
            <motion.div
              key={deal.id}
              layout
              className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-200">
                      {deal.titleEn}
                    </h3>
                    <DealStatusBadge deal={deal} />
                    {deal.badgeText && (
                      <Badge className="border border-amber-500/20 bg-amber-500/10 text-amber-400">
                        <Tag className="mr-1 h-3 w-3" />
                        {deal.badgeText}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-zinc-500">
                    Product:{" "}
                    <span className="text-zinc-400">
                      {deal.product.name}
                    </span>{" "}
                    &middot; ${deal.product.price.toFixed(2)}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(deal.startsAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-zinc-700">&rarr;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(deal.endsAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggle(deal)}
                    disabled={togglingId === deal.id}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-lg border transition-colors disabled:opacity-50",
                      deal.isActive
                        ? "border-emerald-700/30 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40"
                        : "border-zinc-700/30 bg-zinc-800/20 text-zinc-500 hover:bg-zinc-800/40"
                    )}
                    title={deal.isActive ? "Deactivate deal" : "Activate deal"}
                  >
                    {togglingId === deal.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : deal.isActive ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(deal)}
                    disabled={deletingId === deal.id}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-900/20 bg-red-900/10 text-red-400 transition-colors hover:bg-red-900/30 disabled:opacity-50"
                    title="Delete deal"
                  >
                    {deletingId === deal.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredDeals.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/20 bg-[#111A11] py-16">
              <Zap className="mb-3 h-10 w-10 text-zinc-700" />
              <h3 className="text-lg font-semibold text-zinc-400">
                {filterStatus === "all"
                  ? "No deals yet"
                  : `No ${filterStatus} deals`}
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                {filterStatus === "all"
                  ? "Create your first deal to boost sales."
                  : "Try changing the filter."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Create Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showCreate && (
          <CreateDealForm
            onClose={() => {
              if (!submitting) setShowCreate(false);
            }}
            onSubmit={handleCreate}
            submitting={submitting}
            products={products}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
