"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, FlaskConical } from "lucide-react";
import FadeIn from "./FadeIn";

export default function QuizCTA() {
  return (
    <FadeIn delay={0.1}>
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-br from-[#D4AF37]/10 via-emerald-950/40 to-[#111A11]">
            {/* Decorative elements */}
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#D4AF37]/5 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

            <div className="relative flex flex-col items-center gap-6 px-6 py-10 text-center sm:flex-row sm:px-10 sm:py-12 sm:text-left">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8960C] shadow-lg"
              >
                <FlaskConical className="h-8 w-8 text-white" />
              </motion.div>

              {/* Text */}
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                    Personalized
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  Find Your Perfect Strain
                </h3>
                <p className="mt-2 max-w-md text-sm text-zinc-400">
                  Take our quick quiz to discover products tailored to your
                  preferences, experience level, and desired effects.
                </p>
              </div>

              {/* CTA */}
              <Link
                href="/quiz"
                className="group flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] px-6 py-3 font-semibold text-white transition-all hover:from-[#E0C04A] hover:to-[#D4AF37] hover:shadow-lg active:scale-[0.98]"
              >
                Start Quiz
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
