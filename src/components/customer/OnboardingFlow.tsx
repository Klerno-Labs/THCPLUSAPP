"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { Package, ShoppingCart, Gift, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDED_KEY = "thcplus-onboarded";
const AGE_VERIFIED_KEY = "thcplus-age-verified";

const screens = [
  {
    icon: Package,
    titleEn: "Browse Our Menu",
    titleEs: "Explora Nuestro Menu",
    descEn: "Discover premium THCA flower, edibles, concentrates, and more. Updated daily with the latest products.",
    descEs: "Descubre flores THCA premium, comestibles, concentrados y mas. Actualizado diariamente con los productos mas recientes.",
    gradient: "from-emerald-500/20 to-emerald-900/10",
    iconBg: "bg-emerald-900/40",
    iconColor: "text-emerald-400",
  },
  {
    icon: ShoppingCart,
    titleEn: "Reserve & Pick Up",
    titleEs: "Reserva y Recoge",
    descEn: "Place will-call orders online. No payment required until you pick up in-store at our Houston location.",
    descEs: "Haz pedidos de reserva en linea. No se requiere pago hasta que recojas en nuestra tienda en Houston.",
    gradient: "from-blue-500/20 to-blue-900/10",
    iconBg: "bg-blue-900/40",
    iconColor: "text-blue-400",
  },
  {
    icon: Gift,
    titleEn: "Earn Rewards",
    titleEs: "Gana Recompensas",
    descEn: "Earn loyalty points with every pickup. Unlock tiers, redeem exclusive rewards, and save on your favorites.",
    descEs: "Gana puntos de lealtad con cada recogida. Desbloquea niveles, canjea recompensas exclusivas y ahorra en tus favoritos.",
    gradient: "from-[#D4AF37]/20 to-[#D4AF37]/5",
    iconBg: "bg-[#D4AF37]/20",
    iconColor: "text-[#D4AF37]",
  },
];

export default function OnboardingFlow() {
  const [show, setShow] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Only show if age is verified AND user hasn't been onboarded
    try {
      const ageVerified = localStorage.getItem(AGE_VERIFIED_KEY) === "true";
      const onboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
      if (ageVerified && !onboarded) {
        setShow(true);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDED_KEY, "true");
    } catch {
      // localStorage not available
    }
    setShow(false);
  }, []);

  const goToScreen = useCallback(
    (index: number) => {
      if (index < 0 || index >= screens.length) return;
      setDirection(index > currentScreen ? 1 : -1);
      setCurrentScreen(index);
    },
    [currentScreen]
  );

  const handleNext = useCallback(() => {
    if (currentScreen < screens.length - 1) {
      goToScreen(currentScreen + 1);
    } else {
      completeOnboarding();
    }
  }, [currentScreen, goToScreen, completeOnboarding]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x < -threshold && currentScreen < screens.length - 1) {
        goToScreen(currentScreen + 1);
      } else if (info.offset.x > threshold && currentScreen > 0) {
        goToScreen(currentScreen - 1);
      }
    },
    [currentScreen, goToScreen]
  );

  if (!show) return null;

  const isLastScreen = currentScreen === screens.length - 1;
  const screen = screens[currentScreen];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[150] flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-[#090F09]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.06)_0%,_transparent_70%)]" />
        </div>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={completeOnboarding}
          className="absolute right-4 top-4 z-20 rounded-full px-4 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          Skip
        </motion.button>

        {/* Swipeable content area */}
        <div className="relative z-10 flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentScreen}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className="flex w-full cursor-grab flex-col items-center text-center active:cursor-grabbing"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="relative mb-8"
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-full blur-2xl",
                    `bg-gradient-to-br ${screen.gradient}`
                  )}
                  style={{ transform: "scale(2)" }}
                />
                <div
                  className={cn(
                    "relative flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-800/30",
                    screen.iconBg
                  )}
                >
                  <screen.icon
                    className={cn("h-12 w-12", screen.iconColor)}
                    strokeWidth={1.5}
                  />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="mb-3 text-2xl font-bold text-white"
              >
                {screen.titleEn}
              </motion.h2>

              {/* Spanish subtitle */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-4 text-sm font-medium text-emerald-400/70"
              >
                {screen.titleEs}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="max-w-xs text-sm leading-relaxed text-zinc-400"
              >
                {screen.descEn}
              </motion.p>

              {/* Spanish description */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-600"
              >
                {screen.descEs}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 w-full max-w-sm px-6 pb-12">
          {/* Dot indicators */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {screens.map((_, index) => (
              <button
                key={index}
                onClick={() => goToScreen(index)}
                aria-label={`Go to screen ${index + 1}`}
                className="p-1"
              >
                <motion.div
                  animate={{
                    width: index === currentScreen ? 24 : 8,
                    backgroundColor:
                      index === currentScreen
                        ? "rgb(52, 211, 153)"
                        : "rgb(63, 63, 70)",
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="h-2 rounded-full"
                />
              </button>
            ))}
          </div>

          {/* Action button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className={cn(
              "group relative flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3.5 text-base font-semibold transition-all duration-200",
              isLastScreen
                ? "bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-lg"
                : "border border-emerald-700/50 bg-emerald-950/30 text-emerald-400 hover:border-emerald-600/60 hover:bg-emerald-950/50"
            )}
          >
            {isLastScreen ? (
              <>
                <span>Get Started</span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
            {isLastScreen && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
