"use client";

import React, { useState, useCallback } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────
type DeliveryMethod = "sms" | "in_app" | "both";
type TargetAudience = "all" | "seedling" | "grower" | "cultivator" | "master_grower" | "inactive";
type PromotionStatus = "sent" | "scheduled" | "draft";

interface Promotion {
  id: string;
  titleEn: string;
  titleEs: string;
  bodyEn: string;
  bodyEs: string;
  method: DeliveryMethod;
  audience: TargetAudience;
  status: PromotionStatus;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openRate?: number;
  createdBy: string;
}

// ─── Mock Data ───────────────────────────────────────────
const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "promo1",
    titleEn: "Weekend Flash Sale - 20% Off Edibles!",
    titleEs: "Venta Flash de Fin de Semana - 20% de Descuento en Comestibles!",
    bodyEn: "This weekend only: Get 20% off all edibles. Use code WEEKEND20 at checkout or mention in-store. Valid Sat-Sun.",
    bodyEs: "Solo este fin de semana: Obtén 20% de descuento en todos los comestibles. Usa el código WEEKEND20. Válido Sáb-Dom.",
    method: "both",
    audience: "all",
    status: "sent",
    sentAt: "2025-02-15T10:00:00",
    recipientCount: 1247,
    openRate: 34.2,
    createdBy: "Marcus Chen",
  },
  {
    id: "promo2",
    titleEn: "VIP Early Access: New Strain Drop",
    titleEs: "Acceso Anticipado VIP: Nueva Variedad Disponible",
    bodyEn: "As a valued Master Grower, get early access to our new Wedding Cake x Gelato cross. Available 24hrs before general release.",
    bodyEs: "Como valioso Master Grower, obtén acceso anticipado a nuestro nuevo cruce Wedding Cake x Gelato. Disponible 24hrs antes.",
    method: "sms",
    audience: "master_grower",
    status: "scheduled",
    scheduledAt: "2025-02-22T09:00:00",
    recipientCount: 89,
    createdBy: "Priya Patel",
  },
  {
    id: "promo3",
    titleEn: "Welcome Back! 15% Off Your Next Order",
    titleEs: "Bienvenido de Vuelta! 15% de Descuento en Tu Próximo Pedido",
    bodyEn: "We miss you! Come back and enjoy 15% off your next order. No minimum purchase. Code: COMEBACK15",
    bodyEs: "Te extrañamos! Vuelve y disfruta de 15% de descuento. Sin compra mínima. Código: COMEBACK15",
    method: "sms",
    audience: "inactive",
    status: "sent",
    sentAt: "2025-02-10T14:00:00",
    recipientCount: 342,
    openRate: 28.7,
    createdBy: "Marcus Chen",
  },
  {
    id: "promo4",
    titleEn: "Double Points Tuesday!",
    titleEs: "Martes de Puntos Dobles!",
    bodyEn: "Every Tuesday this month, earn 2x loyalty points on all purchases. Stack with existing promotions!",
    bodyEs: "Todos los martes de este mes, gana 2x puntos de lealtad en todas las compras. Acumula con promociones existentes!",
    method: "in_app",
    audience: "all",
    status: "sent",
    sentAt: "2025-02-04T08:00:00",
    recipientCount: 1247,
    openRate: 41.5,
    createdBy: "Lucia Fernandez",
  },
];

const AUDIENCE_OPTIONS: { value: TargetAudience; label: string; count: number }[] = [
  { value: "all", label: "All Customers", count: 1247 },
  { value: "seedling", label: "Seedling Tier", count: 523 },
  { value: "grower", label: "Grower Tier", count: 345 },
  { value: "cultivator", label: "Cultivator Tier", count: 290 },
  { value: "master_grower", label: "Master Grower Tier", count: 89 },
  { value: "inactive", label: "Inactive (30+ days)", count: 342 },
];

const METHOD_OPTIONS: { value: DeliveryMethod; label: string; icon: React.ElementType }[] = [
  { value: "sms", label: "SMS", icon: Smartphone },
  { value: "in_app", label: "In-App", icon: Bell },
  { value: "both", label: "Both", icon: MessageSquare },
];

