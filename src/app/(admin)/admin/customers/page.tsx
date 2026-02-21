"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingCart,
  MessageSquare,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Award,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────
interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  itemCount: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyTier: "SEEDLING" | "GROWER" | "CULTIVATOR" | "MASTER_GROWER";
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  lastOrderAt: string | null;
  staffNotes: string;
  orders: CustomerOrder[];
}

// ─── Tier Config ─────────────────────────────────────────
const TIER_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  SEEDLING: {
    label: "Seedling",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    icon: "🌱",
  },
  GROWER: {
    label: "Grower",
    color: "text-emerald-300",
    bgColor: "bg-emerald-500/15 border-emerald-500/25",
    icon: "🌿",
  },
  CULTIVATOR: {
    label: "Cultivator",
    color: "text-[#D4AF37]",
    bgColor: "bg-[#D4AF37]/10 border-[#D4AF37]/20",
    icon: "🌳",
  },
  MASTER_GROWER: {
    label: "Master Grower",
    color: "text-[#D4AF37]",
    bgColor: "bg-[#D4AF37]/15 border-[#D4AF37]/30",
    icon: "👑",
  },
};

// ─── Points Adjustment Modal ─────────────────────────────
interface PointsModalProps {
  customer: Customer;
  onClose: () => void;
  onAdjust: (customerId: string, amount: number, reason: string) => Promise<void>;
}

