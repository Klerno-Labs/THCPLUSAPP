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
          className="relative h-[280px] w-[280px] opacity-25 sm:h-[400px] sm:w-[400px] sm:opacity-35 lg:h-[500px] lg:w-[500px]"
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
      {/* Outer: Framer Motion entrance + CSS float animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        className="relative h-[280px] w-[280px] opacity-25 sm:h-[400px] sm:w-[400px] sm:opacity-35 lg:h-[500px] lg:w-[500px] animate-float-y"
      >
        {/* Inner: CSS rotation + gold glow (combined in hero-product-spin) */}
        <div className="hero-product-spin h-full w-full">
          <Image
            src="/products/Platinum-Mac-hero.png"
            alt=""
            fill
            sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 500px"
            className="object-contain hero-product-mask"
            priority={false}
            aria-hidden="true"
          />
        </div>
      </motion.div>
    </div>
  );
}
