"use client";

import React, { useState, useCallback, useMemo } from "react";
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
  lastOrderAt: string;
  staffNotes: string;
  orders: CustomerOrder[];
}

// ─── Mock Data ───────────────────────────────────────────
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Sarah Martinez",
    phone: "(555) 123-4567",
    email: "sarah.m@email.com",
    loyaltyTier: "MASTER_GROWER",
    loyaltyPoints: 842,
    totalOrders: 67,
    totalSpent: 4280.0,
    joinedAt: "2024-03-15",
    lastOrderAt: "2025-02-19",
    staffNotes: "VIP customer. Prefers indica strains. Birthday: March 15.",
    orders: [
      { id: "o1", orderNumber: "THC-A1B2", date: "2025-02-19", total: 143.0, itemCount: 4, status: "PENDING" },
      { id: "o2", orderNumber: "THC-X9Y8", date: "2025-02-15", total: 85.0, itemCount: 2, status: "PICKED_UP" },
      { id: "o3", orderNumber: "THC-W7V6", date: "2025-02-10", total: 120.0, itemCount: 3, status: "PICKED_UP" },
      { id: "o4", orderNumber: "THC-U5T4", date: "2025-02-03", total: 55.0, itemCount: 1, status: "PICKED_UP" },
    ],
  },
  {
    id: "c2",
    name: "James Wilson",
    phone: "(555) 234-5678",
    email: "jwilson@email.com",
    loyaltyTier: "SEEDLING",
    loyaltyPoints: 12,
    totalOrders: 1,
    totalSpent: 97.0,
    joinedAt: "2025-02-18",
    lastOrderAt: "2025-02-18",
    staffNotes: "",
    orders: [
      { id: "o5", orderNumber: "THC-C3D4", date: "2025-02-18", total: 97.0, itemCount: 2, status: "PENDING" },
    ],
  },
  {
    id: "c3",
    name: "Maria Rodriguez",
    phone: "(555) 345-6789",
    email: "maria.r@email.com",
    loyaltyTier: "CULTIVATOR",
    loyaltyPoints: 256,
    totalOrders: 34,
    totalSpent: 2150.0,
    joinedAt: "2024-06-22",
    lastOrderAt: "2025-02-19",
    staffNotes: "Prefers sativa. Speaks Spanish — offer bilingual service.",
    orders: [
      { id: "o6", orderNumber: "THC-E5F6", date: "2025-02-19", total: 85.0, itemCount: 3, status: "CONFIRMED" },
      { id: "o7", orderNumber: "THC-S3R2", date: "2025-02-14", total: 62.0, itemCount: 2, status: "PICKED_UP" },
      { id: "o8", orderNumber: "THC-Q1P0", date: "2025-02-07", total: 105.0, itemCount: 3, status: "PICKED_UP" },
    ],
  },
  {
    id: "c4",
    name: "David Chen",
    phone: "(555) 456-7890",
    email: "d.chen@email.com",
    loyaltyTier: "GROWER",
    loyaltyPoints: 78,
    totalOrders: 12,
    totalSpent: 780.0,
    joinedAt: "2024-09-10",
    lastOrderAt: "2025-02-19",
    staffNotes: "Enjoys edibles and concentrates.",
    orders: [
      { id: "o9", orderNumber: "THC-G7H8", date: "2025-02-19", total: 161.0, itemCount: 4, status: "PREPARING" },
      { id: "o10", orderNumber: "THC-O9N8", date: "2025-02-12", total: 48.0, itemCount: 1, status: "PICKED_UP" },
    ],
  },
  {
    id: "c5",
    name: "Ashley Thompson",
    phone: "(555) 567-8901",
    email: "ashley.t@email.com",
    loyaltyTier: "GROWER",
    loyaltyPoints: 45,
    totalOrders: 8,
    totalSpent: 320.0,
    joinedAt: "2024-11-01",
    lastOrderAt: "2025-02-19",
    staffNotes: "",
    orders: [
      { id: "o11", orderNumber: "THC-I9J0", date: "2025-02-19", total: 36.0, itemCount: 3, status: "READY" },
      { id: "o12", orderNumber: "THC-M7L6", date: "2025-02-11", total: 42.0, itemCount: 1, status: "PICKED_UP" },
    ],
  },
  {
    id: "c6",
    name: "Kevin Brown",
    phone: "(555) 678-9012",
    loyaltyTier: "CULTIVATOR",
    loyaltyPoints: 190,
    totalOrders: 28,
    totalSpent: 1890.0,
    joinedAt: "2024-05-18",
    lastOrderAt: "2025-02-19",
    staffNotes: "Bulk buyer, always orders 7g+. Ask about loyalty rewards.",
    orders: [
      { id: "o13", orderNumber: "THC-K1L2", date: "2025-02-19", total: 156.0, itemCount: 4, status: "PENDING" },
      { id: "o14", orderNumber: "THC-K5J4", date: "2025-02-16", total: 148.0, itemCount: 3, status: "PICKED_UP" },
      { id: "o15", orderNumber: "THC-I3H2", date: "2025-02-09", total: 72.0, itemCount: 1, status: "PICKED_UP" },
    ],
  },
];

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
  onAdjust: (customerId: string, amount: number, reason: string) => void;
}

function PointsAdjustmentModal({
  customer,
  onClose,
  onAdjust,
}: PointsModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isAdding, setIsAdding] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pts = parseInt(amount);
    if (isNaN(pts) || pts <= 0 || !reason.trim()) return;
    onAdjust(customer.id, isAdding ? pts : -pts, reason);
    onClose();
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
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className={
                isAdding
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
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
  onNotesUpdate: (customerId: string, notes: string) => void;
  onPointsAdjust: (customer: Customer) => void;
}

function CustomerCard({
  customer,
  onNotesUpdate,
  onPointsAdjust,
}: CustomerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(customer.staffNotes);
  const tierConfig = TIER_CONFIG[customer.loyaltyTier];

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
            onBlur={() => onNotesUpdate(customer.id, notes)}
            placeholder="Add notes about this customer..."
            rows={2}
            className="w-full rounded-lg border border-emerald-900/30 bg-[#090F09] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          />
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
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [pointsModalCustomer, setPointsModalCustomer] =
    useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleNotesUpdate = useCallback(
    (customerId: string, notes: string) => {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, staffNotes: notes } : c
        )
      );
    },
    []
  );

  const handlePointsAdjust = useCallback(
    (customerId: string, amount: number, _reason: string) => {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId
            ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints + amount) }
            : c
        )
      );
    },
    []
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
          {customers.length} customers &middot; Search by name, phone, or email
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
      </div>

      {/* ─── Customer Grid ───────────────────────────────── */}
      {filteredCustomers.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onNotesUpdate={handleNotesUpdate}
              onPointsAdjust={setPointsModalCustomer}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/20 bg-[#111A11] py-16">
          <Users className="mb-3 h-10 w-10 text-zinc-700" />
          <h3 className="text-lg font-semibold text-zinc-400">
            No customers found
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            Try a different search term.
          </p>
        </div>
      )}

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
