"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf, ArrowLeft, Loader2, Phone, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "phone" | "code" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        setStep("code");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep("success");
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === "success" ? "Password Reset" : "Forgot Password"}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {step === "phone" &&
              "Enter your phone number to receive a reset code"}
            {step === "code" &&
              "Enter the code we sent and your new password"}
            {step === "success" &&
              "Your password has been updated successfully"}
          </p>
        </div>

        {/* Step 1: Enter phone number */}
        {step === "phone" && (
          <form onSubmit={handleSendCode} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  type="tel"
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Reset Code"
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Enter code + new password */}
        {step === "code" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
              If an account exists with that number, a code was sent via SMS.
            </div>

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Reset Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                New Password
              </label>
              <Input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                type="password"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reset Password"
              )}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setNewPassword("");
                setError("");
              }}
              className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400"
            >
              Didn&apos;t receive a code? Try again
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
              Your password has been reset. You can now sign in with your new
              password.
            </div>

            <Link href="/auth/signin">
              <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                Sign In
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
