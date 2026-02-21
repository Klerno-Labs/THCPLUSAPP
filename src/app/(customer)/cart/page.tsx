"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  IdCard,
  Leaf,
  Phone,
  User as UserIcon,
  LogIn,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartContext } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import FadeIn from "@/components/customer/FadeIn";

const ACTIVE_ORDER_KEY = "thcplus-active-order";

type CheckoutMode = "logged-in" | "guest" | "choosing";

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCartContext();
  const { toast } = useToast();

  const isLoggedIn =
    status === "authenticated" &&
    (session?.user as any)?.role === "CUSTOMER";
  const customerName = (session?.user as any)?.name || "";
  const customerPhone = (session?.user as any)?.phone || "";

  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>(
    isLoggedIn ? "logged-in" : "choosing"
  );
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  // Update checkout mode when session loads
  useEffect(() => {
    if (isLoggedIn && checkoutMode === "choosing") {
      setCheckoutMode("logged-in");
    }
  }, [isLoggedIn, checkoutMode]);

  const validateForm = (): boolean => {
    const newErrors: { name?: string; phone?: string } = {};

    if (!guestName.trim() || guestName.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    const cleanPhone = guestPhone.replace(/[\s\-()]/g, "");
    if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    // Skip validation for logged-in users
    if (!isLoggedIn && !validateForm()) return;

    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      let body: Record<string, unknown>;

      if (isLoggedIn) {
        body = {
          items: orderItems,
          customerId: session!.user!.id,
        };
      } else {
        const cleanPhone = guestPhone.replace(/[\s\-()]/g, "");
        body = {
          items: orderItems,
          guestName: guestName.trim(),
          guestPhone: cleanPhone,
        };
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to place order");
      }

      const order = await res.json();

      // Save active order to localStorage
      localStorage.setItem(
        ACTIVE_ORDER_KEY,
        JSON.stringify({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalItems,
          createdAt: order.createdAt,
        })
      );

      clearCart();

      toast({
        title: "Will-call order placed!",
        description: `Order ${order.orderNumber} submitted. We'll text you when it's ready.`,
        variant: "success",
      });

      router.push(`/order/${order.id}`);
    } catch (err) {
      toast({
        title: "Failed to place order",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empty cart state
  if (totalItems === 0) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <FadeIn>
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#111A11]">
                <ShoppingCart className="h-10 w-10 text-zinc-600" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                No items yet
              </h1>
              <p className="text-sm text-zinc-400">
                Browse our menu and add products to your will-call order.
              </p>
              <Button asChild size="lg" className="mt-4 btn-gold rounded-full px-8">
                <Link href="/products">
                  Browse Menu
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-emerald-900/30 bg-gradient-to-b from-emerald-950/20 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Your Will-Call Order
          </h1>
          <p className="mt-1 text-sm text-zinc-400" aria-live="polite" role="status">
            {totalItems} item{totalItems !== 1 ? "s" : ""} reserved &middot; Pay when you pick up
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <FadeIn>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-4 rounded-xl border border-emerald-900/30 bg-[#111A11] p-3 sm:p-4"
                    >
                      {/* Product image */}
                      <Link
                        href={`/products/${item.productId}`}
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#0D150D] sm:h-24 sm:w-24"
                      >
                        {item.product?.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-emerald-900/40">
                            <Leaf className="h-8 w-8" />
                          </div>
                        )}
                      </Link>

                      {/* Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${item.productId}`}
                            className="text-sm font-semibold text-white hover:text-gold sm:text-base"
                          >
                            {item.product?.name || "Product"}
                          </Link>
                          {(item.product?.price ?? 0) > 0 ? (
                            <p className="mt-0.5 text-sm font-bold text-gold">
                              {formatPrice(item.product?.price ?? 0)}
                            </p>
                          ) : (
                            <p className="mt-0.5 text-xs text-zinc-500">
                              Price at pickup
                            </p>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          {/* Quantity */}
                          <div className="flex items-center rounded-lg border border-emerald-800/30 bg-[#0D150D]" role="group" aria-label={`Quantity for ${item.product?.name || "product"}`}>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              aria-label={`Decrease quantity of ${item.product?.name || "product"}`}
                              className="flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center text-zinc-400 transition-colors hover:text-white"
                            >
                              <Minus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                            </button>
                            <span className="flex h-11 w-9 sm:h-8 sm:w-8 items-center justify-center border-x border-emerald-800/30 text-sm sm:text-xs font-semibold text-white" aria-live="polite" aria-atomic="true">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              aria-label={`Increase quantity of ${item.product?.name || "product"}`}
                              className="flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center text-zinc-400 transition-colors hover:text-white"
                            >
                              <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                            </button>
                          </div>

                          {/* Subtotal + remove */}
                          <div className="flex items-center gap-3">
                            {(item.product?.price ?? 0) > 0 && (
                              <span className="text-sm font-semibold text-zinc-300">
                                {formatPrice(
                                  (item.product?.price ?? 0) * item.quantity
                                )}
                              </span>
                            )}
                            <button
                              onClick={() => {
                                removeItem(item.productId);
                                toast({
                                  title: "Removed",
                                  description: `${item.product?.name} removed from order.`,
                                });
                              }}
                              aria-label={`Remove ${item.product?.name || "product"} from order`}
                              className="flex h-11 w-11 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-900/20 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </FadeIn>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.15}>
              <div className="sticky top-24 space-y-6 pb-44 sm:pb-0">
                {/* Summary card */}
                <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5" aria-live="polite" role="status">
                  <h2 className="mb-4 text-lg font-bold text-white">
                    Order Summary
                  </h2>

                  <div className="space-y-2 border-b border-emerald-900/30 pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">
                        Items ({totalItems})
                      </span>
                      {totalPrice > 0 ? (
                        <span className="text-white">
                          {formatPrice(totalPrice)}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs">
                          Price at pickup
                        </span>
                      )}
                    </div>
                  </div>

                  {totalPrice > 0 && (
                    <div className="flex justify-between pt-4">
                      <span className="text-base font-semibold text-white">
                        Estimated Total
                      </span>
                      <span className="text-lg font-bold text-gold">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* No payment disclaimer */}
                <div className="flex items-start gap-2.5 rounded-xl border border-gold-700/30 bg-gold-500/5 px-4 py-3">
                  <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" />
                  <div>
                    <p className="text-xs font-semibold text-gold-300">
                      No Payment Collected Online
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gold-400/60">
                      This is a will-call reservation. You pay when you pick up
                      your order in store.
                    </p>
                  </div>
                </div>

                {/* ID reminder */}
                <div className="flex items-start gap-2.5 rounded-xl border border-zinc-700/30 bg-zinc-900/30 px-4 py-3">
                  <IdCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-400" />
                  <div>
                    <p className="text-xs font-semibold text-zinc-300">
                      Valid ID Required at Pickup
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                      Bring a valid government-issued ID. Must be 21+.
                    </p>
                  </div>
                </div>

                {/* Checkout identity section */}
                {isLoggedIn ? (
                  /* Logged-in: show confirmed identity */
                  <div className="rounded-xl border border-emerald-600/30 bg-emerald-950/20 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/20">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white">
                          Ordering as {customerName}
                        </h3>
                        {customerPhone && (
                          <p className="mt-0.5 text-xs text-zinc-400">
                            {customerPhone}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-zinc-600">
                          We&apos;ll text you when your order is ready
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut({ redirect: false })}
                      className="mt-3 text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
                    >
                      Not you? Sign out
                    </button>
                  </div>
                ) : checkoutMode === "choosing" ? (
                  /* Guest: show 3 options */
                  <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
                    <h3 className="mb-4 text-sm font-bold text-white">
                      How would you like to check out?
                    </h3>
                    <div className="space-y-2.5">
                      <Link
                        href="/auth/signin?callbackUrl=/cart"
                        className="flex items-center gap-3 rounded-lg border border-emerald-900/30 bg-[#0D150D] px-4 py-4 sm:py-3 transition-colors hover:border-emerald-700/40 hover:bg-emerald-950/30"
                      >
                        <div className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-600/15">
                          <LogIn className="h-5 w-5 sm:h-4 sm:w-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Sign In
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Already have an account?
                          </p>
                        </div>
                      </Link>

                      <Link
                        href="/auth/signup?callbackUrl=/cart"
                        className="flex items-center gap-3 rounded-lg border border-emerald-900/30 bg-[#0D150D] px-4 py-4 sm:py-3 transition-colors hover:border-emerald-700/40 hover:bg-emerald-950/30"
                      >
                        <div className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gold/10">
                          <UserPlus className="h-5 w-5 sm:h-4 sm:w-4 text-gold" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Create Account
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Save your info for faster checkout
                          </p>
                        </div>
                      </Link>

                      <button
                        onClick={() => setCheckoutMode("guest")}
                        className="flex w-full items-center gap-3 rounded-lg border border-zinc-800/50 bg-[#0D150D] px-4 py-4 sm:py-3 text-left transition-colors hover:border-zinc-700/50"
                      >
                        <div className="flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-zinc-800/50">
                          <UserIcon className="h-5 w-5 sm:h-4 sm:w-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Continue as Guest
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Just enter your pickup info
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Guest form */
                  <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <button
                        onClick={() => setCheckoutMode("choosing")}
                        className="rounded-lg p-1 text-zinc-500 hover:text-zinc-300"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <h3 className="text-sm font-bold text-white">
                        Your Information
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-400">
                          Full Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <Input
                            value={guestName}
                            onChange={(e) => {
                              setGuestName(e.target.value);
                              if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            placeholder="Your full name"
                            className="pl-9"
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-400">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-zinc-400">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <Input
                            value={guestPhone}
                            onChange={(e) => {
                              setGuestPhone(e.target.value);
                              if (errors.phone) setErrors({ ...errors, phone: undefined });
                            }}
                            placeholder="+1 (346) 555-1234"
                            type="tel"
                            className="pl-9"
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-400">
                            {errors.phone}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] text-zinc-600">
                          We&apos;ll text you when your order is ready for pickup
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Place Order button — desktop inline */}
                <div className="hidden sm:block">
                  <Button
                    size="lg"
                    className="w-full gap-2 text-base btn-gold rounded-full"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || totalItems === 0 || checkoutMode === "choosing"}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#090F09]/30 border-t-[#090F09]" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Place Will-Call Order
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Mobile sticky Place Order bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-emerald-900/30 bg-[#090F09]/95 backdrop-blur-md sm:hidden pb-safe">
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-zinc-400">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
            {totalPrice > 0 && (
              <p className="text-base font-bold text-gold">{formatPrice(totalPrice)}</p>
            )}
          </div>
          <Button
            size="lg"
            className="h-12 flex-1 gap-2 text-base btn-gold rounded-full"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || totalItems === 0 || checkoutMode === "choosing"}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#090F09]/30 border-t-[#090F09]" />
                Placing...
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Place Order
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
