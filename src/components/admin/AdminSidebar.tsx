"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Trophy,
  Megaphone,
  Download,
  Gift,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Leaf,
  Zap,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// ─── Types ───────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  ownerOnly?: boolean;
}

export type StaffRole = "OWNER" | "MANAGER" | "STAFF";

interface AdminSidebarProps {
  currentUser?: {
    name: string;
    role: StaffRole;
    email: string;
  };
  onSignOut?: () => void;
}

/** Returns true if the role has admin access (OWNER or MANAGER) */
export function isAdminRole(role: string): boolean {
  return role === "OWNER" || role === "MANAGER";
}

// ─── Navigation Items ────────────────────────────────────
// adminOnly items are hidden from STAFF and MANAGER roles
const allNavItems: NavItem[] = [
  { label: "Orders", href: "/admin", icon: ShoppingCart },
  { label: "Products", href: "/admin/products", icon: Package, adminOnly: true },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Redemptions", href: "/admin/redemptions", icon: Gift },
  { label: "Inventory", href: "/admin/inventory", icon: Warehouse, ownerOnly: true },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, adminOnly: true },
  { label: "Staff", href: "/admin/staff", icon: Trophy, adminOnly: true },
  { label: "Promotions", href: "/admin/promotions", icon: Megaphone, adminOnly: true },
  { label: "Deals", href: "/admin/deals", icon: Zap, adminOnly: true },
  { label: "Export", href: "/admin/export", icon: Download, adminOnly: true },
];

// ─── Sidebar Component ──────────────────────────────────
export default function AdminSidebar({
  currentUser = {
    name: "Staff",
    role: "STAFF",
    email: "",
  },
  onSignOut,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const userIsAdmin = isAdminRole(currentUser.role);

  // Filter nav items based on role
  const navItems = allNavItems.filter(
    (item) =>
      (!item.adminOnly || userIsAdmin) &&
      (!item.ownerOnly || currentUser.role === "OWNER")
  );

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      window.location.href = "/admin/login";
    }
  };

  const roleLabel: Record<string, string> = {
    OWNER: "Owner",
    MANAGER: "Manager",
    STAFF: "Staff",
  };

  // Get current page title for mobile top bar
  const currentPageTitle =
    navItems.find((item) => isActive(item.href))?.label || "Dashboard";

  // ─── Shared Nav Content ─────────────────────────────────
  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-emerald-900/30 px-4 py-5",
          !isMobile && collapsed && "justify-center px-2"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 shadow-lg shadow-emerald-900/30">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        {(isMobile || !collapsed) && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-lg font-bold text-zinc-100">
              THC<span className="text-emerald-400">+</span>
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              {userIsAdmin ? "Admin Dashboard" : "Fulfillment"}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-emerald-600/15 text-emerald-400"
                  : "text-zinc-400 hover:bg-emerald-950/50 hover:text-zinc-200",
                !isMobile && collapsed && "justify-center px-2"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId={isMobile ? "admin-nav-active-mobile" : "admin-nav-active"}
                  className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-emerald-400"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  active
                    ? "text-emerald-400"
                    : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />

              {(isMobile || !collapsed) && (
                <span className="overflow-hidden whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed desktop mode */}
              {!isMobile && collapsed && (
                <div className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-md bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-200 shadow-lg group-hover:block">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-emerald-900/30 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2",
            !isMobile && collapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-900/50 text-sm font-bold text-emerald-400">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          {(isMobile || !collapsed) && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-zinc-200">
                {currentUser.name}
              </p>
              <p className="text-xs text-zinc-500">
                {roleLabel[currentUser.role] || currentUser.role}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleSignOut}
          className={cn(
            "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-red-950/30 hover:text-red-400",
            !isMobile && collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(isMobile || !collapsed) && (
            <span className="overflow-hidden whitespace-nowrap">
              Sign Out
            </span>
          )}
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      {!isMobile && (
        <div className="border-t border-emerald-900/30 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-zinc-500 transition-colors hover:bg-emerald-950/50 hover:text-zinc-300"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ─── Mobile Top Bar ───────────────────────────────── */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-emerald-900/30 bg-[#111A11]/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-zinc-100">
            THC<span className="text-emerald-400">+</span>{" "}
            <span className="text-xs font-normal text-zinc-500">
              {currentPageTitle}
            </span>
          </span>
        </div>

        {/* Mobile hamburger — Sheet trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-950/50 hover:text-zinc-200"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-[280px] border-emerald-900/30 bg-[#111A11] p-0"
          >
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <NavContent isMobile />
          </SheetContent>
        </Sheet>
      </div>

      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 z-30 hidden h-screen border-r border-emerald-900/30 bg-[#111A11] lg:block"
        role="navigation"
        aria-label="Admin sidebar navigation"
      >
        <NavContent />
      </motion.aside>

      {/* ─── Spacer for layout ─────────────────────────────── */}
      <motion.div
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden shrink-0 lg:block"
      />
    </>
  );
}
