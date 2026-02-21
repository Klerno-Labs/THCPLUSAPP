"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FadeIn from "@/components/customer/FadeIn";

interface ProfileData {
  name: string;
  phone: string;
  email: string;
  preferredLanguage: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // Check session first
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (!session?.user?.id) {
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/account");
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile({
              name: data.profile.name || "",
              phone: data.profile.phone || "",
              email: data.profile.email || "",
              preferredLanguage: data.profile.preferredLanguage || "en",
            });
          } else {
            // Authenticated but no customer profile — use session data
            setProfile({
              name: session.user.name || "",
              phone: session.user.phone || "",
              email: session.user.email || "",
              preferredLanguage: "en",
            });
          }
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email || null,
          preferredLanguage: profile.preferredLanguage,
        }),
      });

      if (res.ok) {
        setMessage("Settings saved!");
      } else {
        setMessage("Failed to save. Please try again.");
      }
    } catch {
      setMessage("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-emerald-900/30">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <Link
            href="/account"
            className="rounded-lg p-2 text-zinc-400 hover:bg-emerald-950/50 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-white">Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : !profile ? (
          <FadeIn>
            <div className="flex flex-col items-center gap-4 py-16">
              <p className="text-zinc-400">Sign in to manage your settings</p>
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <div className="space-y-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Full Name
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Phone Number
                </label>
                <Input value={profile.phone} disabled className="opacity-60" />
                <p className="mt-1 text-[11px] text-zinc-600">
                  Phone number cannot be changed
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Email
                </label>
                <Input
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Preferred Language
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "en", label: "English" },
                    { value: "es", label: "Espa\u00f1ol" },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() =>
                        setProfile({ ...profile, preferredLanguage: lang.value })
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        profile.preferredLanguage === lang.value
                          ? "border-emerald-600 bg-emerald-900/30 text-emerald-400"
                          : "border-emerald-900/30 bg-[#111A11] text-zinc-400 hover:border-emerald-700/50"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {message && (
                <div
                  className={`rounded-lg border px-4 py-3 text-sm ${
                    message.includes("saved")
                      ? "border-emerald-900/50 bg-emerald-950/30 text-emerald-400"
                      : "border-red-900/50 bg-red-950/30 text-red-400"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
