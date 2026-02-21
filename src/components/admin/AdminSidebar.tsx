"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Trophy,
  Megaphone,
  Download,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
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
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, adminOnly: true },
  { label: "Staff", href: "/admin/staff", icon: Trophy, adminOnly: true },
  { label: "Promotions", href: "/admin/promotions", icon: Megaphone, adminOnly: true },
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
    (item) => !item.adminOnly || userIsAdmin
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

  // ─── Desktop Sidebar ──────────────────────────────────
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-emerald-900/30 px-4 py-5",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 shadow-lg shadow-emerald-900/30">
          <Leaf className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-lg font-bold text-zinc-100">
                THC<span className="text-emerald-400">+</span>
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {userIsAdmin ? "Admin Dashboard" : "Fulfillment"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-emerald-600/15 text-emerald-400"
                  : "text-zinc-400 hover:bg-emerald-950/50 hover:text-zinc-200",
                collapsed && "justify-center px-2"
              )}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.div
                  layoutId="admin-nav-active"
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

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed mode */}
              {collapsed && (
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
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-900/50 text-sm font-bold text-emerald-400">
            {currentUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="min-w-0 flex-1 overflow-hidden"
              >
                <p className="truncate text-sm font-medium text-zinc-200">
                  {currentUser.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {roleLabel[currentUser.role] || currentUser.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleSignOut}
          className={cn(
            "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-colors hover:bg-red-950/30 hover:text-red-400",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle — desktop only */}
      <div className="hidden border-t border-emerald-900/30 p-3 lg:block">
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
              {userIsAdmin ? "Admin" : "Staff"}
            </span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-950/50 hover:text-zinc-200"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* ─── Mobile Overlay ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-[280px] border-r border-emerald-900/30 bg-[#111A11] lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Desktop Sidebar ──────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 z-30 hidden h-screen border-r border-emerald-900/30 bg-[#111A11] lg:block"
      >
        <SidebarContent />
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