function PointsAdjustmentModal({
  customer,
  onClose,
  onAdjust,
}: PointsModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isAdding, setIsAdding] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(amount);
    if (isNaN(pts) || pts <= 0 || !reason.trim()) return;
    setSaving(true);
    try {
      await onAdjust(customer.id, isAdding ? pts : -pts, reason);
      onClose();
    } catch {
      // Error is handled by the parent; keep modal open so user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-900/30 bg-[#111A11] p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-100">Adjust Points</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-zinc-400">
          {customer.name} &middot; Current: {customer.loyaltyPoints} pts
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                isAdding
                  ? "bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-600/50"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              <Plus className="mr-1 inline h-4 w-4" />
              Add Points
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                !isAdding
                  ? "bg-red-600/20 text-red-400 ring-1 ring-red-600/50"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              <Minus className="mr-1 inline h-4 w-4" />
              Remove Points
            </button>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Amount
            </label>
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter points amount"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-400">
              Reason
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Birthday bonus, Customer complaint resolution"
              required
              disabled={saving}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className={
                isAdding
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isAdding ? "Add" : "Remove"} Points
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Customer Card ───────────────────────────────────────
interface CustomerCardProps {
  customer: Customer;
  onNotesUpdate: (customerId: string, notes: string) => Promise<void>;
  onPointsAdjust: (customer: Customer) => void;
}

function CustomerCard({
  customer,
  onNotesUpdate,
  onPointsAdjust,
}: CustomerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(customer.staffNotes);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const tierConfig = TIER_CONFIG[customer.loyaltyTier];

  // Keep local notes in sync when customer data is refetched
  const prevNotesRef = useRef(customer.staffNotes);
  useEffect(() => {
    if (prevNotesRef.current !== customer.staffNotes) {
      setNotes(customer.staffNotes);
      prevNotesRef.current = customer.staffNotes;
    }
  }, [customer.staffNotes]);

  const handleSaveNotes = async () => {
    if (notes === customer.staffNotes) return;
    setSavingNotes(true);
    try {
      await onNotesUpdate(customer.id, notes);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      // Revert on failure
      setNotes(customer.staffNotes);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <motion.div
      layout
      className="rounded-xl border border-emerald-900/30 bg-[#111A11] transition-shadow hover:shadow-lg"
    >
      <div className="p-5">
        {/* Customer Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-900/30 text-lg font-bold text-emerald-400">
              {customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                {customer.name}
              </h3>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Loyalty Badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1",
              tierConfig.bgColor
            )}
          >
            <span className="text-sm">{tierConfig.icon}</span>
            <span className={cn("text-xs font-semibold", tierConfig.color)}>
              {tierConfig.label}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="rounded-lg bg-[#090F09] p-2.5 text-center">
            <p className="text-lg font-bold text-zinc-100">
              {customer.loyaltyPoints}
            </p>
            <p className="text-[10px] text-zinc-500">Points</p>
          </div>
          <div className="rounded-lg bg-[#090F09] p-2.5 text-center">
            <p className="text-lg font-bold text-zinc-100">
              {customer.totalOrders}
            </p>
            <p className="text-[10px] text-zinc-500">Orders</p>
          </div>
          <div className="rounded-lg bg-[#090F09] p-2.5 text-center">
            <p className="text-lg font-bold text-zinc-100">
              ${customer.totalSpent.toFixed(0)}
            </p>
            <p className="text-[10px] text-zinc-500">Spent</p>
          </div>
          <div className="rounded-lg bg-[#090F09] p-2.5 text-center">
            <p className="text-sm font-bold text-zinc-100">
              {new Date(customer.joinedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "2-digit",
              })}
            </p>
            <p className="text-[10px] text-zinc-500">Joined</p>
          </div>
        </div>

        {/* Points Adjustment Button */}
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => onPointsAdjust(customer)}
          >
            <Award className="h-4 w-4" />
            Adjust Points
          </Button>
        </div>

        {/* Staff Notes */}
        <div className="mt-3">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <MessageSquare className="h-3 w-3" />
            Staff Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this customer..."
            rows={2}
            className="w-full rounded-lg border border-emerald-900/30 bg-[#090F09] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
          {notes !== customer.staffNotes && (
            <Button
              size="sm"
              className="mt-1.5 bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSaveNotes}
              disabled={savingNotes}
            >
              {savingNotes ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : null}
              Save Notes
            </Button>
          )}
          {notesSaved && (
            <p className="mt-1 text-xs text-emerald-400">Notes saved.</p>
          )}
        </div>
      </div>

      {/* Order History Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-1.5 border-t border-emerald-900/20 py-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-emerald-950/20 hover:text-zinc-300"
      >
        <ShoppingCart className="h-3.5 w-3.5" />
        Order History ({customer.orders.length})
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-emerald-900/20 p-4">
              {customer.orders.length > 0 ? (
                <div className="space-y-2">
                  {customer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg bg-[#090F09] px-3 py-2"
                    >
                      <div>
                        <span className="text-sm font-medium text-zinc-200">
                          #{order.orderNumber}
                        </span>
                        <span className="ml-2 text-xs text-zinc-500">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500">
                          {order.itemCount} items
                        </span>
                        <span className="text-sm font-medium text-zinc-300">
                          ${order.total.toFixed(2)}
                        </span>
                        <Badge
                          variant={
                            order.status === "PICKED_UP"
                              ? "success"
                              : order.status === "CANCELLED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-zinc-500">
                  No orders yet.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Customer Lookup Page ────────────────────────────────
export default function CustomerLookupPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [pointsModalCustomer, setPointsModalCustomer] =
    useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  // Debounce search to avoid excessive API calls
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch customers from the API
  const fetchCustomers = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = search
        ? `/api/customers?search=${encodeURIComponent(search)}`
        : "/api/customers";
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch customers (${res.status})`);
      }
      const data: Customer[] = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || "Failed to load customers");
      console.error("fetchCustomers error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + refetch on search change
  useEffect(() => {
    fetchCustomers(debouncedSearch || undefined);
  }, [debouncedSearch, fetchCustomers]);

  // Save staff notes via PATCH
  const handleNotesUpdate = useCallback(
    async (customerId: string, notes: string) => {
      setMutating(true);
      try {
        const res = await fetch(`/api/customers/${customerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffNotes: notes }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to save notes");
        }
        // Refetch to get fresh data
        await fetchCustomers(debouncedSearch || undefined);
      } catch (err: any) {
        console.error("handleNotesUpdate error:", err);
        throw err; // Re-throw so the card can revert
      } finally {
        setMutating(false);
      }
    },
    [fetchCustomers, debouncedSearch]
  );

  // Adjust loyalty points via PATCH
  const handlePointsAdjust = useCallback(
    async (customerId: string, amount: number, reason: string) => {
      setMutating(true);
      try {
        const res = await fetch(`/api/customers/${customerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loyaltyAdjustment: amount,
            loyaltyReason: reason,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to adjust points");
        }
        // Refetch to get fresh data
        await fetchCustomers(debouncedSearch || undefined);
      } catch (err: any) {
        console.error("handlePointsAdjust error:", err);
        throw err; // Re-throw so the modal can stay open for retry
      } finally {
        setMutating(false);
      }
    },
    [fetchCustomers, debouncedSearch]
  );

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">
          <Users className="mr-2 inline-block h-6 w-6 text-emerald-400" />
          Customer Lookup
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {loading
            ? "Loading customers..."
            : `${customers.length} customer${customers.length !== 1 ? "s" : ""}`}{" "}
          &middot; Search by name, phone, or email
        </p>
      </div>

      {/* ─── Search ──────────────────────────────────────── */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone number, or email..."
          className="pl-10 text-base"
        />
        {(loading || mutating) && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-500" />
        )}
      </div>

      {/* ─── Error State ─────────────────────────────────── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-900/30 bg-red-950/20 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCustomers(debouncedSearch || undefined)}
            className="border-red-900/40 text-red-300 hover:bg-red-950/30"
          >
            Retry
          </Button>
        </div>
      )}

      {/* ─── Loading State ───────────────────────────────── */}
      {loading && customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/20 bg-[#111A11] py-16">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-emerald-500" />
          <h3 className="text-lg font-semibold text-zinc-400">
            Loading customers...
          </h3>
        </div>
      ) : customers.length > 0 ? (
        /* ─── Customer Grid ───────────────────────────────── */
        <div className="grid gap-4 lg:grid-cols-2">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onNotesUpdate={handleNotesUpdate}
              onPointsAdjust={setPointsModalCustomer}
            />
          ))}
        </div>
      ) : !loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/20 bg-[#111A11] py-16">
          <Users className="mb-3 h-10 w-10 text-zinc-700" />
          <h3 className="text-lg font-semibold text-zinc-400">
            No customers found
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            {searchQuery
              ? "Try a different search term."
              : "No customer records yet."}
          </p>
        </div>
      ) : null}

      {/* ─── Points Modal ────────────────────────────────── */}
      <AnimatePresence>
        {pointsModalCustomer && (
          <PointsAdjustmentModal
            customer={pointsModalCustomer}
            onClose={() => setPointsModalCustomer(null)}
            onAdjust={handlePointsAdjust}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
