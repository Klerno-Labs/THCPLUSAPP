"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Brain,
  Ban,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────
export interface OrderItemData {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  variant?: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "PICKED_UP" | "CANCELLED";
  items: OrderItemData[];
  totalItems: number;
  totalPrice: number;
  aiPriorityScore: number;
  aiFlags?: string[];
  aiReason?: string;
  createdAt: string;
  confirmedAt?: string;
  readyAt?: string;
  staffNotes?: string;
}

interface OrderCardProps {
  order: OrderData;
  onConfirm?: (orderId: string) => void;
  onStartPreparing?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onMarkPickedUp?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onNotesUpdate?: (orderId: string, notes: string) => void;
  onItemUnavailable?: (orderId: string, itemId: string, unavailable: boolean) => void;
}

// ─── Helpers ─────────────────────────────────────────────
function getElapsedTime(dateStr: string): string {
  const now = new Date();
  const placed = new Date(dateStr);
  const diffMs = now.getTime() - placed.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function getStatusConfig(status: string): {
  label: string;
  className: string;
  dotColor: string;
} {
  const configs: Record<string, { label: string; className: string; dotColor: string }> = {
    PENDING: {
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      dotColor: "bg-yellow-400",
    },
    CONFIRMED: {
      label: "Confirmed",
      className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      dotColor: "bg-blue-400",
    },
    PREPARING: {
      label: "Preparing",
      className: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
      dotColor: "bg-orange-400",
    },
    READY: {
      label: "Ready",
      className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      dotColor: "bg-emerald-400",
    },
    PICKED_UP: {
      label: "Picked Up",
      className: "bg-emerald-600/10 text-emerald-300 border border-emerald-600/20",
      dotColor: "bg-emerald-300",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-red-500/10 text-red-400 border border-red-500/20",
      dotColor: "bg-red-400",
    },
  };
  return configs[status] || configs.PENDING;
}

function getPriorityConfig(score: number): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  if (score >= 8) {
    return {
      label: "High",
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    };
  }
  if (score >= 5) {
    return {
      label: "Medium",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    };
  }
  return {
    label: "Low",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// ─── Order Card Component ────────────────────────────────
export default function OrderCard({
  order,
  onConfirm,
  onStartPreparing,
  onMarkReady,
  onMarkPickedUp,
  onCancel,
  onNotesUpdate,
  onItemUnavailable,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notesValue, setNotesValue] = useState(order.staffNotes || "");
  const [elapsedTime, setElapsedTime] = useState(getElapsedTime(order.createdAt));
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [unavailableItems, setUnavailableItems] = useState<Set<string>>(new Set());

  const statusConfig = getStatusConfig(order.status);
  const priorityConfig = getPriorityConfig(order.aiPriorityScore);

  // Update elapsed time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime(order.createdAt));
    }, 30000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const handleAction = useCallback(
    async (action: string, handler?: (id: string) => void) => {
      if (!handler) return;
      setActionLoading(action);
      try {
        await handler(order.id);
      } finally {
        // In a real app, the loading state would be cleared when
        // the order status updates via the real-time subscription
        setTimeout(() => setActionLoading(null), 500);
      }
    },
    [order.id]
  );

  const handleToggleUnavailable = useCallback(
    (itemId: string) => {
      setUnavailableItems((prev) => {
        const next = new Set(prev);
        const nowUnavailable = !next.has(itemId);
        if (nowUnavailable) {
          next.add(itemId);
        } else {
          next.delete(itemId);
        }
        onItemUnavailable?.(order.id, itemId, nowUnavailable);
        return next;
      });
    },
    [order.id, onItemUnavailable]
  );

  const handleNotesSave = useCallback(() => {
    if (onNotesUpdate && notesValue !== order.staffNotes) {
      onNotesUpdate(order.id, notesValue);
    }
  }, [onNotesUpdate, notesValue, order.staffNotes, order.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "rounded-xl border bg-[#111A11] shadow-lg transition-shadow hover:shadow-xl",
        order.aiPriorityScore >= 8
          ? "border-red-500/30 shadow-red-900/10"
          : order.aiPriorityScore >= 5
          ? "border-yellow-500/20 shadow-yellow-900/5"
          : "border-emerald-900/30"
      )}
    >
      {/* ─── Card Header ──────────────────────────────────── */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-zinc-100">
              #{order.orderNumber}
            </h3>
            <Badge
              className={cn(
                "gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                statusConfig.className
              )}
            >
              <span
                className={cn(
                  "inline-block h-1.5 w-1.5 rounded-full",
                  statusConfig.dotColor,
                  order.status === "PENDING" && "animate-pulse"
                )}
              />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="mt-1.5 flex items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {order.customerName}
            </span>
            <span className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {elapsedTime}
            </span>
          </div>
        </div>

        {/* AI Priority Badge */}
        <div className="flex flex-col items-end gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1",
              priorityConfig.bgColor,
              priorityConfig.borderColor
            )}
          >
            <Brain className={cn("h-3.5 w-3.5", priorityConfig.color)} />
            <span className={cn("text-xs font-bold", priorityConfig.color)}>
              {order.aiPriorityScore}/10
            </span>
          </div>
          <span className="text-xs font-medium text-zinc-500">
            {formatCurrency(order.totalPrice)}
          </span>
        </div>
      </div>

      {/* ─── AI Flags ─────────────────────────────────────── */}
      {order.aiFlags && order.aiFlags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {order.aiFlags.map((flag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400"
            >
              <AlertTriangle className="h-3 w-3" />
              {flag}
            </span>
          ))}
        </div>
      )}

      {/* ─── Expand Toggle ─────────────────────────────────── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-1 border-t border-emerald-900/20 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-emerald-950/20 hover:text-zinc-300"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            Show Details ({order.items.length} items)
          </>
        )}
      </button>

      {/* ─── Expanded Content ──────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-emerald-900/20 p-4">
              {/* Item List */}
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Order Items
              </h4>
              <div className="space-y-2">
                {order.items.map((item) => {
                  const isUnavailable = unavailableItems.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 transition-colors",
                        isUnavailable
                          ? "bg-red-950/20 border border-red-500/20"
                          : "bg-[#090F09]"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              isUnavailable
                                ? "text-zinc-500 line-through"
                                : "text-zinc-200"
                            )}
                          >
                            {item.productName}
                          </p>
                          {isUnavailable && (
                            <Badge className="shrink-0 gap-1 rounded-md bg-red-500/15 px-1.5 py-0 text-[10px] font-semibold text-red-400 border border-red-500/25">
                              <Ban className="h-2.5 w-2.5" />
                              Unavailable
                            </Badge>
                          )}
                        </div>
                        {item.variant && (
                          <p className="text-xs text-zinc-500">{item.variant}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={cn("text-sm", isUnavailable ? "text-zinc-600" : "text-zinc-400")}>
                          x{item.quantity}
                        </span>
                        <span className={cn("text-sm font-medium w-16 text-right", isUnavailable ? "text-zinc-600 line-through" : "text-zinc-300")}>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        {/* Mark Unavailable / Undo Button */}
                        {!["PICKED_UP", "CANCELLED"].includes(order.status) && (
                          <button
                            onClick={() => handleToggleUnavailable(item.id)}
                            className={cn(
                              "rounded-md p-1.5 text-xs font-medium transition-all",
                              isUnavailable
                                ? "text-emerald-400 hover:bg-emerald-950/30"
                                : "text-red-400 hover:bg-red-950/30"
                            )}
                            title={isUnavailable ? "Mark available again" : "Mark as unavailable"}
                          >
                            {isUnavailable ? (
                              <Undo2 className="h-3.5 w-3.5" />
                            ) : (
                              <Ban className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Unavailable Items Warning */}
              {unavailableItems.size > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-400">
                      {unavailableItems.size} item{unavailableItems.size > 1 ? "s" : ""} marked unavailable
                    </p>
                    <p className="text-xs text-amber-400/70 mt-0.5">
                      Customer will be notified about unavailable items.
                    </p>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mt-3 flex items-center justify-between border-t border-emerald-900/20 pt-3">
                <span className="text-sm font-medium text-zinc-400">Total</span>
                <div className="text-right">
                  {unavailableItems.size > 0 ? (
                    <>
                      <span className="text-xs text-zinc-500 line-through mr-2">
                        {formatCurrency(order.totalPrice)}
                      </span>
                      <span className="text-base font-bold text-amber-400">
                        {formatCurrency(
                          order.items
                            .filter((i) => !unavailableItems.has(i.id))
                            .reduce((sum, i) => sum + i.price * i.quantity, 0)
                        )}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-bold text-zinc-100">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              {order.customerPhone && (
                <div className="mt-3">
                  <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Customer
                  </h4>
                  <p className="text-sm text-zinc-300">
                    {order.customerName} &middot; {order.customerPhone}
                  </p>
                </div>
              )}

              {/* AI Reason */}
              {order.aiReason && (
                <div className="mt-3">
                  <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <Brain className="h-3 w-3" />
                    AI Priority Reason
                  </h4>
                  <p className="text-sm text-zinc-400">{order.aiReason}</p>
                </div>
              )}

              {/* Staff Notes */}
              <div className="mt-3">
                <h4 className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <MessageSquare className="h-3 w-3" />
                  Staff Notes
                </h4>
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  onBlur={handleNotesSave}
                  placeholder="Add a note about this order..."
                  rows={2}
                  className="w-full rounded-lg border border-emerald-900/30 bg-[#090F09] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Action Buttons ────────────────────────────────── */}
      <div className="flex items-center gap-2 border-t border-emerald-900/20 p-3">
        {order.status === "PENDING" && (
          <>
            <Button
              size="sm"
              onClick={() => handleAction("confirm", onConfirm)}
              disabled={actionLoading === "confirm"}
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {actionLoading === "confirm" ? "Confirming..." : "Confirm"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("cancel", onCancel)}
              disabled={actionLoading === "cancel"}
              className="border-red-800/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              {actionLoading === "cancel" ? "..." : "Cancel"}
            </Button>
          </>
        )}

        {order.status === "CONFIRMED" && (
          <>
            <Button
              size="sm"
              onClick={() => handleAction("preparing", onStartPreparing)}
              disabled={actionLoading === "preparing"}
              className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
            >
              <Package className="mr-1.5 h-4 w-4" />
              {actionLoading === "preparing" ? "Updating..." : "Start Preparing"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("cancel", onCancel)}
              disabled={actionLoading === "cancel"}
              className="border-red-800/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
          </>
        )}

        {order.status === "PREPARING" && (
          <>
            <Button
              size="sm"
              onClick={() => handleAction("ready", onMarkReady)}
              disabled={actionLoading === "ready"}
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {actionLoading === "ready" ? "Updating..." : "Mark Ready"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("cancel", onCancel)}
              disabled={actionLoading === "cancel"}
              className="border-red-800/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
          </>
        )}

        {order.status === "READY" && (
          <>
            <Button
              size="sm"
              onClick={() => handleAction("pickedup", onMarkPickedUp)}
              disabled={actionLoading === "pickedup"}
              className="flex-1 bg-[#D4AF37] text-black hover:bg-[#c4a030]"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {actionLoading === "pickedup" ? "Updating..." : "Mark Picked Up"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("cancel", onCancel)}
              disabled={actionLoading === "cancel"}
              className="border-red-800/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
          </>
        )}

        {(order.status === "PICKED_UP" || order.status === "CANCELLED") && (
          <div className="flex w-full items-center justify-center py-1">
            <span
              className={cn(
                "text-sm font-medium",
                order.status === "PICKED_UP"
                  ? "text-emerald-400"
                  : "text-red-400"
              )}
            >
              {order.status === "PICKED_UP"
                ? "Order completed"
                : "Order cancelled"}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
