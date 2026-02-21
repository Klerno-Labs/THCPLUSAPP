"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Loader2, Sprout, Leaf, TreePine, Trees } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLoyaltyTierLabel, getLoyaltyTierClass } from "@/lib/utils";
import FadeIn from "@/components/customer/FadeIn";

const TIERS = [
  { key: "SEEDLING", label: "Seedling", icon: Sprout, points: 0 },
  { key: "GROWER", label: "Grower", icon: Leaf, points: 100 },
  { key: "CULTIVATOR", label: "Cultivator", icon: TreePine, points: 300 },
  { key: "MASTER_GROWER", label: "Master Grower", icon: Trees, points: 500 },
];

export default function RewardsPage() {
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState("SEEDLING");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          setPoints(data.profile?.loyaltyPoints ?? 0);
          setTier(data.profile?.loyaltyTier ?? "SEEDLING");
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const currentTierIndex = TIERS.findIndex((t) => t.key === tier);
  const nextTier = TIERS[currentTierIndex + 1];

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
          <h1 className="text-lg font-bold text-white">Loyalty Rewards</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* Points card */}
            <FadeIn>
              <div className="relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-emerald-950/60 via-[#111A11] to-[#111A11] p-6">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/5 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-[#D4AF37]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                      Your Points
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">{points}</span>
                    <span className="text-sm text-zinc-400">points</span>
                  </div>
                  <div className="mt-2">
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-bold uppercase",
                        getLoyaltyTierClass(tier)
                      )}
                    >
                      {getLoyaltyTierLabel(tier)}
                    </span>
                  </div>
                  {nextTier && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{points} pts</span>
                        <span>{nextTier.points} pts for {nextTier.label}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#D4AF37]"
                          style={{
                            width: `${Math.min(100, ((points - (TIERS[currentTierIndex]?.points || 0)) / (nextTier.points - (TIERS[currentTierIndex]?.points || 0))) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Tier breakdown */}
            <FadeIn delay={0.1}>
              <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold text-zinc-400">Tier Levels</h2>
                <div className="space-y-2">
                  {TIERS.map((t) => {
                    const isCurrentOrPast = TIERS.indexOf(t) <= currentTierIndex;
                    return (
                      <div
                        key={t.key}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-4",
                          t.key === tier
                            ? "border-emerald-700/50 bg-emerald-950/30"
                            : "border-emerald-900/20 bg-[#111A11]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg",
                            isCurrentOrPast
                              ? "bg-emerald-900/40 text-emerald-400"
                              : "bg-zinc-800/50 text-zinc-600"
                          )}
                        >
                          <t.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              isCurrentOrPast ? "text-white" : "text-zinc-500"
                            )}
                          >
                            {t.label}
                          </p>
                          <p className="text-xs text-zinc-600">{t.points} points</p>
                        </div>
                        {t.key === tier && (
                          <span className="text-[10px] font-bold uppercase text-emerald-400">
                            Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* How to earn */}
            <FadeIn delay={0.15}>
              <div className="mt-6 rounded-xl border border-emerald-900/20 bg-[#111A11] p-4">
                <h2 className="mb-2 text-sm font-semibold text-white">How to Earn Points</h2>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li>1 point for every item in your order when picked up</li>
                  <li>Minimum 1 point per completed order</li>
                  <li>Points never expire</li>
                </ul>
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </div>
  );
}
