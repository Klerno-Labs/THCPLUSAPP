import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Middleware ─────────────────────────────────────────
// In production with real NextAuth sessions, replace this with:
//   export { auth as middleware } from "@/lib/auth";
//
// For now, we use localStorage-based mock auth, so the real
// NextAuth middleware is bypassed. Route-level role guards
// are handled client-side in the admin layout.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page through always
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // All other /admin/* routes pass through
  // (role enforcement is handled by the admin layout client-side)
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
