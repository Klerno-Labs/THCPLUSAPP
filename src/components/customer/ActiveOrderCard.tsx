"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight, Package, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getOrderStatusLabel, getRelativeTime } from "@/lib/utils";
import FadeIn from "./FadeIn";

const ORDER_KEY = "thcplus-active-order";

interface ActiveOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalItems: number;
  createdAt: string;
  estimatedReadyTime?: string;
}

const statusSteps = ["PENDING", "CONFIRMED", "PREPARING", "READY"];

function getStepIndex(status: string): number {
  const idx = statusSteps.indexOf(status);
  return idx >= 0 ? idx : -1;
}

export default function ActiveOrderCard() {
  const [order, setOrder] = useState<ActiveOrder | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem(ORDER_KEY);
      if (data) {
        const parsed = JSON.parse(data) as ActiveOrder;
        // Only show active orders (not completed or cancelled)
        if (
          parsed.status !== "PICKED_UP" &&
          parsed.status !== "CANCELLED" &&
          parsed.status !== "EXPIRED"
        ) {
          setOrder(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  if (!order) return null;

  const currentStep = getStepIndex(order.status);

  return (
    <FadeIn delay={0.2}>
      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Link
                href={`/order/${order.id}`}
                className="group block overflow-hidden rounded-xl border border-gold-700/30 bg-gradient-to-r from-gold-900/10 to-[#111A11] transition-all hover:border-gold-600/40 hover:shadow-glow-gold"
              >
                <div className="flex items-center justify-between px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/15">
                      {order.status === "READY" ? (
                        <CheckCircle2 className="h-5 w-5 text-gold" />
                      ) : (
                        <Package className="h-5 w-5 text-gold" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {order.orderNumber}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                            order.status === "PENDING" &&
                              "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
                            order.status === "CONFIRMED" &&
                              "border-blue-500/20 bg-blue-500/10 text-blue-400",
                            order.status === "PREPARING" &&
                              "border-orange-500/20 bg-orange-500/10 text-orange-400",
                            order.status === "READY" &&
                              "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          )}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500">
                        <span>
                          {order.totalItems} item
                          {order.totalItems !== 1 ? "s" : ""}
                        </span>
                        <span>{getRelativeTime(order.createdAt)}</span>
                        {order.estimatedReadyTime && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Clock className="h-3 w-3" />
                            Est. ready {getRelativeTime(order.estimatedReadyTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-zinc-500 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
                </div>

                {/* Mini progress bar */}
                <div className="flex gap-1 px-4 pb-3 sm:px-6">
                  {statusSteps.map((step, i) => (
                    <div
                      key={step}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors",
                        i <= currentStep
                          ? "bg-gold"
                          : "bg-gold-900/30"
                      )}
                    />
                  ))}
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </FadeIn>
  );
}
