"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@prisma/client";
import type { Cart, CartItem } from "@/types/app.types";

interface CartContextType {
  cart: Cart;
  items: CartItem[];
  totalItems: number;
  isLoaded: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cartState = useCart();

  return (
    <CartContext.Provider value={cartState}>{children}</CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
