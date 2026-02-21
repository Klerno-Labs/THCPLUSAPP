"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  Award,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatPrice,
  formatDate,
  getOrderStatusLabel,
  getOrderStatusColor,
  getLoyaltyTierLabel,
  getLoyaltyTierClass,
  calculateLoyaltyTier,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/customer/FadeIn";

interface OrderHistoryItem {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  _count: {
    items: number;
  };
}

interface AccountData {
  profile: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    loyaltyPoints: number;
    loyaltyTier: string;
    createdAt: string;
  } | null;
  orders: OrderHistoryItem[];
  favoriteCount: number;
}

// Navigation items for account sub-pages
const accountNavItems = [
  {
    label: "Order History",
    icon: Package,
    href: "/account/orders",
    description: "View past and current orders",
  },
  {
    label: "Favorites",
    icon: Heart,
    href: "/account/favorites",
    description: "Your saved products",
  },
  {
    label: "Loyalty Rewards",
    icon: Award,
    href: "/account/rewards",
    description: "Points and tier status",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/account/settings",
    description: "Profile and preferences",
  },
];

export default function AccountPage() {
  const [data, setData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const session = await res.json();
          if (session?.user?.id) {
            setIsAuthenticated(true);

            // Fetch account data
            const accountRes = await fetch("/api/account");
            if (accountRes.ok) {
              const accountData = await accountRes.json();
              setData(accountData);
            }
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    }

    loadAccount();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-400">Loading account...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
          <FadeIn>
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#111A11]">
                <User className="h-10 w-10 text-zinc-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Welcome to THC Plus
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Sign in to view your order history, manage favorites, and earn
                  loyalty rewards.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/auth/signup">Create Account</Link>
                </Button>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-zinc-700/30 bg-zinc-900/30 px-4 py-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500" />
                <p className="text-left text-xs text-zinc-500">
                  You can also place orders as a guest without an account. Just
                  provide your name and phone number at checkout.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const orders = data?.orders || [];
  const loyaltyPoints = profile?.loyaltyPoints ?? 0;
  const loyaltyTier = profile?.loyaltyTier || calculateLoyaltyTier(loyaltyPoints);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-emerald-900/30 bg-gradient-to-b from-emerald-950/20 to-transparent">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <FadeIn>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900/30 text-emerald-400">
                <User className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white sm:text-2xl">
                  {profile?.name || "Welcome"}
                </h1>
                <p className="text-sm text-zinc-400">
                  Member since{" "}
                  {profile?.createdAt ? formatDate(profile.createdAt) : "today"}
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Loyalty card */}
        <FadeIn delay={0.05}>
          <div className="relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-emerald-950/60 via-[#111A11] to-[#111A11] p-5">
            {/* Decorative glow */}
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/5 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#D4AF37]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                    Loyalty Program
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {loyaltyPoints}
                  </span>
                  <span className="text-sm text-zinc-400">points</span>
                </div>
              </div>
              <div
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                  getLoyaltyTierClass(loyaltyTier)
                )}
              >
                {getLoyaltyTierLabel(loyaltyTier)}
              </div>
            </div>

            {/* Progress bar to next tier */}
            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>Current Tier</span>
                <span>Next Tier</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#D4AF37]"
                  style={{
                    width: `${Math.min(100, (loyaltyPoints % 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Navigation grid */}
        <FadeIn delay={0.1}>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {accountNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col gap-2 rounded-xl border border-emerald-900/30 bg-[#111A11] p-4 transition-all hover:border-emerald-700/40 hover:shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-900/20 text-emerald-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {item.label}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>

        {/* Recent orders */}
        <FadeIn delay={0.15}>
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recent Orders</h2>
              <Link
                href="/account/orders"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                View All
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-emerald-900/30 py-10">
                <Package className="h-8 w-8 text-zinc-600" />
                <p className="text-sm text-zinc-400">No orders yet</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order/${order.id}`}
                    className="group flex items-center justify-between rounded-xl border border-emerald-900/30 bg-[#111A11] p-4 transition-colors hover:border-emerald-700/40"
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
                            {order._count.items} item
                            {order._count.items !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-300">
                        {formatPrice(Number(order.totalAmount))}
                      </span>
                      <ChevronRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Sign out */}
        <FadeIn delay={0.2}>
          <div className="mt-10 flex justify-center">
            <Button
              variant="ghost"
              className="gap-2 text-zinc-500 hover:text-red-400"
              onClick={async () => {
                try {
                  await fetch("/api/auth/signout", { method: "POST" });
                  window.location.href = "/";
                } catch {
                  // Fallback
                  window.location.href = "/";
                }
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
