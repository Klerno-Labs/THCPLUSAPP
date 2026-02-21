"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Volume2,
  VolumeX,
  ShoppingCart,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import OrderCard, { type OrderData } from "@/components/admin/OrderCard";

// ─── Mock Data ───────────────────────────────────────────
const MOCK_ORDERS: OrderData[] = [
  {
    id: "ord_1",
    orderNumber: "THC-A1B2",
    customerName: "Sarah Martinez",
    customerPhone: "(346) 123-4567",
    status: "PENDING",
    items: [
      { id: "i1", productName: "Gelato 33", quantity: 2, price: 0, variant: "Hybrid · 29% THCA" },
      { id: "i2", productName: "Mochi", quantity: 1, price: 0, variant: "Hybrid · 29% THCA" },
      { id: "i3", productName: "Pineapple Express (Concentrate)", quantity: 1, price: 0, variant: "Sativa · 85% THCA" },
    ],
    totalItems: 4,
    totalPrice: 0,
    aiPriorityScore: 9,
    aiFlags: ["High-value order", "VIP customer"],
    aiReason: "VIP customer with multi-item order including concentrates. Priority processing recommended.",
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    staffNotes: "",
  },
  {
    id: "ord_2",
    orderNumber: "THC-C3D4",
    customerName: "James Wilson",
    customerPhone: "(346) 234-5678",
    status: "PENDING",
    items: [
      { id: "i4", productName: "Whiteboy Cookies", quantity: 1, price: 0, variant: "Hybrid · 28% THCA" },
      { id: "i5", productName: "MAC (Concentrate)", quantity: 1, price: 0, variant: "Hybrid · 88% THCA" },
    ],
    totalItems: 2,
    totalPrice: 0,
    aiPriorityScore: 6,
    aiFlags: ["First-time customer"],
    aiReason: "New customer first order. Good first impression opportunity.",
    createdAt: new Date(Date.now() - 7 * 60000).toISOString(),
  },
  {
    id: "ord_3",
    orderNumber: "THC-E5F6",
    customerName: "Maria Rodriguez",
    customerPhone: "(346) 345-6789",
    status: "CONFIRMED",
    items: [
      { id: "i6", productName: "Motor Breath", quantity: 1, price: 0, variant: "Indica · 32% THCA" },
      { id: "i7", productName: "Premium Pre-Roll", quantity: 2, price: 0, variant: "Hybrid · 28% THCA" },
    ],
    totalItems: 3,
    totalPrice: 0,
    aiPriorityScore: 4,
    aiReason: "Standard order, regular customer. Normal processing.",
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    confirmedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: "ord_4",
    orderNumber: "THC-G7H8",
    customerName: "David Chen",
    customerPhone: "(346) 456-7890",
    status: "PREPARING",
    items: [
      { id: "i8", productName: "Ice Cream Cake", quantity: 2, price: 0, variant: "Indica · 28% THCA" },
      { id: "i9", productName: "Lemon Zkittlez", quantity: 1, price: 0, variant: "Sativa · 26% THCA" },
      { id: "i10", productName: "Cookies N Creme (Concentrate)", quantity: 1, price: 0, variant: "Hybrid · 86% THCA" },
    ],
    totalItems: 4,
    totalPrice: 0,
    aiPriorityScore: 7,
    aiFlags: ["Waiting 15+ min"],
    aiReason: "Order has been in preparation for 15 minutes. Customer may be en route.",
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    confirmedAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "ord_5",
    orderNumber: "THC-I9J0",
    customerName: "Ashley Thompson",
    customerPhone: "(346) 567-8901",
    status: "READY",
    items: [
      { id: "i11", productName: "Premium Pre-Roll", quantity: 3, price: 0, variant: "Hybrid · 28% THCA" },
    ],
    totalItems: 3,
    totalPrice: 0,
    aiPriorityScore: 2,
    aiReason: "Small order, ready for pickup. Low complexity.",
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    confirmedAt: new Date(Date.now() - 22 * 60000).toISOString(),
    readyAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "ord_6",
    orderNumber: "THC-K1L2",
    customerName: "Kevin Brown",
    status: "PENDING",
    items: [
      { id: "i12", productName: "Mac Flurry", quantity: 1, price: 0, variant: "Hybrid · 30% THCA" },
      { id: "i13", productName: "Sour Tangie (Concentrate)", quantity: 2, price: 0, variant: "Sativa · 84% THCA" },
      { id: "i14", productName: "Hi Berry Chew", quantity: 1, price: 0, variant: "Hybrid · 25% THCA" },
    ],
    totalItems: 4,
    totalPrice: 0,
    aiPriorityScore: 8,
    aiFlags: ["High-value order", "Multiple premium items"],
    aiReason: "High-value order with premium items. Quick confirmation will boost retention.",
    createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  {
    id: "ord_7",
    orderNumber: "THC-M3N4",
    customerName: "Lisa Park",
    customerPhone: "(346) 678-9012",
    status: "PICKED_UP",
    items: [
      { id: "i15", productName: "Donut Shop", quantity: 1, price: 0, variant: "Indica · 27% THCA" },
    ],
    totalItems: 1,
    totalPrice: 0,
    aiPriorityScore: 1,
    aiReason: "Completed order.",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    confirmedAt: new Date(Date.now() - 42 * 60000).toISOString(),
    readyAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
];

// ─── Status Filter Tabs ──────────────────────────────────
type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "PREPARING" | "READY";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
];

// ─── Chime Sound Generator (Web Audio API) ──────────────
function playChimeSound(): void {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create a pleasant two-tone chime
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 — major chord

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
    // Web Audio API not available — fail silently
  }
}