// ─── Compose Promotion Form ──────────────────────────────
interface ComposeFormProps {
  onClose: () => void;
  onSend: (promo: Partial<Promotion>) => void;
}

function ComposePromotionForm({ onClose, onSend }: ComposeFormProps) {
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
  const [preview, setPreview] = useState(false);

  const selectedAudience = AUDIENCE_OPTIONS.find((a) => a.value === form.audience);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const promo: Partial<Promotion> = {
      titleEn: form.titleEn,
      titleEs: form.titleEs,
      bodyEn: form.bodyEn,
      bodyEs: form.bodyEs,
      method: form.method,
      audience: form.audience,
      recipientCount: selectedAudience?.count || 0,
      createdBy: "Marcus Chen",
      status: form.sendNow ? "sent" : "scheduled",
      ...(form.sendNow
        ? { sentAt: new Date().toISOString() }
        : {
            scheduledAt: `${form.scheduledDate}T${form.scheduledTime}:00`,
          }),
    };

    onSend(promo);
    onClose();
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
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
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
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  placeholder="e.g. Weekend Flash Sale - 20% Off!"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Body
                </label>
                <textarea
                  value={form.bodyEn}
                  onChange={(e) => setForm({ ...form, bodyEn: e.target.value })}
                  placeholder="Write your promotion message..."
                  rows={3}
                  required
                  className="w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
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
                  onChange={(e) => setForm({ ...form, titleEs: e.target.value })}
                  placeholder="e.g. Venta Flash de Fin de Semana - 20% de Descuento!"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Cuerpo
                </label>
                <textarea
                  value={form.bodyEs}
                  onChange={(e) => setForm({ ...form, bodyEs: e.target.value })}
                  placeholder="Escribe tu mensaje de promoción..."
                  rows={3}
                  className="w-full rounded-lg border border-emerald-900/50 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
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
                  onClick={() => setForm({ ...form, audience: option.value })}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left transition-colors",
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
                  <p className="text-[10px] text-zinc-600">
                    {option.count.toLocaleString()} recipients
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
                    onClick={() => setForm({ ...form, method: option.value })}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
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
                onClick={() => setForm({ ...form, sendNow: true })}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
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
                onClick={() => setForm({ ...form, sendNow: false })}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors",
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
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 border-t border-emerald-900/20 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2">
              {form.sendNow ? (
                <>
                  <Send className="h-4 w-4" />
                  Send to {selectedAudience?.count.toLocaleString()} recipients
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
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
  const [showCompose, setShowCompose] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSendPromotion = useCallback((data: Partial<Promotion>) => {
    const newPromo: Promotion = {
      id: `promo_${Date.now()}`,
      titleEn: data.titleEn || "",
      titleEs: data.titleEs || "",
      bodyEn: data.bodyEn || "",
      bodyEs: data.bodyEs || "",
      method: data.method || "both",
      audience: data.audience || "all",
      status: data.status || "sent",
      sentAt: data.sentAt,
      scheduledAt: data.scheduledAt,
      recipientCount: data.recipientCount || 0,
      createdBy: data.createdBy || "Marcus Chen",
    };
    setPromotions((prev) => [newPromo, ...prev]);
  }, []);

  const getStatusBadge = (status: PromotionStatus) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Sent
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
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
            {promotions.length} promotions &middot;{" "}
            {promotions.filter((p) => p.status === "scheduled").length} scheduled
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4" />
          Compose Promotion
        </Button>
      </div>

      {/* ─── Promotion History ───────────────────────────── */}
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
                  {getAudienceLabel(promo.audience)} ({promo.recipientCount.toLocaleString()})
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
                    setExpandedId(expandedId === promo.id ? null : promo.id)
                  }
                  className="flex w-full items-center justify-center gap-1 border-t border-emerald-900/20 py-2 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-emerald-950/20 hover:text-zinc-300"
                >
                  <span className="rounded bg-[#D4AF37]/20 px-1 py-0.5 text-[9px] font-bold text-[#D4AF37]">
                    ES
                  </span>
                  Ver en Español
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

      {/* ─── Compose Modal ───────────────────────────────── */}
      <AnimatePresence>
        {showCompose && (
          <ComposePromotionForm
            onClose={() => setShowCompose(false)}
            onSend={handleSendPromotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
