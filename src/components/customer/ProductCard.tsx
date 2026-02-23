"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart, AlertCircle, Heart, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useToast } from "@/components/ui/use-toast";
import { getDealForProduct } from "@/lib/deals";

interface ProductCardProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  strainType?: string | null;
  thcPercentage?: number | null;
  cbdPercentage?: number | null;
  inStock: boolean;
  weight?: string | null;
  category: {
    nameEn: string;
  };
  avgRating?: number;
  _count?: {
    reviews: number;
  };
}

interface ProductCardProps {
  product: ProductCardProduct;
  index?: number;
}

const strainColors: Record<string, string> = {
  SATIVA: "bg-amber-500/90 text-black",
  INDICA: "bg-purple-500/90 text-white",
  HYBRID: "bg-emerald-500/90 text-white",
  CBD: "bg-blue-500/90 text-white",
};

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartContext();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const favorited = isFavorited(product.id);
  const deal = getDealForProduct(product as any);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(product.id);
  };

  const handleAddToOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock) return;

    // The addItem expects a full Product from Prisma. We cast to any for the cart since
    // it stores the product alongside the item for display.
    addItem(product as any, 1);
    toast({
      title: "Added to order",
      description: `${product.name} added to your will-call order.`,
      variant: "success",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link
        href={`/products/${product.id}`}
        aria-label={`${product.name}${product.price > 0 ? `, ${formatPrice(product.price)}` : ""}${!product.inStock ? ", out of stock" : ""}`}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl border border-emerald-900/30 bg-[#111A11] transition-all duration-200",
          product.inStock
            ? "hover:border-emerald-700/40 hover:shadow-glow"
            : "opacity-70"
        )}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-[#0D150D]">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={`Photo of ${product.name}`}
              fill
              className={cn(
                "object-cover transition-transform duration-300",
                product.inStock && "group-hover:scale-105"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk4KBjqwAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-emerald-900/40">
                <svg
                  aria-hidden="true"
                  width="56"
                  height="56"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                >
                  <path d="M7 17.5c.3-2.8 2.5-5 5-5s4.7 2.2 5 5M12 2C8 2 5 4 4 8c-.5 2 0 4 1 5.5C6.5 15.5 8 17 8 20h8c0-3 1.5-4.5 3-6.5 1-1.5 1.5-3.5 1-5.5-1-4-4-6-8-6z" />
                  <path d="M12 2v10" />
                  <path d="M9.5 6C8 7.5 7 9.5 7 12" />
                  <path d="M14.5 6C16 7.5 17 9.5 17 12" />
                </svg>
              </div>
            </div>
          )}

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="flex items-center gap-1.5 rounded-full bg-red-950/80 px-3 py-1.5 text-xs font-semibold text-red-300">
                <AlertCircle className="h-3.5 w-3.5" />
                Out of Stock
              </div>
            </div>
          )}

          {/* Deal badge */}
          {deal && (
            <div className="absolute left-0 right-0 bottom-0 z-10">
              <div className="flex items-center justify-center gap-1 bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
                <Tag className="h-3 w-3" />
                {deal.badgeText}
              </div>
            </div>
          )}

          {/* Strain badge */}
          {product.strainType && (
            <div className="absolute left-2 top-2">
              <Badge
                className={cn(
                  "border-0 text-[10px] uppercase tracking-wide",
                  strainColors[product.strainType] || "bg-zinc-600 text-white"
                )}
              >
                {product.strainType}
              </Badge>
            </div>
          )}

          {/* Favorite heart */}
          <button
            onClick={handleToggleFavorite}
            className="absolute right-1.5 top-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            aria-label={favorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
            aria-pressed={favorited}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                favorited
                  ? "fill-red-500 text-red-500"
                  : "fill-transparent text-white/70"
              )}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          {/* Category */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 sm:text-[11px]">
            {product.category.nameEn}
          </p>

          {/* Name */}
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-white sm:text-base">
            {product.name}
          </h3>

          {/* THC / CBD pills */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {product.thcPercentage != null && product.thcPercentage > 0 && (
              <span className="rounded-md bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                THC {product.thcPercentage}%
              </span>
            )}
            {product.cbdPercentage != null && product.cbdPercentage > 0 && (
              <span className="rounded-md bg-blue-900/40 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">
                CBD {product.cbdPercentage}%
              </span>
            )}
            {product.weight && (
              <span className="rounded-md bg-zinc-800/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
                {product.weight}
              </span>
            )}
          </div>

          {/* Rating */}
          {product.avgRating != null && product.avgRating > 0 && (
            <div className="mt-2 flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.round(product.avgRating ?? 0)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-zinc-700 text-zinc-700"
                    )}
                  />
                ))}
              </div>
              {product._count?.reviews != null && (
                <span className="text-[10px] text-zinc-500">
                  ({product._count.reviews})
                </span>
              )}
            </div>
          )}

          {/* Price + Add button */}
          <div className="mt-auto flex items-center justify-between pt-3">
            {product.price > 0 ? (
              <span className="text-lg font-bold text-gold">
                {formatPrice(product.price)}
              </span>
            ) : (
              <span className="text-xs font-medium text-zinc-500">
                Price at pickup
              </span>
            )}
            <Button
              size="sm"
              disabled={!product.inStock}
              onClick={handleAddToOrder}
              aria-label={`Add ${product.name} to order`}
              className={cn(
                "h-10 sm:h-8 gap-1 px-3 text-xs btn-gold",
                !product.inStock && "cursor-not-allowed opacity-50"
              )}
            >
              <ShoppingCart className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
