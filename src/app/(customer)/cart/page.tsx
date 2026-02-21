"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  CreditCard,
  IdCard,
  Leaf,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartContext } from "@/context/CartContext";
import { useToast } from "@/components/ui/use-toast";
import FadeIn from "@/components/customer/FadeIn";

const ACTIVE_ORDER_KEY = "thcplus-active-order";

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCartContext();
  const { toast } = useToast();

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

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
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const cleanPhone = guestPhone.replace(/[\s\-()]/g, "");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          guestName: guestName.trim(),
          guestPhone: cleanPhone,
        }),
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
          <p className="mt-1 text-sm text-zinc-400">
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
                          <div className="flex items-center rounded-lg border border-emerald-800/30 bg-[#0D150D]">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:text-white"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="flex h-8 w-8 items-center justify-center border-x border-emerald-800/30 text-xs font-semibold text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:text-white"
                            >
                              <Plus className="h-3.5 w-3.5" />
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
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-900/20 hover:text-red-400"
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
              <div className="sticky top-24 space-y-6">
                {/* Summary card */}
                <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
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

                {/* Guest info form */}
                <div className="rounded-xl border border-emerald-900/30 bg-[#111A11] p-5">
                  <h3 className="mb-4 text-sm font-bold text-white">
                    Your Information
                  </h3>
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

                {/* Place Order button */}
                <Button
                  size="lg"
                  className="w-full gap-2 text-base btn-gold rounded-full"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || totalItems === 0}
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
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
