"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import AdminSidebar, {
  isAdminRole,
  type StaffRole,
} from "@/components/admin/AdminSidebar";

// ─── Admin-only routes (staff cannot access) ──────────────
const ADMIN_ONLY_ROUTES = [
  "/admin/products",
  "/admin/analytics",
  "/admin/staff",
  "/admin/promotions",
  "/admin/export",
];

// ─── Admin Layout ─────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Login page renders without the sidebar wrapper
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090F09]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (status === "unauthenticated" || !session?.user) {
    router.replace("/admin/login");
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090F09]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const userRole = (session.user as any).role as StaffRole;
  const userName = session.user.name || "Staff";
  const userEmail = session.user.email || "";

  // Route guard: redirect staff away from admin-only pages
  const userIsAdmin = isAdminRole(userRole);
  if (!userIsAdmin) {
    const isAdminRoute = ADMIN_ONLY_ROUTES.some((r) =>
      pathname.startsWith(r)
    );
    if (isAdminRoute) {
      router.replace("/admin");
      return null;
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen bg-[#090F09]">
      {/* Skip to content — accessibility */}
      <a href="#admin-main-content" className="skip-to-content">
        Skip to main content
      </a>

      <AdminSidebar
        currentUser={{
          name: userName,
          role: userRole,
          email: userEmail,
        }}
        onSignOut={handleSignOut}
      />

      {/* Main content area */}
      <main id="admin-main-content" className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
