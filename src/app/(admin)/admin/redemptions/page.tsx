"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Check,
  X,
  Loader2,
  Clock,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// ─── Types ────────────────────────────────────────────────
interface Redemption {
  id: string;
  customerId: string;
  customer: { id: string; name: string; phone: string; loyaltyTier: string };
  rewardKey: string;
  rewardLabel: string;
  pointsCost: number;
  status: string;
  fulfilledAt: string | null;
  expiresAt: string;
  staffNotes: string | null;
  createdAt: string;
}

type StatusTab = "PENDING" | "FULFILLED" | "CANCELLED" | "EXPIRED";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "FULFILLED", label: "Fulfilled" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "EXPIRED", label: "Expired" },
];

const TIER_COLORS: Record<string, string> = {
  SEEDLING: "border-lime-800/50 bg-lime-950/30 text-lime-400",
  GROWER: "border-emerald-800/50 bg-emerald-950/30 text-emerald-400",
  CULTIVATOR: "border-cyan-800/50 bg-cyan-950/30 text-cyan-400",
  MASTER_GROWER: "border-amber-800/50 bg-amber-950/30 text-amber-400",
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function timeUntil(date: string): string {
  const diff = new Date(date).getTime() - Date.now();
  if (diff <= 0) return "expired";
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${hrs}h left`;
  const days = Math.floor(hrs / 24);
  return `${days}d left`;
}

// ─── Page ─────────────────────────────────────────────────
export default function AdminRedemptionsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<StatusTab>("PENDING");
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchRedemptions = useCallback(async (status: StatusTab) => {
    try {
      const res = await fetch(`/api/redemptions/admin?status=${status}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRedemptions(data.redemptions || []);
      if (status === "PENDING") {
        setPendingCount(data.redemptions?.length || 0);
      }
    } catch {
      toast({ title: "Failed to load redemptions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    fetchRedemptions(tab);
  }, [tab, fetchRedemptions]);

  // Auto-refresh for PENDING tab
  useEffect(() => {
    if (tab !== "PENDING") return;
    const interval = setInterval(() => fetchRedemptions("PENDING"), 30000);
    return () => clearInterval(interval);
  }, [tab, fetchRedemptions]);

  const handleAction = async (id: string, status: "FULFILLED" | "CANCELLED") => {
    setActionId(id);
    try {
      const res = await fetch(`/api/redemptions/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: status === "FULFILLED" ? "Redemption fulfilled" : "Redemption cancelled",
        description: status === "CANCELLED" ? "Points have been refunded" : undefined,
      });
      fetchRedemptions(tab);
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#090F09] p-4 pt-16 lg:p-6 lg:pt-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900/40">
            <Gift className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Redemptions</h1>
            <p className="text-xs text-zinc-500">
              {pendingCount > 0
                ? `${pendingCount} pending redemption${pendingCount > 1 ? "s" : ""}`
                : "Manage customer reward redemptions"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-emerald-600 text-white"
                  : "bg-[#111A11] text-zinc-400 hover:text-zinc-200"
              )}
            >
              {t.label}
              {t.key === "PENDING" && pendingCount > 0 && (
                <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-black">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : redemptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-3 h-10 w-10 text-zinc-700" />
            <p className="text-sm text-zinc-500">
              No {tab.toLowerCase()} redemptions
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {redemptions.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-emerald-900/20 bg-[#111A11] p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Reward icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-900/30 text-2xl">
                      {r.rewardKey === "FREE_PREROLL" && "🚬"}
                      {r.rewardKey === "FREE_EDIBLE" && "🍬"}
                      {r.rewardKey === "FREE_1G_CONCENTRATE" && "💎"}
                      {r.rewardKey === "FREE_EIGHTH_FLOWER" && "🌿"}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {r.rewardLabel}
                        </p>
                        <span className="shrink-0 text-xs text-zinc-500">
                          {r.pointsCost} pts
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-zinc-400">
                        {r.customer.name} &middot; {r.customer.phone}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                            TIER_COLORS[r.customer.loyaltyTier] || "text-zinc-500"
                          )}
                        >
                          {r.customer.loyaltyTier.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-zinc-600">
                          Redeemed {timeAgo(r.createdAt)}
                        </span>
                        {r.status === "PENDING" && (
                          <span className="flex items-center gap-1 text-[11px] text-amber-500">
                            <Clock className="h-3 w-3" />
                            {timeUntil(r.expiresAt)}
                          </span>
                        )}
                        {r.status === "FULFILLED" && r.fulfilledAt && (
                          <span className="text-[11px] text-emerald-500">
                            Fulfilled {timeAgo(r.fulfilledAt)}
                          </span>
                        )}
                        {(r.status === "EXPIRED" || r.status === "CANCELLED") && (
                          <span className="text-[11px] text-zinc-600">
                            Points refunded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions for PENDING */}
                    {r.status === "PENDING" && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => handleAction(r.id, "FULFILLED")}
                          disabled={actionId === r.id}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                          aria-label="Fulfill redemption"
                        >
                          {actionId === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Cancel this redemption? ${r.pointsCost} points will be refunded to ${r.customer.name}.`)) {
                              handleAction(r.id, "CANCELLED");
                            }
                          }}
                          disabled={actionId === r.id}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-900/30 text-red-400 transition-colors hover:bg-red-950/30 disabled:opacity-50"
                          aria-label="Cancel redemption"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Status badge for non-pending */}
                    {r.status !== "PENDING" && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase",
                          r.status === "FULFILLED" && "bg-emerald-950/50 text-emerald-400",
                          r.status === "EXPIRED" && "bg-zinc-800/50 text-zinc-500",
                          r.status === "CANCELLED" && "bg-red-950/50 text-red-400"
                        )}
                      >
                        {r.status}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
