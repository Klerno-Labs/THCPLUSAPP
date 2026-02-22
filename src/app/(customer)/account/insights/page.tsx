"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Award,
  Loader2,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPrice,
  getLoyaltyTierLabel,
  getLoyaltyTierClass,
} from "@/lib/utils";
import FadeIn from "@/components/customer/FadeIn";

interface TopProduct {
  productId: string;
  name: string;
  imageUrl: string | null;
  count: number;
}

interface MonthlySpend {
  month: string;
  amount: number;
}

interface InsightsData {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  pointsEarned: number;
  pointsRedeemed: number;
  currentPoints: number;
  loyaltyTier: string;
  tierProgress: number;
  nextTier: string | null;
  pointsToNextTier: number;
  topProducts: TopProduct[];
  monthlySpending: MonthlySpend[];
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/account/insights");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Failed to load
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const maxMonthlySpend = data
    ? Math.max(...data.monthlySpending.map((m) => m.amount), 1)
    : 1;

  const maxProductCount = data
    ? Math.max(...data.topProducts.map((p) => p.count), 1)
    : 1;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-emerald-900/30">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            href="/account"
            className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-950/50 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Spending Insights</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : !data ? (
          <FadeIn>
            <div className="flex flex-col items-center gap-4 py-16">
              <BarChart3 className="h-12 w-12 text-zinc-600" />
              <p className="text-zinc-400">Could not load insights</p>
            </div>
          </FadeIn>
        ) : (
          <div className="space-y-6">
            {/* Summary stats */}
            <FadeIn>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Total Spent
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatPrice(data.totalSpent)}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Total Orders
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {data.totalOrders}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Avg Order
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {formatPrice(data.averageOrderValue)}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-[#D4AF37]" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Current Pts
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#D4AF37]">
                    {data.currentPoints}
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Points earned vs redeemed */}
            <FadeIn delay={0.05}>
              <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
                <h2 className="text-sm font-bold text-white mb-4">
                  Points Summary
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Earned</span>
                      <span className="font-semibold text-emerald-400">
                        +{data.pointsEarned}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            data.pointsEarned > 0
                              ? (data.pointsEarned /
                                  Math.max(
                                    data.pointsEarned,
                                    data.pointsRedeemed
                                  )) *
                                100
                              : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Redeemed</span>
                      <span className="font-semibold text-amber-400">
                        -{data.pointsRedeemed}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            data.pointsRedeemed > 0
                              ? (data.pointsRedeemed /
                                  Math.max(
                                    data.pointsEarned,
                                    data.pointsRedeemed
                                  )) *
                                100
                              : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Loyalty tier progress */}
            <FadeIn delay={0.08}>
              <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold text-white">
                    Loyalty Tier
                  </h2>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                      getLoyaltyTierClass(data.loyaltyTier)
                    )}
                  >
                    {getLoyaltyTierLabel(data.loyaltyTier)}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#D4AF37] transition-all duration-700"
                    style={{ width: `${data.tierProgress}%` }}
                  />
                </div>

                {data.nextTier ? (
                  <p className="mt-2 text-[11px] text-zinc-500">
                    {data.pointsToNextTier} more point
                    {data.pointsToNextTier !== 1 ? "s" : ""} to reach{" "}
                    <span className="text-zinc-300 font-medium">
                      {getLoyaltyTierLabel(data.nextTier)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-[11px] text-[#D4AF37]">
                    You have reached the highest tier!
                  </p>
                )}
              </div>
            </FadeIn>

            {/* Monthly spending trend */}
            <FadeIn delay={0.1}>
              <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
                <h2 className="text-sm font-bold text-white mb-4">
                  Monthly Spending (Last 6 Months)
                </h2>

                {data.monthlySpending.every((m) => m.amount === 0) ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    No completed orders in the last 6 months
                  </p>
                ) : (
                  <div className="flex items-end gap-2 h-36">
                    {data.monthlySpending.map((month) => (
                      <div
                        key={month.month}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        {/* Amount label */}
                        <span className="text-[9px] font-medium text-zinc-500">
                          {month.amount > 0
                            ? formatPrice(month.amount)
                            : ""}
                        </span>
                        {/* Bar */}
                        <div className="w-full flex items-end justify-center h-24">
                          <div
                            className="w-full max-w-[2rem] rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all duration-500"
                            style={{
                              height:
                                month.amount > 0
                                  ? `${Math.max(
                                      8,
                                      (month.amount / maxMonthlySpend) *
                                        100
                                    )}%`
                                  : "3px",
                              opacity: month.amount > 0 ? 1 : 0.2,
                            }}
                          />
                        </div>
                        {/* Month label */}
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {month.month}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Top products */}
            <FadeIn delay={0.12}>
              <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
                <h2 className="text-sm font-bold text-white mb-4">
                  Most Ordered Products
                </h2>

                {data.topProducts.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    No products ordered yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.topProducts.map((product, index) => (
                      <div key={product.productId} className="flex items-center gap-3">
                        {/* Rank */}
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                            index === 0
                              ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                              : index === 1
                              ? "bg-zinc-600/20 text-zinc-400"
                              : "bg-zinc-800 text-zinc-500"
                          )}
                        >
                          {index + 1}
                        </div>

                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-white font-medium truncate">
                              {product.name}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono flex-shrink-0">
                              x{product.count}
                            </span>
                          </div>
                          {/* CSS bar */}
                          <div className="mt-1 h-1.5 rounded-full bg-zinc-800">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                index === 0
                                  ? "bg-gradient-to-r from-[#D4AF37]/80 to-[#D4AF37]"
                                  : "bg-gradient-to-r from-emerald-700 to-emerald-500"
                              )}
                              style={{
                                width: `${(product.count / maxProductCount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        )}
      </div>
    </div>
  );
}
