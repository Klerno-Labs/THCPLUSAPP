"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { CartItem, Cart } from "@/types/app.types";
import type { Product } from "@prisma/client";
import { calculateCartDeals, type DealDiscount } from "@/lib/deals";

const CART_KEY = "thcplus-cart";

// NOTE: The cart stores full product objects (including prices) in localStorage.
// If product prices change between when the user adds an item and when they check out,
// the displayed cart prices may be stale. This is acceptable because the order creation
// API (POST /api/orders) always uses server-side prices from the database, not the
// client-supplied prices. The cart prices are for display purposes only.

interface CartContextValue {
  cart: Cart;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  /** Total savings from active deals (e.g. Buy 2 Get 1 Free) */
  savings: number;
  /** Breakdown of applied deal discounts */
  dealDiscounts: DealDiscount[];
  isLoaded: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveCart(items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0),
    [items]
  );

  const dealDiscounts = useMemo(
    () => calculateCartDeals(items.map((item) => ({
      quantity: item.quantity,
      product: item.product as any,
    }))),
    [items]
  );

  const savings = useMemo(
    () => dealDiscounts.reduce((sum, d) => sum + d.savings, 0),
    [dealDiscounts]
  );

  const cart: Cart = useMemo(
    () => ({ items, totalItems }),
    [items, totalItems]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      items,
      totalItems,
      totalPrice,
      savings,
      dealDiscounts,
      isLoaded,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [cart, items, totalItems, totalPrice, savings, dealDiscounts, isLoaded, addItem, removeItem, updateQuantity, clearCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
