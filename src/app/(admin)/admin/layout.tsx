"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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

interface StaffSession {
  name: string;
  role: StaffRole;
  email: string;
}

function getStaffSession(): StaffSession {
  if (typeof window === "undefined") {
    return { name: "", role: "STAFF", email: "" };
  }
  try {
    const raw = localStorage.getItem("thcplus-staff-session");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { name: "Staff User", role: "STAFF", email: "" };
}

// ─── Admin Layout ─────────────────────────────────────────
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<StaffSession | null>(null);

  useEffect(() => {
    const s = getStaffSession();
    setSession(s);
  }, [pathname]);

  // Route guard: redirect staff away from admin-only pages
  useEffect(() => {
    if (!session) return;
    if (!isAdminRole(session.role)) {
      const isAdminRoute = ADMIN_ONLY_ROUTES.some((r) =>
        pathname.startsWith(r)
      );
      if (isAdminRoute) {
        router.replace("/admin");
      }
    }
  }, [session, pathname, router]);

  const handleSignOut = () => {
    localStorage.removeItem("thcplus-staff-session");
    window.location.href = "/admin/login";
  };

  // Login page renders without the sidebar wrapper
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Don't render until session is loaded (prevents flash)
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090F09]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#090F09]">
      <AdminSidebar
        currentUser={{
          name: session.name,
          role: session.role,
          email: session.email,
        }}
        onSignOut={handleSignOut}
      />

      {/* Main content area */}
      <main className="flex-1 pt-14 lg:pt-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
