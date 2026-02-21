"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authenticateStaff } from "@/lib/staff-store";

// ─── Admin Login Page ────────────────────────────────────
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!email.trim()) {
        setError("Email is required");
        return;
      }
      if (!password) {
        setError("Password is required");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address");
        return;
      }

      setLoading(true);

      try {
        // Simulate auth delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Authenticate against staff store (localStorage-backed)
        const account = authenticateStaff(email, password);
        if (!account) {
          setError("Invalid email or password.");
          return;
        }

        // Store session in localStorage
        localStorage.setItem(
          "thcplus-staff-session",
          JSON.stringify({
            name: account.name,
            role: account.role,
            email: account.email,
          })
        );

        router.push("/admin");
      } catch {
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090F09] px-4">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-600/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-emerald-600/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/3 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo + Branding */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-900/40"
          >
            <Leaf className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-zinc-100">
            THC<span className="text-emerald-400">+</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Staff Portal</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-emerald-900/30 bg-[#111A11] p-8 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-950/30 p-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="you@thcplus.com"
                  className="pl-10"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 border-t border-emerald-900/20 pt-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
              <Shield className="h-3 w-3" />
              Demo Accounts
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setEmail("owner@thcplus.com"); setPassword("owner123"); setError(null); }}
                className="flex w-full items-center justify-between rounded-lg border border-emerald-900/20 bg-[#090F09] px-3 py-2 text-left transition-colors hover:border-emerald-700/40"
              >
                <div>
                  <p className="text-xs font-medium text-zinc-300">Owner / Admin</p>
                  <p className="text-[10px] text-zinc-600">Full access to everything</p>
                </div>
                <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                  ADMIN
                </span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail("staff@thcplus.com"); setPassword("staff123"); setError(null); }}
                className="flex w-full items-center justify-between rounded-lg border border-emerald-900/20 bg-[#090F09] px-3 py-2 text-left transition-colors hover:border-emerald-700/40"
              >
                <div>
                  <p className="text-xs font-medium text-zinc-300">Staff</p>
                  <p className="text-[10px] text-zinc-600">Orders & customer lookup only</p>
                </div>
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  STAFF
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] text-zinc-700">
          THC Plus Staff Portal v1.0 &middot; Authorized access only
        </p>
      </motion.div>
    </div>
  );
}
