"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Send,
  Clock,
  Calendar,
  Users,
  Smartphone,
  Bell,
  MessageSquare,
  CheckCircle2,
  X,
  Plus,
  Eye,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────
type DeliveryMethod = "sms" | "in_app" | "both";
type TargetAudience =
  | "all"
  | "seedling"
  | "grower"
  | "cultivator"
  | "master_grower"
  | "inactive";
type PromotionStatus = "sent" | "scheduled" | "draft";

interface Promotion {
  id: string;
  titleEn: string;
  titleEs: string | null;
  bodyEn: string;
  bodyEs: string | null;
  method: DeliveryMethod;
  audience: TargetAudience;
  status: PromotionStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  openRate?: number;
  createdBy: string;
  createdAt: string;
}

// ─── Option Constants ────────────────────────────────────
const AUDIENCE_OPTIONS: { value: TargetAudience; label: string }[] = [
  { value: "all", label: "All Customers" },
  { value: "seedling", label: "Seedling Tier" },
  { value: "grower", label: "Grower Tier" },
  { value: "cultivator", label: "Cultivator Tier" },
  { value: "master_grower", label: "Master Grower Tier" },
  { value: "inactive", label: "Inactive (30+ days)" },
];

const METHOD_OPTIONS: {
  value: DeliveryMethod;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "sms", label: "SMS", icon: Smartphone },
  { value: "in_app", label: "In-App", icon: Bell },
  { value: "both", label: "Both", icon: MessageSquare },
];

// ─── Compose Promotion Form ──────────────────────────────
interface ComposeFormProps {
  onClose: () => void;
  onSend: (payload: ComposePayload) => Promise<void>;
  sending: boolean;
}

interface ComposePayload {
  titleEn: string;
  titleEs: string;
  bodyEn: string;
  bodyEs: string;
  type: string;
  targetAudience: TargetAudience;
  sendNow: boolean;
  scheduledAt?: string;
}

