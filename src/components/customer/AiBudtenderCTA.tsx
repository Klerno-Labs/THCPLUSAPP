"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import FadeIn from "./FadeIn";

export default function AiBudtenderCTA() {
  return (
    <FadeIn delay={0.15}>
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-emerald-950/60 via-[#111A11] to-[#111A11]">
            {/* Decorative elements */}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#D4AF37]/5 blur-3xl" />

            <div className="relative flex flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:px-10 sm:py-12 sm:text-left">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-glow"
              >
                <Bot className="h-8 w-8 text-white" />
              </motion.div>

              {/* Text */}
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                    AI-Powered
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Meet Your AI Budtender
                </h3>
                <p className="mt-2 max-w-md text-sm text-zinc-400">
                  Not sure what to try? Our AI assistant can recommend products
                  based on your preferences, mood, and desired effects.
                </p>
              </div>

              {/* CTA */}
              <Link
                href="/chat"
                className="group flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-500 hover:shadow-glow active:scale-[0.98]"
              >
                Start Chat
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
