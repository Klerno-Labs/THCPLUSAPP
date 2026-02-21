"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import FadeIn from "./FadeIn";

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  strainType?: string | null;
  thcPercentage?: number | null;
  category: {
    nameEn: string;
  };
  avgRating?: number;
  _count?: {
    reviews: number;
  };
}

interface FeaturedProductsProps {
  products: FeaturedProduct[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 280;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <FadeIn>
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Section header */}
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Featured Products
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Our top picks for this week
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => scroll("left")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-800/40 bg-[#111A11] text-zinc-400 transition-colors hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-800/40 bg-[#111A11] text-zinc-400 transition-colors hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Horizontal scroll */}
          <div
            ref={scrollRef}
            className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-0 sm:px-0"
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="w-[250px] flex-shrink-0 sm:w-[280px]"
              >
                <Link
                  href={`/products/${product.id}`}
                  className="group block overflow-hidden rounded-xl border border-emerald-900/30 bg-[#111A11] transition-all duration-200 hover:border-emerald-700/40 hover:shadow-glow"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#0D150D]">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="280px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-4xl text-emerald-900/50">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Strain badge */}
                    {product.strainType && (
                      <div className="absolute left-2 top-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] uppercase",
                            product.strainType === "SATIVA" &&
                              "bg-amber-500/90 text-black",
                            product.strainType === "INDICA" &&
                              "bg-purple-500/90 text-white",
                            product.strainType === "HYBRID" &&
                              "bg-emerald-500/90 text-white",
                            product.strainType === "CBD" &&
                              "bg-blue-500/90 text-white"
                          )}
                        >
                          {product.strainType}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-500">
                      {product.category.nameEn}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-semibold text-white">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      {product.price > 0 ? (
                        <span className="text-base font-bold text-gold">
                          {formatPrice(product.price)}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-zinc-500">
                          Price at pickup
                        </span>
                      )}
                      {product.thcPercentage != null && (
                        <span className="text-xs text-zinc-500">
                          THC {product.thcPercentage}%
                        </span>
                      )}
                    </div>
                    {product.avgRating != null && product.avgRating > 0 && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-zinc-400">
                          {product.avgRating.toFixed(1)}
                        </span>
                        {product._count?.reviews != null && (
                          <span className="text-xs text-zinc-600">
                            ({product._count.reviews})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}

            {/* View all card */}
            <div className="flex w-[200px] flex-shrink-0 items-center justify-center">
              <Link
                href="/products"
                className="group flex flex-col items-center gap-2 text-zinc-400 transition-colors hover:text-emerald-400"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-800/40 bg-[#111A11] transition-colors group-hover:border-emerald-600/50 group-hover:bg-emerald-900/30">
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </div>
                <span className="text-sm font-medium">View All</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
