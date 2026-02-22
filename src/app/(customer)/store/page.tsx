"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Globe,
  ExternalLink,
  Copy,
  CheckCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STORE_ADDRESS = "5720 Hillcroft St, Houston, TX 77036";
const STORE_PHONE = "(832) 831-6882";
const STORE_PHONE_TEL = "tel:+18328316882";
const GOOGLE_MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE_ADDRESS)}`;
const GOOGLE_MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(STORE_ADDRESS)}&output=embed`;

const translations = {
  en: {
    title: "Our Store",
    address: "Address",
    phone: "Phone",
    hours: "Store Hours",
    getDirections: "Get Directions",
    callUs: "Call Us",
    copyAddress: "Copy Address",
    copied: "Copied!",
    monSat: "Monday - Saturday",
    sunday: "Sunday",
    monSatHours: "10:00 AM - 9:00 PM",
    sundayHours: "11:00 AM - 7:00 PM",
    openNow: "Open Now",
    closedNow: "Closed",
    willCallInfo: "Will-Call Pickup",
    willCallDesc:
      "Place your order online and pick up at our store. Orders are held for 24 hours after confirmation.",
    findUs: "Find Us",
  },
  es: {
    title: "Nuestra Tienda",
    address: "Direccion",
    phone: "Telefono",
    hours: "Horario de la Tienda",
    getDirections: "Obtener Direcciones",
    callUs: "Llamanos",
    copyAddress: "Copiar Direccion",
    copied: "Copiado!",
    monSat: "Lunes - Sabado",
    sunday: "Domingo",
    monSatHours: "10:00 AM - 9:00 PM",
    sundayHours: "11:00 AM - 7:00 PM",
    openNow: "Abierto Ahora",
    closedNow: "Cerrado",
    willCallInfo: "Recoger en Tienda",
    willCallDesc:
      "Haga su pedido en linea y recojalo en nuestra tienda. Los pedidos se mantienen por 24 horas despues de la confirmacion.",
    findUs: "Encuentranos",
  },
};

function getIsOpen(): boolean {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 60 + minute;

  if (day === 0) {
    // Sunday: 11am-7pm
    return time >= 660 && time < 1140;
  }
  if (day >= 1 && day <= 6) {
    // Mon-Sat: 10am-9pm
    return time >= 600 && time < 1260;
  }
  return false;
}

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function StorePage() {
  const [lang, setLang] = useState<"en" | "es">("en");
  const [addressCopied, setAddressCopied] = useState(false);
  const t = translations[lang];
  const isOpen = getIsOpen();

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(STORE_ADDRESS);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  return (
    <div className="min-h-screen bg-[#090F09]">
      {/* Header */}
      <div className="border-b border-emerald-900/30">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-emerald-950/50 hover:text-zinc-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-white">{t.title}</h1>
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="flex items-center gap-1.5 rounded-full border border-emerald-800/50 bg-[#111A11] px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-950/50"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "ES" : "EN"}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        {/* Open/Closed Status Badge */}
        <motion.div
          custom={0}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex justify-center"
        >
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2",
              isOpen
                ? "border-emerald-700/40 bg-emerald-950/30"
                : "border-red-800/40 bg-red-950/20"
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                isOpen ? "animate-pulse bg-emerald-400" : "bg-red-400"
              )}
            />
            <span
              className={cn(
                "text-sm font-semibold",
                isOpen ? "text-emerald-400" : "text-red-400"
              )}
            >
              {isOpen ? t.openNow : t.closedNow}
            </span>
          </div>
        </motion.div>

        {/* Address Card */}
        <motion.div
          custom={1}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-emerald-900/30 bg-[#111A11] p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-900/40">
              <MapPin className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t.address}
              </h2>
              <p className="mt-1 text-sm font-medium text-zinc-200">
                {STORE_ADDRESS}
              </p>
              <button
                onClick={handleCopyAddress}
                className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 transition-colors hover:text-emerald-300"
              >
                {addressCopied ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5" />
                    {t.copied}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    {t.copyAddress}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Phone Card */}
        <motion.div
          custom={2}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-emerald-900/30 bg-[#111A11] p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-900/40">
              <Phone className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t.phone}
              </h2>
              <a
                href={STORE_PHONE_TEL}
                className="mt-1 block text-sm font-medium text-zinc-200 transition-colors hover:text-emerald-400"
              >
                {STORE_PHONE}
              </a>
            </div>
          </div>
        </motion.div>

        {/* Hours Card */}
        <motion.div
          custom={3}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-emerald-900/30 bg-[#111A11] p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-900/40">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {t.hours}
              </h2>
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{t.monSat}</span>
                  <span className="text-sm font-medium text-zinc-100">
                    {t.monSatHours}
                  </span>
                </div>
                <div className="h-px bg-emerald-900/20" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{t.sunday}</span>
                  <span className="text-sm font-medium text-zinc-100">
                    {t.sundayHours}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          custom={4}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3"
        >
          <a
            href={GOOGLE_MAPS_DIRECTIONS}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white",
              "transition-all duration-200 hover:bg-emerald-500 hover:shadow-lg active:scale-[0.98]"
            )}
          >
            <Navigation className="h-4 w-4" />
            {t.getDirections}
          </a>
          <a
            href={STORE_PHONE_TEL}
            className={cn(
              "flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-emerald-700/50 bg-emerald-950/30 px-4 py-3 text-sm font-semibold text-emerald-400",
              "transition-all duration-200 hover:border-emerald-600/60 hover:bg-emerald-950/50 active:scale-[0.98]"
            )}
          >
            <Phone className="h-4 w-4" />
            {t.callUs}
          </a>
        </motion.div>

        {/* Will-Call Info */}
        <motion.div
          custom={5}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5"
        >
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#D4AF37]">
            <ExternalLink className="h-4 w-4" />
            {t.willCallInfo}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            {t.willCallDesc}
          </p>
        </motion.div>

        {/* Google Maps Embed */}
        <motion.div
          custom={6}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <h2 className="mb-3 text-sm font-semibold text-zinc-400">
            {t.findUs}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-emerald-900/30">
            <iframe
              src={GOOGLE_MAPS_EMBED}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="THC Plus Houston Location"
              className="w-full"
            />
          </div>
        </motion.div>

        {/* Bottom spacer for mobile nav */}
        <div className="h-4" />
      </div>
    </div>
  );
}
