"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Clock, ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
interface DealProduct {
  id: string;
  name: string;
  nameEs?: string | null;
  price: number;
  imageUrl?: string | null;
  categoryId: string;
  inStock: boolean;
  strainType?: string | null;
}

interface Deal {
  id: string;
  productId: string;
  product: DealProduct;
  titleEn: string;
  titleEs?: string | null;
  badgeText?: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

// ─── Countdown Hook ──────────────────────────────────────
function useCountdown(endDate: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calcTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) return "Expired";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
      }

      return `${hours}h ${minutes}m ${seconds}s`;
    };

    setTimeLeft(calcTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

// ─── Deal Card ───────────────────────────────────────────
function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const countdown = useCountdown(deal.endsAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="w-[260px] flex-shrink-0 snap-start sm:w-[280px]"
    >
      <Link
        href={`/products/${deal.product.id}`}
        className="group block overflow-hidden rounded-2xl border border-emerald-900/30 bg-[#111A11] transition-all hover:border-emerald-700/40 hover:shadow-lg hover:shadow-emerald-900/10"
      >
        {/* Image with badge */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#0D150D]">
          {deal.product.imageUrl ? (
            <Image
              src={deal.product.imageUrl}
              alt={deal.product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="280px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-emerald-900/30">
              <Leaf className="h-12 w-12" />
            </div>
          )}

          {/* Badge overlay */}
          {deal.badgeText && (
            <div className="absolute left-3 top-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black shadow-lg">
                <Zap className="h-3 w-3" />
                {deal.badgeText}
              </span>
            </div>
          )}

          {/* Countdown timer overlay */}
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1 text-xs font-mono font-semibold text-amber-300 backdrop-blur-sm">
              <Clock className="h-3 w-3" />
              {countdown}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-xs font-semibold text-emerald-500">
            {deal.titleEn}
          </p>
          <h3 className="mt-1 truncate text-sm font-bold text-white">
            {deal.product.name}
          </h3>
          <p className="mt-1 text-lg font-bold text-emerald-400">
            {formatPrice(deal.product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── TodaysDeals Section ─────────────────────────────────
export default function TodaysDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    async function fetchDeals() {
      try {
        const res = await fetch("/api/deals");
        if (!res.ok) return;
        const data: Deal[] = await res.json();
        setDeals(data);
      } catch {
        // silently fail — deals section is optional
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  // Track scroll position for arrows
  const updateScrollArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollArrows();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollArrows, { passive: true });
      return () => el.removeEventListener("scroll", updateScrollArrows);
    }
  }, [deals]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Don't render if no deals or still loading
  if (loading || deals.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15">
            <Zap className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Today&apos;s Deals
            </h2>
            <p className="text-xs text-zinc-500">
              Limited time offers - grab them before they&apos;re gone
            </p>
          </div>
        </div>

        {/* Desktop scroll arrows */}
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-emerald-900/30 transition-colors",
              canScrollLeft
                ? "bg-[#111A11] text-zinc-300 hover:border-emerald-700/40 hover:text-white"
                : "bg-[#111A11]/50 text-zinc-700"
            )}
            aria-label="Scroll deals left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-emerald-900/30 transition-colors",
              canScrollRight
                ? "bg-[#111A11] text-zinc-300 hover:border-emerald-700/40 hover:text-white"
                : "bg-[#111A11]/50 text-zinc-700"
            )}
            aria-label="Scroll deals right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scrollable deals row */}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:-mx-0 sm:px-0"
      >
        {deals.map((deal, i) => (
          <DealCard key={deal.id} deal={deal} index={i} />
        ))}
      </div>
    </section>
  );
}
