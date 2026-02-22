"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Volume2,
  VolumeX,
  ShoppingCart,
  Inbox,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import OrderCard, { type OrderData } from "@/components/admin/OrderCard";

// ─── Status Filter Tabs ──────────────────────────────────
type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "PREPARING" | "READY";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
];

// ─── Transform API order → OrderCard props ────────────────
function transformOrder(apiOrder: any): OrderData {
  return {
    id: apiOrder.id,
    orderNumber: apiOrder.orderNumber,
    customerName: apiOrder.customer?.name || apiOrder.guestName || "Guest",
    customerPhone: apiOrder.customer?.phone || apiOrder.guestPhone || undefined,
    status: apiOrder.status,
    items: (apiOrder.items || []).map((item: any) => {
      const snapshot = item.productSnapshot || {};
      const product = item.product || {};
      return {
        id: item.id,
        productName: snapshot.name || product.name || "Unknown",
        quantity: item.quantity,
        price: Number(item.unitPriceAtOrder || 0),
        variant: [
          snapshot.strainType || product.strainType,
          snapshot.thcPercentage || product.thcPercentage
            ? `${snapshot.thcPercentage || product.thcPercentage}% THCA`
            : null,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
      };
    }),
    totalItems: apiOrder.totalItems,
    totalPrice: (apiOrder.items || []).reduce(
      (sum: number, item: any) => sum + Number(item.unitPriceAtOrder || 0) * item.quantity,
      0
    ),
    aiPriorityScore: apiOrder.aiPriorityScore ?? 5,
    aiFlags: apiOrder.aiFlags || [],
    aiReason: apiOrder.aiReason || "",
    createdAt: apiOrder.createdAt,
    confirmedAt: apiOrder.confirmedAt || undefined,
    readyAt: apiOrder.readyAt || undefined,
    staffNotes: apiOrder.staffNotes || "",
  };
}

// ─── Chime Sound Generator (Web Audio API) ──────────────
function playChimeSound(): void {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

    frequencies.forEach((freq, index) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
      const startTime = audioCtx.currentTime + index * 0.12;
      const duration = 0.4;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  } catch {
    // Web Audio API not available
  }
}

// ─── Live Order Queue Page ──────────────────────────────
export default function AdminOrderQueuePage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const orderCountRef = useRef(0);

  // ─── Fetch Orders from API ────────────────────────────────
  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch("/api/orders?limit=50");
      if (res.ok) {
        const data = await res.json();
        const transformed = (data.orders || []).map(transformOrder);
        setOrders(transformed);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(), 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Play chime when new orders arrive
  useEffect(() => {
    if (orders.length > orderCountRef.current && soundEnabled && orderCountRef.current > 0) {
      playChimeSound();
    }
    orderCountRef.current = orders.length;
  }, [orders.length, soundEnabled]);

  // ─── Status Change via API ────────────────────────────────
  const updateOrderStatus = useCallback(
    async (orderId: string, status: string, extra?: Record<string, unknown>) => {
      // Optimistic UI update
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: status as OrderData["status"],
                ...(status === "CONFIRMED" ? { confirmedAt: new Date().toISOString() } : {}),
                ...(status === "READY" ? { readyAt: new Date().toISOString() } : {}),
              }
            : o
        )
      );

      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, ...extra }),
        });
        if (!res.ok) {
          // Revert on failure
          fetchOrders();
        }
      } catch {
        fetchOrders();
      }
    },
    [fetchOrders]
  );

  const handleConfirm = useCallback(
    (orderId: string) => updateOrderStatus(orderId, "CONFIRMED"),
    [updateOrderStatus]
  );

  const handleStartPreparing = useCallback(
    (orderId: string) => updateOrderStatus(orderId, "PREPARING"),
    [updateOrderStatus]
  );

  const handleMarkReady = useCallback(
    (orderId: string) => updateOrderStatus(orderId, "READY"),
    [updateOrderStatus]
  );

  const handleMarkPickedUp = useCallback(
    (orderId: string) => updateOrderStatus(orderId, "PICKED_UP"),
    [updateOrderStatus]
  );

  const handleCancel = useCallback(
    (orderId: string) => {
      if (!window.confirm("Are you sure you want to cancel this order? This cannot be undone.")) return;
      updateOrderStatus(orderId, "CANCELLED");
    },
    [updateOrderStatus]
  );

  const handleNotesUpdate = useCallback(
    async (orderId: string, notes: string) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, staffNotes: notes } : o))
      );
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffNotes: notes }),
        });
      } catch {
        // Non-critical — notes saved optimistically
      }
    },
    []
  );

  const handleItemUnavailable = useCallback(
    (_orderId: string, itemId: string, unavailable: boolean) => {
      console.log(`Item ${itemId} marked ${unavailable ? "unavailable" : "available"}`);
    },
    []
  );

  const handleRefresh = useCallback(() => fetchOrders(true), [fetchOrders]);

  // ─── Filtered & Sorted Orders ──────────────────────────
  const filteredOrders = orders
    .filter((o) => {
      if (statusFilter === "ALL") return !["PICKED_UP", "CANCELLED"].includes(o.status);
      return o.status === statusFilter;
    })
    .sort((a, b) => {
      if ((b.aiPriorityScore || 0) !== (a.aiPriorityScore || 0)) {
        return (b.aiPriorityScore || 0) - (a.aiPriorityScore || 0);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  // ─── Status Counts ─────────────────────────────────────
  const statusCounts: Record<string, number> = {
    ALL: orders.filter((o) => !["PICKED_UP", "CANCELLED"].includes(o.status)).length,
    PENDING: orders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: orders.filter((o) => o.status === "CONFIRMED").length,
    PREPARING: orders.filter((o) => o.status === "PREPARING").length,
    READY: orders.filter((o) => o.status === "READY").length,
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <ShoppingCart className="mr-2 inline-block h-6 w-6 text-emerald-400" />
            Live Order Queue
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Last updated:{" "}
            {lastRefresh.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChimeSound();
            }}
            className={cn(
              "gap-2",
              soundEnabled
                ? "border-emerald-700/50 text-emerald-400"
                : "border-zinc-700/50 text-zinc-500"
            )}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ─── Status Filter Tabs ──────────────────────────── */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-emerald-900/30 bg-[#111A11] p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "relative flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
              statusFilter === tab.value
                ? "bg-emerald-600/15 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {statusFilter === tab.value && (
              <motion.div
                layoutId="order-status-tab"
                className="absolute inset-0 rounded-lg bg-emerald-600/10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            <span
              className={cn(
                "relative z-10 rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                statusFilter === tab.value
                  ? "bg-emerald-600/20 text-emerald-400"
                  : "bg-zinc-800 text-zinc-500"
              )}
            >
              {statusCounts[tab.value]}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Order Grid ──────────────────────────────────── */}
      {filteredOrders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirm={handleConfirm}
                onStartPreparing={handleStartPreparing}
                onMarkReady={handleMarkReady}
                onMarkPickedUp={handleMarkPickedUp}
                onCancel={handleCancel}
                onNotesUpdate={handleNotesUpdate}
                onItemUnavailable={handleItemUnavailable}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/20 bg-[#111A11] py-20"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-900/20">
            <Inbox className="h-8 w-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-400">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-zinc-600">
            {statusFilter === "ALL"
              ? "New orders will appear here in real-time."
              : `No ${statusFilter.toLowerCase()} orders right now.`}
          </p>
        </motion.div>
      )}
    </div>
  );
}
