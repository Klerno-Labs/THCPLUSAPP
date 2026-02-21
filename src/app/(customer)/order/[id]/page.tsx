"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Package,
  ChefHat,
  ArrowLeft,
  MessageSquare,
  XCircle,
  Copy,
  Check,
  ShoppingCart,
  AlertTriangle,
  Loader2,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPrice,
  formatDateTime,
  getOrderStatusLabel,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import FadeIn from "@/components/customer/FadeIn";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  estimatedReadyTime?: string | null;
  totalAmount: number;
  items: OrderItem[];
  guestSession?: {
    name: string;
    phone: string;
  } | null;
  customer?: {
    name: string;
    phone?: string;
  } | null;
}

const statusSteps = [
  {
    key: "PENDING",
    label: "Order Placed",
    description: "Your order has been received",
    icon: ShoppingCart,
  },
  {
    key: "CONFIRMED",
    label: "Confirmed",
    description: "Staff has confirmed your order",
    icon: CheckCircle2,
  },
  {
    key: "PREPARING",
    label: "Preparing",
    description: "Your order is being prepared",
    icon: ChefHat,
  },
  {
    key: "READY",
    label: "Ready for Pickup",
    description: "Your order is ready! Come pick it up",
    icon: Package,
  },
];

function getStepIndex(status: string): number {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : -1;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const { toast } = useToast();

  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        setOrder(null);
        return;
      }
      const data = await res.json();
      setOrder({
        ...data,
        totalAmount: Number(data.totalAmount),
        items: data.items.map((item: any) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
        })),
      });
    } catch {
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    // Poll every 15 seconds for updates (placeholder for Pusher)
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const handleCopyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        throw new Error("Failed to cancel order");
      }

      toast({
        title: "Order cancelled",
        description: "Your order has been cancelled.",
      });
      fetchOrder();
    } catch {
      toast({
        title: "Failed to cancel",
        description: "Could not cancel the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-400" />
          <h1 className="text-xl font-bold text-white">Order Not Found</h1>
          <p className="text-sm text-zinc-400">
            We could not find this order. It may have been removed.
          </p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "CANCELLED";
  const isExpired = order.status === "EXPIRED";
  const isPickedUp = order.status === "PICKED_UP";
  const isFinished = isCancelled || isExpired || isPickedUp;
  const customerName =
    order.guestSession?.name || order.customer?.name || "Guest";

  return (
    <div className="min-h-screen">
      {/* Back nav */}
      <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
        {/* Order number */}
        <FadeIn>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Order Number
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <h1 className="font-mono text-3xl font-bold tracking-wider text-white sm:text-4xl">
                {order.orderNumber}
              </h1>
              <button
                onClick={handleCopyOrderNumber}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-800/30 text-zinc-400 transition-colors hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-500">
              Placed {formatDateTime(order.createdAt)}
            </p>
            {customerName && (
              <p className="mt-1 text-sm text-zinc-400">
                For <span className="font-medium text-white">{customerName}</span>
              </p>
            )}
          </div>
        </FadeIn>

        {/* Status badge */}
        <FadeIn delay={0.05}>
          <div className="mt-6 flex justify-center">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
                isCancelled && "border-red-500/20 bg-red-500/10 text-red-400",
                isExpired && "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
                isPickedUp &&
                  "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                !isFinished &&
                  order.status === "READY" &&
                  "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                !isFinished &&
                  order.status !== "READY" &&
                  "border-blue-500/20 bg-blue-500/10 text-blue-400"
              )}
            >
              {isCancelled && <XCircle className="h-4 w-4" />}
              {isPickedUp && <CheckCircle2 className="h-4 w-4" />}
              {!isFinished && <Clock className="h-4 w-4" />}
              {getOrderStatusLabel(order.status)}
            </div>
          </div>
        </FadeIn>

        {/* Estimated time */}
        {order.estimatedReadyTime && !isFinished && (
          <FadeIn delay={0.08}>
            <div className="mt-4 flex justify-center">
              <div className="flex items-center gap-2 rounded-lg border border-emerald-800/30 bg-emerald-900/10 px-4 py-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">
                  Estimated ready by{" "}
                  {new Date(order.estimatedReadyTime).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Status timeline */}
        {!isCancelled && !isExpired && (
          <FadeIn delay={0.1}>
            <div className="mt-10">
              <div className="space-y-0">
                {statusSteps.map((step, i) => {
                  const isCompleted = isPickedUp || i < currentStep;
                  const isCurrent = !isPickedUp && i === currentStep;
                  const isPending = !isPickedUp && i > currentStep;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="relative flex gap-4">
                      {/* Vertical line */}
                      {i < statusSteps.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-5 top-10 h-full w-0.5 -translate-x-1/2",
                            isCompleted || isCurrent
                              ? "bg-emerald-500"
                              : "bg-zinc-800"
                          )}
                        />
                      )}

                      {/* Icon */}
                      <div className="relative z-10">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isCurrent ? 1.1 : 1,
                          }}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                            isCompleted &&
                              "border-emerald-500 bg-emerald-500 text-white",
                            isCurrent &&
                              "border-emerald-400 bg-emerald-900/30 text-emerald-400",
                            isPending &&
                              "border-zinc-700 bg-zinc-900 text-zinc-600"
                          )}
                        >
                          <StepIcon className="h-5 w-5" />
                        </motion.div>
                        {isCurrent && (
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-emerald-400"
                            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </div>

                      {/* Text */}
                      <div className="pb-8">
                        <h3
                          className={cn(
                            "text-sm font-semibold",
                            isCompleted || isCurrent
                              ? "text-white"
                              : "text-zinc-500"
                          )}
                        >
                          {step.label}
                        </h3>
                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            isCurrent ? "text-emerald-400" : "text-zinc-600"
                          )}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Cancelled / expired message */}
        {(isCancelled || isExpired) && (
          <FadeIn delay={0.1}>
            <div className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-red-800/30 bg-red-950/10 py-8">
              <XCircle className="h-10 w-10 text-red-400" />
              <h2 className="text-lg font-bold text-white">
                {isCancelled ? "Order Cancelled" : "Order Expired"}
              </h2>
              <p className="text-sm text-zinc-400">
                {isCancelled
                  ? "This order has been cancelled."
                  : "This order has expired and is no longer available for pickup."}
              </p>
              <Button asChild variant="outline">
                <Link href="/products">Place a New Order</Link>
              </Button>
            </div>
          </FadeIn>
        )}

        {/* Text notification */}
        {!isFinished && (
          <FadeIn delay={0.15}>
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-800/30 bg-emerald-900/10 px-4 py-3">
              <MessageSquare className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  We will text you when your order is ready
                </p>
                <p className="mt-0.5 text-xs text-emerald-500/60">
                  Make sure your phone is nearby. You will receive an SMS
                  notification at each step.
                </p>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Order items */}
        <FadeIn delay={0.2}>
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Order Items</h2>
            <div className="space-y-2 rounded-xl border border-emerald-900/30 bg-[#111A11] p-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D150D] text-emerald-900/50">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Qty: {item.quantity} x {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-zinc-300">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-emerald-900/30 pt-3">
                <span className="font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-emerald-400">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Cancel button */}
        {order.status === "PENDING" && (
          <FadeIn delay={0.25}>
            <div className="mt-8 flex justify-center">
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="gap-2"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Cancel Order
                  </>
                )}
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