function ComposePromotionForm({ onClose, onSend, sending }: ComposeFormProps) {
  const [form, setForm] = useState({
    titleEn: "",
    titleEs: "",
    bodyEn: "",
    bodyEs: "",
    method: "both" as DeliveryMethod,
    audience: "all" as TargetAudience,
    sendNow: true,
    scheduledDate: "",
    scheduledTime: "",
  });

  const selectedAudience = AUDIENCE_OPTIONS.find(
    (a) => a.value === form.audience
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: ComposePayload = {
      titleEn: form.titleEn,
      titleEs: form.titleEs,
      bodyEn: form.bodyEn,
      bodyEs: form.bodyEs,
      type: form.method.toUpperCase() === "IN_APP" ? "IN_APP" : form.method.toUpperCase(),
      targetAudience: form.audience,
      sendNow: form.sendNow,
      ...(!form.sendNow && form.scheduledDate && form.scheduledTime
        ? { scheduledAt: `${form.scheduledDate}T${form.scheduledTime}:00` }
        : {}),
    };

    await onSend(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 my-8 w-full max-w-2xl rounded-2xl border border-emerald-900/30 bg-[#111A11] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100">
            Compose Promotion
          </h2>
          <button
            onClick={onClose}
            disabled={sending}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* English Content */}
          <div className="rounded-lg border border-emerald-900/20 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <span className="rounded bg-emerald-600/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                EN
              </span>
              English Content
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Title
                </label>
                <Input
                  value={form.titleEn}
                  onChange={(e) =>
                    setForm({ ...form, titleEn: e.target.value })
                  }
                  placeholder="e.g. Weekend Flash Sale - 20% Off!"
                  required
                  disabled={sending}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Body
                </label>
                <textarea
                  value={form.bodyEn}
                  onChange={(e) =>
                    setForm({ ...form, bodyEn: e.target.value })
                  }
                  placeholder="Write your promotion message..."
                  rows={3}
                  required
                  disabled={sending}
                  className="w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Spanish Content */}
          <div className="rounded-lg border border-emerald-900/20 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <span className="rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                ES
              </span>
              Spanish Content
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Titulo
                </label>
                <Input
                  value={form.titleEs}
                  onChange={(e) =>
                    setForm({ ...form, titleEs: e.target.value })
                  }
                  placeholder="e.g. Venta Flash de Fin de Semana - 20% de Descuento!"
                  disabled={sending}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Cuerpo
                </label>
                <textarea
                  value={form.bodyEs}
                  onChange={(e) =>
                    setForm({ ...form, bodyEs: e.target.value })
                  }
                  placeholder="Escribe tu mensaje de promoci\u00f3n..."
                  rows={3}
                  disabled={sending}
                  className="w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Target Audience
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AUDIENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={sending}
                  onClick={() =>
                    setForm({ ...form, audience: option.value })
                  }
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-50",
                    form.audience === option.value
                      ? "border-emerald-600/50 bg-emerald-600/10"
                      : "border-emerald-900/20 bg-[#090F09] hover:border-emerald-900/40"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium",
                      form.audience === option.value
                        ? "text-emerald-400"
                        : "text-zinc-400"
                    )}
                  >
                    {option.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Method */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Delivery Method
            </label>
            <div className="flex gap-2">
              {METHOD_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={sending}
                    onClick={() =>
                      setForm({ ...form, method: option.value })
                    }
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                      form.method === option.value
                        ? "border-emerald-600/50 bg-emerald-600/10 text-emerald-400"
                        : "border-emerald-900/20 bg-[#090F09] text-zinc-500 hover:border-emerald-900/40 hover:text-zinc-300"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Send Timing */}
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              When to Send
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={sending}
                onClick={() => setForm({ ...form, sendNow: true })}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                  form.sendNow
                    ? "border-emerald-600/50 bg-emerald-600/10 text-emerald-400"
                    : "border-emerald-900/20 bg-[#090F09] text-zinc-500"
                )}
              >
                <Send className="h-4 w-4" />
                Send Now
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={() => setForm({ ...form, sendNow: false })}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors disabled:opacity-50",
                  !form.sendNow
                    ? "border-emerald-600/50 bg-emerald-600/10 text-emerald-400"
                    : "border-emerald-900/20 bg-[#090F09] text-zinc-500"
                )}
              >
                <Calendar className="h-4 w-4" />
                Schedule
              </button>
            </div>

            {!form.sendNow && (
              <div className="mt-3 flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-zinc-500">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={form.scheduledDate}
                    onChange={(e) =>
                      setForm({ ...form, scheduledDate: e.target.value })
                    }
                    required={!form.sendNow}
                    disabled={sending}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-zinc-500">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={form.scheduledTime}
                    onChange={(e) =>
                      setForm({ ...form, scheduledTime: e.target.value })
                    }
                    required={!form.sendNow}
                    disabled={sending}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-emerald-900/20 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : form.sendNow ? (
                <>
                  <Send className="h-4 w-4" />
                  Send to {selectedAudience?.label}
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Schedule
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Promotions Page ─────────────────────────────────────
export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Fetch promotions from API ──
  const fetchPromotions = useCallback(async () => {
    try {
      setFetchError(null);
      const res = await fetch("/api/promotions");
      if (!res.ok) {
        throw new Error(`Failed to fetch promotions (${res.status})`);
      }
      const data: Promotion[] = await res.json();
      setPromotions(data);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setFetchError(
        err instanceof Error ? err.message : "Failed to load promotions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // ── Auto-dismiss messages ──
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // ── Send promotion via API ──
  const handleSendPromotion = useCallback(
    async (payload: ComposePayload) => {
      setSending(true);
      setErrorMessage(null);
      try {
        const res = await fetch("/api/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || `Failed to create promotion (${res.status})`
          );
        }

        const result = await res.json();

        if (payload.sendNow) {
          setSuccessMessage(
            `Promotion sent to ${result.recipientCount?.toLocaleString() ?? 0} recipients (${result.smsSent?.toLocaleString() ?? 0} SMS delivered)`
          );
        } else {
          setSuccessMessage("Promotion scheduled successfully");
        }

        setShowCompose(false);

        // Refetch the promotions list
        await fetchPromotions();
      } catch (err) {
        console.error("Error sending promotion:", err);
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to send promotion"
        );
      } finally {
        setSending(false);
      }
    },
    [fetchPromotions]
  );

  const getStatusBadge = (status: PromotionStatus) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Sent
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <Clock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case "draft":
        return (
          <Badge className="border border-zinc-500/20 bg-zinc-500/10 text-zinc-400">
            Draft
          </Badge>
        );
    }
  };

  const getMethodLabel = (method: DeliveryMethod) => {
    const option = METHOD_OPTIONS.find((m) => m.value === method);
    if (!option) return method;
    const Icon = option.icon;
    return (
      <span className="flex items-center gap-1 text-xs text-zinc-400">
        <Icon className="h-3 w-3" />
        {option.label}
      </span>
    );
  };

  const getAudienceLabel = (audience: TargetAudience) => {
    const option = AUDIENCE_OPTIONS.find((a) => a.value === audience);
    return option?.label || audience;
  };

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            <Megaphone className="mr-2 inline-block h-6 w-6 text-emerald-400" />
            Promotions
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {loading
              ? "Loading..."
              : `${promotions.length} promotions \u00b7 ${promotions.filter((p) => p.status === "scheduled").length} scheduled`}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4" />
          Compose Promotion
        </Button>
      </div>

      {/* ─── Success / Error Messages ────────────────────── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="flex-1 text-sm text-emerald-300">{successMessage}</p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <p className="flex-1 text-sm text-red-300">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="rounded-lg p-1 text-red-400 hover:bg-red-500/20"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Loading State ───────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/20 bg-[#111A11] py-16">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-500">Loading promotions...</p>
        </div>
      )}

      {/* ─── Fetch Error State ───────────────────────────── */}
      {!loading && fetchError && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-900/20 bg-[#111A11] py-16">
          <AlertCircle className="mb-3 h-10 w-10 text-red-500" />
          <h3 className="text-lg font-semibold text-zinc-400">
            Failed to load promotions
          </h3>
          <p className="mt-1 text-sm text-zinc-600">{fetchError}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setLoading(true);
              fetchPromotions();
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* ─── Promotion History ───────────────────────────── */}
      {!loading && !fetchError && (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <motion.div
              key={promo.id}
              layout
              className="rounded-xl border border-emerald-900/30 bg-[#111A11] transition-shadow hover:shadow-lg"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-zinc-200">
                        {promo.titleEn}
                      </h3>
                      {getStatusBadge(promo.status)}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {promo.bodyEn}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                  {getMethodLabel(promo.method)}
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Users className="h-3 w-3" />
                    {getAudienceLabel(promo.audience)} (
                    {promo.recipientCount.toLocaleString()})
                  </span>
                  {promo.sentAt && (
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Send className="h-3 w-3" />
                      Sent{" "}
                      {new Date(promo.sentAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  {promo.scheduledAt && promo.status === "scheduled" && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <Calendar className="h-3 w-3" />
                      Scheduled{" "}
                      {new Date(promo.scheduledAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  {promo.openRate && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Eye className="h-3 w-3" />
                      {promo.openRate}% open rate
                    </span>
                  )}
                  <span className="text-zinc-600">by {promo.createdBy}</span>
                </div>
              </div>

              {/* Expand for Spanish version */}
              {promo.titleEs && (
                <>
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === promo.id ? null : promo.id
                      )
                    }
                    className="flex w-full items-center justify-center gap-1 border-t border-emerald-900/20 py-2 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-emerald-950/20 hover:text-zinc-300"
                  >
                    <span className="rounded bg-[#D4AF37]/20 px-1 py-0.5 text-[9px] font-bold text-[#D4AF37]">
                      ES
                    </span>
                    Ver en Espa\u00f1ol
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        expandedId === promo.id && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {expandedId === promo.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-emerald-900/20 bg-[#D4AF37]/5 px-5 py-3">
                          <p className="text-sm font-semibold text-[#D4AF37]">
                            {promo.titleEs}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            {promo.bodyEs}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          ))}

          {promotions.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-900/20 bg-[#111A11] py-16">
              <Megaphone className="mb-3 h-10 w-10 text-zinc-700" />
              <h3 className="text-lg font-semibold text-zinc-400">
                No promotions yet
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                Compose your first promotion to engage customers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Compose Modal ───────────────────────────────── */}
      <AnimatePresence>
        {showCompose && (
          <ComposePromotionForm
            onClose={() => {
              if (!sending) setShowCompose(false);
            }}
            onSend={handleSendPromotion}
            sending={sending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
