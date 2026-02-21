"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/customer/FadeIn";
import ProductCard from "@/components/customer/ProductCard";

interface FavoriteProduct {
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

interface FavoriteEntry {
  id: string;
  productId: string;
  product: FavoriteProduct;
  createdAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        setFavorites(data);
      } catch {
        // Network error
      } finally {
        setLoading(false);
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
          <h1 className="text-lg font-bold text-white">Favorites</h1>
          {!loading && favorites.length > 0 && (
            <span className="text-sm text-zinc-500">
              ({favorites.length})
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="text-sm text-zinc-500">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center gap-4 py-16">
              <Heart className="h-12 w-12 text-zinc-600" />
              <div className="text-center">
                <p className="text-zinc-400">No favorites yet</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Browse our menu and tap the heart icon to save your favorite
                  products
                </p>
              </div>
              <Button asChild>
                <Link href="/products">Browse Menu</Link>
              </Button>
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {favorites.map((fav, i) => (
                <ProductCard
                  key={fav.productId}
                  product={{
                    ...fav.product,
                    price: Number(fav.product.price),
                    thcPercentage: fav.product.thcPercentage
                      ? Number(fav.product.thcPercentage)
                      : null,
                    cbdPercentage: fav.product.cbdPercentage
                      ? Number(fav.product.cbdPercentage)
                      : null,
                  }}
                  index={i}
                />
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
