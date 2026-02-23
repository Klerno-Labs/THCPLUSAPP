"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function RotatingProductImage() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative h-[280px] w-[280px] opacity-15 sm:h-[400px] sm:w-[400px] sm:opacity-20 lg:h-[500px] lg:w-[500px]"
        >
          <Image
            src="/products/Platinum-Mac-hero.png"
            alt=""
            fill
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 500px"
            className="object-contain hero-product-mask"
            priority={false}
            aria-hidden="true"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* Float layer — gentle up/down hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
        className="relative flex flex-col items-center"
      >
        {/* Tilt layer — slow perspective rotation for 3D feel */}
        <div className="animate-hero-float">
          <div className="animate-hero-tilt">
            {/* Glow + image */}
            <div className="hero-product-tilt relative h-[280px] w-[280px] opacity-20 sm:h-[400px] sm:w-[400px] sm:opacity-25 lg:h-[520px] lg:w-[520px]">
              <Image
                src="/products/Platinum-Mac-hero.png"
                alt=""
                fill
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 520px"
                className="object-contain hero-product-mask"
                priority={false}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Ground shadow — sits below the bud, pulses with the float */}
        <div className="animate-hero-shadow hero-ground-shadow mt-2 h-6 w-[180px] rounded-full blur-xl sm:mt-4 sm:h-8 sm:w-[260px] lg:w-[320px]" />
      </motion.div>
    </div>
  );
}
