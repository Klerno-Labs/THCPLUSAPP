"use client";

import Link from "next/link";
import { ShoppingBag, User, Search } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { LanguageToggle } from "@/components/shared/LanguageToggle";
import { cn } from "@/lib/utils";
import { useCartContext } from "@/context/CartContext";

export function CustomerHeader() {
  const { totalItems } = useCartContext();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo size="sm" />
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <LanguageToggle className="hidden sm:flex" />

          <Link
            href="/products"
            className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Search products"
          >
            <Search className="w-5 h-5" />
          </Link>

          <Link
            href="/account"
            className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Account"
          >
            <User className="w-5 h-5" />
          </Link>

          <Link
            href="/cart"
            className={cn(
              "relative p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            )}
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
