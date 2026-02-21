"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Package,
  ShoppingCart,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartContext } from "@/context/CartContext";
import AgeGate from "@/components/customer/AgeGate";
import { AiChatbot } from "@/components/customer/AiChatbot";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Menu", icon: Package },
  { href: "/cart", label: "Order", icon: ShoppingCart },
  { href: "/account", label: "Account", icon: User },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { totalItems } = useCartContext();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <AgeGate />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-900/30 bg-[#090F09]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo.png"
              alt="THC Plus"
              width={32}
              height={32}
              className="h-8 w-8 brightness-0 invert"
            />
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold tracking-tight text-white">
                THC
              </span>
              <span className="text-lg font-bold tracking-tight text-gold">
                +
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation" role="navigation">
            {navItems.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-emerald-900/30 text-emerald-400"
                    : "text-zinc-400 hover:bg-[#111A11] hover:text-zinc-200"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side: Cart + Account */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              aria-label={`Shopping cart${totalItems > 0 ? `, ${totalItems} items` : ""}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-[#111A11] hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-[#090F09]"
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </motion.span>
              )}
            </Link>
            <Link
              href="/account"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-[#111A11] hover:text-white md:flex"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-3.5rem-4rem)] pb-20 sm:min-h-[calc(100vh-4rem)] sm:pb-0">
        {children}
      </main>

      {/* AI Budtender Chat Widget */}
      <AiChatbot />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-emerald-900/30 bg-[#090F09]/95 backdrop-blur-md sm:hidden" aria-label="Mobile navigation" role="navigation">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors",
                  active ? "text-gold" : "text-zinc-500"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="bottomNav"
                    className="absolute -top-1 h-0.5 w-6 rounded-full bg-gold"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <item.icon className="h-5 w-5" />
                  {item.href === "/cart" && totalItems > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-[#090F09]">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for notched phones */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
}
