"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPrice,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/customer/FadeIn";
import { useCartContext } from "@/context/CartContext";
import { toast } from "@/components/ui/use-toast";

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  totalItems: number;
  createdAt: string;
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const { addItem } = useCartContext();
  const router = useRouter();

  async function handleReorder(orderId: string) {
    setReorderingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) {
        toast({
          title: "Failed to re-order",
          description: "Could not load order details. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const order = await res.json();
      const items = order.items || [];

      if (items.length === 0) {
        toast({
          title: "No items found",
          description: "This order has no items to re-order.",
          variant: "destructive",
        });
        return;
      }

      let addedCount = 0;
      for (const item of items) {
        if (item.product) {
          addItem(item.product, item.quantity);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        toast({
          title: "Items added to cart!",
          description: `${addedCount} item${addedCount !== 1 ? "s" : ""} from order added to your cart.`,
          variant: "success",
        });
        router.push("/cart");
      } else {
        toast({
          title: "Products unavailable",
          description: "The products from this order are no longer available.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not re-order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setReorderingId(null);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) return;
        const session = await res.json();
        if (!session?.user?.id) return;

        const ordersRes = await fetch("/api/account");
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders || []);
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="border-b border-emerald-900/30">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            href="/account"
            className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-950/50 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Order History</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : orders.length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center gap-4 py-16">
              <Package className="h-12 w-12 text-zinc-600" />
              <p className="text-zinc-400">No orders yet</p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          </FadeIn>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => {
              const canReorder =
                order.status === "PICKED_UP" || order.status === "CANCELLED";
              const isReordering = reorderingId === order.id;

              return (
                <FadeIn key={order.id} delay={i * 0.03}>
                  <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] transition-colors hover:border-emerald-700/40">
                    <Link
                      href={`/order/${order.id}`}
                      className="group flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D150D]">
                          <Package className="h-5 w-5 text-emerald-500/50" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-white">
                              {order.orderNumber}
                            </span>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase",
                                getOrderStatusColor(order.status)
                              )}
                            >
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                            <span>{formatDate(order.createdAt)}</span>
                            <span>
                              {order.totalItems} item{order.totalItems !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-zinc-300">
                        {formatPrice(Number(order.totalAmount))}
                      </span>
                    </Link>

                    {canReorder && (
                      <div className="border-t border-emerald-900/20 px-4 py-2.5">
                        <button
                          onClick={() => handleReorder(order.id)}
                          disabled={isReordering}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-700/50 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:border-emerald-600 hover:bg-emerald-950/40 hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isReordering ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          {isReordering ? "Adding to cart..." : "Order Again"}
                        </button>
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
