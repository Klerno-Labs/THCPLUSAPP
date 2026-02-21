"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Globe, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const AGE_VERIFIED_KEY = "thcplus-age-verified";

const translations = {
  en: {
    title: "Age Verification Required",
    subtitle: "You must be 21 years of age or older to view this site.",
    confirm: "I am 21 or older",
    deny: "I am under 21",
    sorry: "Sorry, you must be 21 or older to access this site.",
    redirect: "You will be redirected shortly.",
    disclaimer:
      "By entering this site you agree to our Terms of Service and Privacy Policy.",
  },
  es: {
    title: "Verificacion de Edad Requerida",
    subtitle: "Debe tener 21 anos de edad o mas para ver este sitio.",
    confirm: "Tengo 21 anos o mas",
    deny: "Soy menor de 21 anos",
    sorry: "Lo sentimos, debe tener 21 anos o mas para acceder a este sitio.",
    redirect: "Sera redirigido en breve.",
    disclaimer:
      "Al ingresar a este sitio, acepta nuestros Terminos de Servicio y Politica de Privacidad.",
  },
};

export default function AgeGate() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isDenied, setIsDenied] = useState(false);
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    try {
      const verified = localStorage.getItem(AGE_VERIFIED_KEY);
      setIsVerified(verified === "true");
    } catch {
      setIsVerified(false);
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    setIsVerified(true);
  };

  const handleDeny = () => {
    setIsDenied(true);
  };

  // Still loading from localStorage
  if (isVerified === null) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#090F09]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
      </div>
    );
  }

  // Already verified
  if (isVerified) return null;

  const t = translations[lang];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      >
        {/* Background with radial gradient */}
        <div className="absolute inset-0 bg-[#090F09]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.08)_0%,_transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.04)_0%,_transparent_50%)]" />
        </div>

        {/* Language toggle */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-emerald-800/50 bg-[#111A11] px-3 py-1.5 text-sm text-emerald-400 transition-colors hover:bg-emerald-950/50"
        >
          <Globe className="h-4 w-4" />
          {lang === "en" ? "ES" : "EN"}
        </motion.button>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 mx-4 flex w-full max-w-md flex-col items-center text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex flex-col items-center gap-3"
          >
            <div className="relative flex h-20 w-20 items-center justify-center">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
              {/* Logo container */}
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-700/30 bg-gradient-to-br from-emerald-900/60 to-[#111A11] shadow-glow">
                <Leaf className="h-8 w-8 text-emerald-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-white">
                THC
              </span>
              <span className="text-2xl font-bold tracking-tight text-emerald-400">
                Plus
              </span>
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#D4AF37]">
              Premium Hemp Products
            </span>
          </motion.div>

          {/* Denied state */}
          <AnimatePresence mode="wait">
            {isDenied ? (
              <motion.div
                key="denied"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4 rounded-2xl border border-red-800/30 bg-red-950/20 px-8 py-10"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                  <ShieldCheck className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-lg font-semibold text-red-300">{t.sorry}</p>
                <p className="text-sm text-red-400/70">{t.redirect}</p>
              </motion.div>
            ) : (
              <motion.div
                key="gate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex w-full flex-col items-center gap-6"
              >
                {/* Shield icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-700/30 bg-emerald-900/20">
                  <ShieldCheck className="h-7 w-7 text-emerald-400" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                  <p className="text-sm text-zinc-400">{t.subtitle}</p>
                </div>

                {/* Buttons */}
                <div className="flex w-full flex-col gap-3">
                  <button
                    onClick={handleConfirm}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white",
                      "transition-all duration-200 hover:bg-emerald-500 hover:shadow-glow-lg",
                      "active:scale-[0.98]"
                    )}
                  >
                    <span className="relative z-10">{t.confirm}</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  </button>

                  <button
                    onClick={handleDeny}
                    className={cn(
                      "w-full rounded-xl border border-zinc-700/50 bg-transparent px-6 py-3 text-sm font-medium text-zinc-400",
                      "transition-colors duration-200 hover:border-zinc-600 hover:text-zinc-300"
                    )}
                  >
                    {t.deny}
                  </button>
                </div>

                {/* Disclaimer */}
                <p className="max-w-xs text-[11px] leading-relaxed text-zinc-600">
                  {t.disclaimer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
