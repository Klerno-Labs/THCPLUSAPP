"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  AlertCircle,
  Leaf,
  Beaker,
  Scale,
  Info,
  Heart,
  Bell,
  BellOff,
  Loader2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useFavorites } from "@/context/FavoritesContext";
import { useSession } from "next-auth/react";
import FadeIn from "./FadeIn";
import ShareButton from "./ShareButton";
import { getDealForProduct } from "@/lib/deals";

interface Review {
  id: string;
  rating: number;
  body?: string | null;
  createdAt: string;
  customer?: {
    name: string;
  } | null;
}

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  strainType?: string | null;
  category: {
    nameEn: string;
  };
}

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  descriptionEn?: string | null;
  imageUrl?: string | null;
  strainType?: string | null;
  thcPercentage?: number | null;
  cbdPercentage?: number | null;
  weight?: string | null;
  inStock: boolean;
  category: {
    nameEn: string;
    slug: string;
  };
  reviews: Review[];
  avgRating: number;
}

interface ProductDetailClientProps {
  product: ProductDetail;
  recommendations: RecommendedProduct[];
}

const strainColors: Record<string, string> = {
  SATIVA: "bg-amber-500/20 text-amber-300 border-amber-700/30",
  INDICA: "bg-purple-500/20 text-purple-300 border-purple-700/30",
  HYBRID: "bg-emerald-500/20 text-emerald-300 border-emerald-700/30",
  CBD: "bg-blue-500/20 text-blue-300 border-blue-700/30",
};

