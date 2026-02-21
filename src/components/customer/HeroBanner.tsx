"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface HeroBannerProps {
  title: string;
  body?: string;
  imageUrl?: string;
}

export function HeroBanner({ title, body }: HeroBannerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/40 via-background to-background border border-emerald-500/10"
    >
      {/* Gradient glow */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[200%] bg-emerald-500/5 blur-3xl rounded-full" />
        <div className="absolute bottom-[-30%] right-[-10%] w-[40%] h-[150%] bg-gold-500/5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 px-6 py-10 md:px-10 md:py-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight max-w-lg">
          {title}
        </h1>
        {body && (
          <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
            {body}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-background font-semibold text-sm transition-all duration-200 shadow-glow hover:shadow-glow-lg"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