// ─── Live Order Queue Page ──────────────────────────────
export default function AdminOrderQueuePage() {
  const [orders, setOrders] = useState<OrderData[]>(MOCK_ORDERS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const orderCountRef = useRef(orders.length);

  // ─── Simulated Real-time Updates ────────────────────────
  // In production, this would be a Pusher subscription:
  // usePusherChannel("admin-orders", "new-order", (data) => { ... })
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(autoRefreshInterval);
  }, []);

  // Play chime when new orders arrive
  useEffect(() => {
    if (orders.length > orderCountRef.current && soundEnabled) {
      playChimeSound();
    }
    orderCountRef.current = orders.length;
  }, [orders.length, soundEnabled]);

  // ─── Actions ────────────────────────────────────────────
  const handleConfirm = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "CONFIRMED" as const,
              confirmedAt: new Date().toISOString(),
            }
          : o
      )
    );
  }, []);

  const handleStartPreparing = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "PREPARING" as const }
          : o
      )
    );
  }, []);

  const handleMarkReady = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "READY" as const,
              readyAt: new Date().toISOString(),
            }
          : o
      )
    );
  }, []);

  const handleMarkPickedUp = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "PICKED_UP" as const } : o
      )
    );
  }, []);

  const handleCancel = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "CANCELLED" as const } : o
      )
    );
  }, []);

  const handleNotesUpdate = useCallback((orderId: string, notes: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, staffNotes: notes } : o))
    );
  }, []);

  const handleItemUnavailable = useCallback(
    (orderId: string, itemId: string, unavailable: boolean) => {
      // In production: PATCH /api/orders/:id/items/:itemId { unavailable: true }
      // This would also trigger an SMS/push notification to the customer
      console.log(
        `Item ${itemId} in order ${orderId} marked ${unavailable ? "unavailable" : "available"}`
      );
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // In production: re-fetch orders from API
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastRefresh(new Date());
    setRefreshing(false);
  }, []);

  // ─── Filtered & Sorted Orders ──────────────────────────
  const filteredOrders = orders
    .filter((o) => {
      if (statusFilter === "ALL") return true;
      return o.status === statusFilter;
    })
    .sort((a, b) => {
      // Sort by AI priority (desc), then by timestamp (oldest first)
      if (b.aiPriorityScore !== a.aiPriorityScore) {
        return b.aiPriorityScore - a.aiPriorityScore;
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
          {/* Sound Toggle */}
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
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
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
        /* ─── Empty State ──────────────────────────────── */
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