export default function ProductDetailClient({
  product,
  recommendations,
}: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartContext();
  const { toast } = useToast();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { data: session } = useSession();

  const isCustomer =
    (session?.user as { id?: string; role?: string })?.role === "CUSTOMER";
  const isLoggedIn = !!session?.user;

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState<Review[]>(product.reviews);

  const favorited = isFavorited(product.id);
  const deal = getDealForProduct(product as any);

  // Stock alert state
  const [stockAlertSubscribed, setStockAlertSubscribed] = useState(false);
  const [stockAlertLoading, setStockAlertLoading] = useState(false);
  const [stockAlertChecked, setStockAlertChecked] = useState(false);

  // Check if already subscribed to stock alert
  const checkStockAlert = useCallback(async () => {
    if (!isLoggedIn || product.inStock) return;
    try {
      const res = await fetch("/api/stock-alerts");
      if (!res.ok) return;
      const alerts = await res.json();
      const subscribed = alerts.some(
        (a: { productId: string }) => a.productId === product.id
      );
      setStockAlertSubscribed(subscribed);
    } catch {
      // silently fail
    } finally {
      setStockAlertChecked(true);
    }
  }, [isLoggedIn, product.id, product.inStock]);

  useEffect(() => {
    checkStockAlert();
  }, [checkStockAlert]);

  const handleStockAlertToggle = async () => {
    if (!isLoggedIn) return;
    setStockAlertLoading(true);
    try {
      if (stockAlertSubscribed) {
        // Unsubscribe
        const res = await fetch("/api/stock-alerts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        if (res.ok) {
          setStockAlertSubscribed(false);
          toast({
            title: "Alert removed",
            description: "You will no longer be notified when this product is back in stock.",
            variant: "success",
          });
        }
      } else {
        // Subscribe
        const res = await fetch("/api/stock-alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        if (res.ok) {
          setStockAlertSubscribed(true);
          toast({
            title: "Alert set",
            description: "We'll notify you when this product is back in stock.",
            variant: "success",
          });
        }
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setStockAlertLoading(false);
    }
  };

  const handleAddToOrder = () => {
    if (!product.inStock) return;
    addItem(product as any, quantity);
    toast({
      title: "Added to order",
      description: `${quantity}x ${product.name} added to your cart.`,
      variant: "success",
    });
    setQuantity(1);
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(product.id);
    toast({
      title: favorited ? "Removed from favorites" : "Added to favorites",
      description: favorited
        ? `${product.name} was removed from your favorites.`
        : `${product.name} was added to your favorites.`,
      variant: "success",
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          body: reviewBody.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit review");
      }

      const newReview: Review = await res.json();

      // Optimistically add the review with the session user's name
      const optimisticReview: Review = {
        ...newReview,
        customer: session?.user?.name
          ? { name: session.user.name }
          : null,
      };

      setLocalReviews((prev) => {
        // If the API returned an updated existing review, replace it
        const exists = prev.find((r) => r.id === optimisticReview.id);
        if (exists) {
          return prev.map((r) =>
            r.id === optimisticReview.id ? optimisticReview : r
          );
        }
        return [optimisticReview, ...prev];
      });

      setReviewRating(0);
      setReviewBody("");

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Could not submit review",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <FadeIn direction="left">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-emerald-900/30 bg-[#0D150D]">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk4KBjqwAAAABJRU5ErkJggg=="
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-emerald-900/30">
                    <svg
                      width="120"
                      height="120"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    >
                      <path d="M7 17.5c.3-2.8 2.5-5 5-5s4.7 2.2 5 5M12 2C8 2 5 4 4 8c-.5 2 0 4 1 5.5C6.5 15.5 8 17 8 20h8c0-3 1.5-4.5 3-6.5 1-1.5 1.5-3.5 1-5.5-1-4-4-6-8-6z" />
                      <path d="M12 2v10" />
                    </svg>
                  </div>
                </div>
              )}

              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="flex items-center gap-2 rounded-full bg-red-950/80 px-4 py-2 text-sm font-semibold text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    Out of Stock
                  </div>
                </div>
              )}

              {deal && (
                <div className="absolute left-0 right-0 bottom-0 z-10">
                  <div className="flex items-center justify-center gap-1.5 bg-amber-500 px-3 py-2 text-sm font-bold uppercase tracking-wide text-black">
                    <Tag className="h-4 w-4" />
                    {deal.badgeText}
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Details */}
          <FadeIn direction="right" delay={0.1}>
            <div className="flex flex-col">
              {/* Category + strain */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-emerald-500 hover:text-emerald-400"
                >
                  {product.category.nameEn}
                </Link>
                {product.strainType && (
                  <Badge
                    className={cn(
                      "text-[10px] uppercase",
                      strainColors[product.strainType]
                    )}
                  >
                    {product.strainType}
                  </Badge>
                )}
              </div>

              {/* Name + Favorite + Share buttons */}
              <div className="mt-2 flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {product.name}
                </h1>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <ShareButton
                    title={`${product.name} | THC Plus`}
                    text={`Check out ${product.name} at THC Plus!`}
                    url={`https://order.thcplus.com/products/${product.id}`}
                  />
                  {isCustomer && (
                    <button
                      onClick={handleToggleFavorite}
                      aria-label={
                        favorited
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      className={cn(
                        "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-all",
                        favorited
                          ? "border-rose-700/50 bg-rose-950/40 text-rose-400 hover:bg-rose-950/60"
                          : "border-zinc-700/40 bg-zinc-900/40 text-zinc-500 hover:border-rose-700/40 hover:text-rose-400"
                      )}
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5 transition-all",
                          favorited && "fill-rose-400"
                        )}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Rating */}
              {product.avgRating > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.round(product.avgRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-zinc-700 text-zinc-700"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-zinc-400">
                    {product.avgRating.toFixed(1)} ({product.reviews.length}{" "}
                    review{product.reviews.length !== 1 ? "s" : ""})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mt-4">
                <span className="text-3xl font-bold text-emerald-400">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Deal banner */}
              {deal && (
                <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-amber-600/30 bg-amber-500/10 px-4 py-3">
                  <Tag className="h-5 w-5 flex-shrink-0 text-amber-400" />
                  <div>
                    <p className="text-sm font-bold text-amber-300">
                      {deal.label}
                    </p>
                    <p className="mt-0.5 text-xs text-amber-400/70">
                      {deal.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Product info pills */}
              <div className="mt-6 flex flex-wrap gap-3">
                {product.thcPercentage != null && product.thcPercentage > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-800/30 bg-emerald-900/20 px-3 py-2">
                    <Leaf className="h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-[10px] font-medium uppercase text-zinc-500">
                        THC
                      </p>
                      <p className="text-sm font-bold text-emerald-300">
                        {product.thcPercentage}%
                      </p>
                    </div>
                  </div>
                )}
                {product.cbdPercentage != null && product.cbdPercentage > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-blue-800/30 bg-blue-900/20 px-3 py-2">
                    <Beaker className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-[10px] font-medium uppercase text-zinc-500">
                        CBD
                      </p>
                      <p className="text-sm font-bold text-blue-300">
                        {product.cbdPercentage}%
                      </p>
                    </div>
                  </div>
                )}
                {product.weight && (
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-700/30 bg-zinc-800/20 px-3 py-2">
                    <Scale className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-[10px] font-medium uppercase text-zinc-500">
                        Weight
                      </p>
                      <p className="text-sm font-bold text-zinc-300">
                        {product.weight}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.descriptionEn && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-zinc-300">
                    Description
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                    {product.descriptionEn}
                  </p>
                </div>
              )}

              {/* Quantity + Add to order (desktop/inline version) */}
              <div className="mt-8 hidden sm:flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Quantity selector */}
                <div className="flex items-center rounded-lg border border-emerald-800/30 bg-[#111A11]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-white disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-10 w-12 items-center justify-center border-x border-emerald-800/30 text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Button
                  size="lg"
                  disabled={!product.inStock}
                  onClick={handleAddToOrder}
                  className="flex-1 gap-2 sm:flex-initial"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Order
                </Button>
              </div>

              {/* Stock Alert — shown when out of stock */}
              {!product.inStock && isLoggedIn && stockAlertChecked && (
                <div className="mt-6">
                  <button
                    onClick={handleStockAlertToggle}
                    disabled={stockAlertLoading}
                    className={cn(
                      "flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border text-sm font-semibold transition-all sm:w-auto sm:px-6",
                      stockAlertSubscribed
                        ? "border-amber-700/40 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50"
                        : "border-emerald-700/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-950/50"
                    )}
                  >
                    {stockAlertLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : stockAlertSubscribed ? (
                      <>
                        <BellOff className="h-4 w-4" />
                        You&apos;ll be notified &middot; Tap to cancel
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        Notify Me When Back in Stock
                      </>
                    )}
                  </button>
                </div>
              )}

              {!product.inStock && !isLoggedIn && (
                <div className="mt-6 rounded-xl border border-zinc-700/30 bg-zinc-900/30 p-3 text-center">
                  <p className="text-sm text-zinc-400">
                    <Link
                      href="/auth/signin"
                      className="font-semibold text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
                    >
                      Sign in
                    </Link>{" "}
                    to get notified when this product is back in stock.
                  </p>
                </div>
              )}

              {/* Info notice */}
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-zinc-700/30 bg-zinc-900/50 px-3 py-2.5">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-500" />
                <p className="text-xs leading-relaxed text-zinc-500">
                  This is a will-call reservation. No payment is collected
                  online. Please bring a valid ID for pickup.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Reviews section */}
        <FadeIn delay={0.2}>
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-white">
              Customer Reviews
            </h2>

            {/* Existing reviews */}
            {localReviews.length > 0 ? (
              <div className="space-y-4">
                {localReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900/30 text-xs font-bold text-emerald-400">
                          {(review.customer?.name || "G")[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {review.customer?.name || "Guest"}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-zinc-700 text-zinc-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {review.body && (
                      <p className="mt-2 text-sm text-zinc-400">
                        {review.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                No reviews yet. Be the first to leave one below.
              </p>
            )}

            {/* Write a Review form / Sign-in prompt */}
            <div className="mt-8">
              <h3 className="mb-4 text-base font-semibold text-white">
                Write a Review
              </h3>

              {isLoggedIn ? (
                <form
                  onSubmit={handleReviewSubmit}
                  className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5 space-y-5"
                >
                  {/* Star rating selector */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        const filled =
                          starValue <= (reviewHover || reviewRating);
                        return (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Rate ${starValue} star${starValue !== 1 ? "s" : ""}`}
                            onClick={() => setReviewRating(starValue)}
                            onMouseEnter={() => setReviewHover(starValue)}
                            onMouseLeave={() => setReviewHover(0)}
                            className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-zinc-800/60"
                          >
                            <Star
                              className={cn(
                                "h-6 w-6 transition-all",
                                filled
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-zinc-700 text-zinc-600"
                              )}
                            />
                          </button>
                        );
                      })}
                      {reviewRating > 0 && (
                        <span className="ml-2 text-sm text-zinc-400">
                          {reviewRating} / 5
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review body */}
                  <div>
                    <label
                      htmlFor="review-body"
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400"
                    >
                      Your Review{" "}
                      <span className="normal-case text-zinc-600">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="review-body"
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      rows={3}
                      placeholder="Share your experience with this product..."
                      className="w-full resize-none rounded-lg border border-emerald-900/30 bg-[#0D150D] px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-700/50 focus:outline-none focus:ring-1 focus:ring-emerald-700/50"
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={reviewSubmitting || reviewRating === 0}
                    className="h-11 w-full sm:w-auto sm:px-8"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              ) : (
                <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5 text-center">
                  <p className="text-sm text-zinc-400">
                    <Link
                      href="/auth/signin"
                      className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                    >
                      Sign in
                    </Link>{" "}
                    to leave a review.
                  </p>
                </div>
              )}
            </div>
          </section>
        </FadeIn>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <FadeIn delay={0.25}>
            <section className="mt-12">
              <h2 className="mb-6 text-xl font-bold text-white">
                You Might Also Like
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {recommendations.map((rec) => (
                  <Link
                    key={rec.id}
                    href={`/products/${rec.id}`}
                    className="group overflow-hidden rounded-xl border border-emerald-900/30 bg-[#111A11] transition-all hover:border-emerald-700/40 hover:shadow-glow"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#0D150D]">
                      {rec.imageUrl ? (
                        <Image
                          src={rec.imageUrl}
                          alt={rec.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-emerald-900/30">
                          <Leaf className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
                        {rec.category.nameEn}
                      </p>
                      <h3 className="mt-1 truncate text-sm font-semibold text-white">
                        {rec.name}
                      </h3>
                      <p className="mt-1 text-sm font-bold text-emerald-400">
                        {formatPrice(rec.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </FadeIn>
        )}
      </div>

      {/* Mobile sticky add-to-cart bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-emerald-900/30 bg-[#090F09]/95 backdrop-blur-md sm:hidden pb-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Product info */}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-white">{product.name}</p>
            <p className="text-sm font-bold text-emerald-400">{formatPrice(product.price)}</p>
          </div>

          {/* Quantity selector - touch friendly 44px targets */}
          <div className="flex items-center rounded-lg border border-emerald-800/30 bg-[#111A11]">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-11 w-11 items-center justify-center text-zinc-400 transition-colors hover:text-white disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="flex h-11 w-10 items-center justify-center border-x border-emerald-800/30 text-sm font-semibold text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="flex h-11 w-11 items-center justify-center text-zinc-400 transition-colors hover:text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Add button */}
          <Button
            size="lg"
            disabled={!product.inStock}
            onClick={handleAddToOrder}
            className="h-11 gap-1.5 btn-gold px-4"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-24 sm:hidden" />
    </div>
  );
}
