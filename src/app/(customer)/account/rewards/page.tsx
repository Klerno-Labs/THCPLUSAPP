"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Loader2,
  Sprout,
  Leaf,
  TreePine,
  Trees,
  Lock,
  Gift,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  getLoyaltyTierLabel,
  getLoyaltyTierClass,
  getRelativeTime,
} from "@/lib/utils";
import { REWARDS, meetsMinTier, type Reward } from "@/lib/rewards";
import FadeIn from "@/components/customer/FadeIn";
import { useToast } from "@/components/ui/use-toast";

const TIERS = [
  { key: "SEEDLING", label: "Seedling", icon: Sprout, points: 0 },
  { key: "GROWER", label: "Grower", icon: Leaf, points: 25 },
  { key: "CULTIVATOR", label: "Cultivator", icon: TreePine, points: 100 },
  { key: "MASTER_GROWER", label: "Master Grower", icon: Trees, points: 500 },
];

interface Redemption {
  id: string;
  rewardKey: string;
  rewardLabel: string;
  pointsCost: number;
  status: "PENDING" | "FULFILLED" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  expiresAt: string | null;
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:
    "border-amber-600/40 bg-amber-950/30 text-amber-400",
  FULFILLED:
    "border-emerald-600/40 bg-emerald-950/30 text-emerald-400",
  EXPIRED:
    "border-zinc-600/40 bg-zinc-800/30 text-zinc-400",
  CANCELLED:
    "border-red-600/40 bg-red-950/30 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  FULFILLED: "Fulfilled",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};

export default function RewardsPage() {
  const [points, setPoints] = useState(0);
  const [tier, setTier] = useState("SEEDLING");
  const [isLoading, setIsLoading] = useState(true);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [accountRes, redemptionsRes] = await Promise.all([
        fetch("/api/account"),
        fetch("/api/redemptions"),
      ]);

      if (accountRes.ok) {
        const data = await accountRes.json();
        setPoints(data.profile?.loyaltyPoints ?? 0);
        setTier(data.profile?.loyaltyTier ?? "SEEDLING");
      }

      if (redemptionsRes.ok) {
        const data = await redemptionsRes.json();
        setRedemptions(data.redemptions ?? data ?? []);
      }
    } catch {
      // Not authenticated or network error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleRedeem() {
    if (!confirmReward) return;
    setRedeeming(true);
    try {
      const res = await fetch("/api/redemptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardKey: confirmReward.key }),
      });

      if (res.ok) {
        toast({
          title: "Reward redeemed!",
          description: `${confirmReward.label} has been redeemed. Pick up within 7 days.`,
        });
        setConfirmReward(null);
        await fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({
          title: "Redemption failed",
          description:
            err.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not redeem. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRedeeming(false);
    }
  }

  const currentTierIndex = TIERS.findIndex((t) => t.key === tier);
  const nextTier = TIERS[currentTierIndex + 1];

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
            {/* Points Card */}
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
                    <span className="text-4xl font-bold text-white">
                      {points}
                    </span>
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
                        <span>
                          {nextTier.points} pts for {nextTier.label}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#D4AF37]"
                          style={{
                            width: `${Math.min(
                              100,
                              ((points -
                                (TIERS[currentTierIndex]?.points || 0)) /
                                (nextTier.points -
                                  (TIERS[currentTierIndex]?.points || 0))) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Available Rewards */}
            <FadeIn delay={0.05}>
              <div className="mt-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-400">
                  <Gift className="h-4 w-4" />
                  Available Rewards
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {REWARDS.map((reward) => {
                    const canAfford = points >= reward.pointsCost;
                    const tierMet = meetsMinTier(
                      tier as any,
                      reward.minTier
                    );
                    const canRedeem = canAfford && tierMet;
                    const pointsNeeded = reward.pointsCost - points;

                    return (
                      <div
                        key={reward.key}
                        className={cn(
                          "flex flex-col rounded-xl border p-4 transition-colors",
                          canRedeem
                            ? "border-emerald-800/40 bg-[#111A11] hover:border-emerald-700/60"
                            : "border-emerald-900/15 bg-[#111A11]/60"
                        )}
                      >
                        <div
                          className={cn(
                            "text-[2rem] leading-none",
                            !canRedeem && "opacity-40"
                          )}
                        >
                          {reward.icon}
                        </div>
                        <p
                          className={cn(
                            "mt-2 text-sm font-semibold",
                            canRedeem ? "text-white" : "text-zinc-500"
                          )}
                        >
                          {reward.label}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            canRedeem ? "text-zinc-400" : "text-zinc-600"
                          )}
                        >
                          {reward.pointsCost} pts
                        </p>
                        <p
                          className={cn(
                            "mt-1 flex-1 text-[11px] leading-relaxed",
                            canRedeem ? "text-zinc-500" : "text-zinc-600"
                          )}
                        >
                          {reward.description}
                        </p>
                        <div className="mt-3">
                          {!tierMet ? (
                            <div className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-500">
                              <Lock className="h-3.5 w-3.5" />
                              <span>
                                Unlock at{" "}
                                {getLoyaltyTierLabel(reward.minTier)}
                              </span>
                            </div>
                          ) : !canAfford ? (
                            <div className="flex min-h-[44px] items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-500">
                              Need {pointsNeeded} more pts
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmReward(reward)}
                              className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 active:bg-emerald-700"
                            >
                              Redeem
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* Your Redemptions */}
            <FadeIn delay={0.1}>
              <div className="mt-6">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-400">
                  <Clock className="h-4 w-4" />
                  Your Redemptions
                </h2>
                {redemptions.length === 0 ? (
                  <div className="rounded-xl border border-emerald-900/20 bg-[#111A11] p-6 text-center">
                    <p className="text-sm text-zinc-500">
                      No redemptions yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {redemptions.map((r) => {
                      const daysLeft =
                        r.status === "PENDING" && r.expiresAt
                          ? getDaysUntil(r.expiresAt)
                          : null;

                      return (
                        <div
                          key={r.id}
                          className="flex items-center gap-3 rounded-xl border border-emerald-900/20 bg-[#111A11] p-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white">
                                {r.rewardLabel}
                              </p>
                              <span
                                className={cn(
                                  "rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase",
                                  STATUS_STYLES[r.status] ||
                                    "border-zinc-700 text-zinc-400"
                                )}
                              >
                                {STATUS_LABELS[r.status] || r.status}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                              <span>{r.pointsCost} pts</span>
                              <span>&middot;</span>
                              <span>{getRelativeTime(r.createdAt)}</span>
                            </div>
                            {r.status === "PENDING" && daysLeft !== null && (
                              <p className="mt-1 text-[11px] text-amber-400/80">
                                Expires in {daysLeft} day
                                {daysLeft !== 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </FadeIn>

            {/* Tier Levels */}
            <FadeIn delay={0.15}>
              <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold text-zinc-400">
                  Tier Levels
                </h2>
                <div className="space-y-2">
                  {TIERS.map((t) => {
                    const isCurrentOrPast =
                      TIERS.indexOf(t) <= currentTierIndex;
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
                              isCurrentOrPast
                                ? "text-white"
                                : "text-zinc-500"
                            )}
                          >
                            {t.label}
                          </p>
                          <p className="text-xs text-zinc-600">
                            {t.points} points
                          </p>
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

            {/* How to Earn */}
            <FadeIn delay={0.2}>
              <div className="mt-6 rounded-xl border border-emerald-900/20 bg-[#111A11] p-4">
                <h2 className="mb-2 text-sm font-semibold text-white">
                  How to Earn Points
                </h2>
                <ul className="space-y-1.5 text-xs text-zinc-400">
                  <li>1 point for every item in your order when picked up</li>
                  <li>Minimum 1 point per completed order</li>
                  <li>Points never expire</li>
                  <li>Redeem points for free products above</li>
                </ul>
              </div>
            </FadeIn>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmReward && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!redeeming) setConfirmReward(null);
              }}
            />

            {/* Modal Card */}
            <motion.div
              className="relative w-full max-w-sm rounded-2xl border border-emerald-800/40 bg-[#111A11] p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="text-[2.5rem] leading-none">
                  {confirmReward.icon}
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {confirmReward.label}
                </h3>
                <p className="mt-3 text-sm text-zinc-300">
                  Spend{" "}
                  <span className="font-bold text-emerald-400">
                    {confirmReward.pointsCost} points
                  </span>
                  ?
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  You&apos;ll have{" "}
                  <span className="text-zinc-300">
                    {points - confirmReward.pointsCost}
                  </span>{" "}
                  points remaining
                </p>
                <p className="mt-2 text-xs text-amber-400/80">
                  Pick up within 7 days
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 active:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {redeeming ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Confirm Redemption"
                  )}
                </button>
                <button
                  onClick={() => setConfirmReward(null)}
                  disabled={redeeming}
                  className="flex min-h-[44px] w-full items-center justify-center rounded-lg border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
