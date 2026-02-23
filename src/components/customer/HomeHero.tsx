"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShoppingCart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import RotatingProductImage from "@/components/customer/RotatingProductImage";

interface HeroBanner {
  id: string;
  titleEn: string;
  titleEs?: string | null;
  bodyEn?: string | null;
  bodyEs?: string | null;
  imageUrl?: string | null;
}

interface HomeHeroProps {
  banners: HeroBanner[];
}

export default function HomeHero({ banners }: HomeHeroProps) {
  const banner = banners[0];

  return (
    <section className="relative overflow-hidden">
      {/* Background gradients — gold tinted */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-[#090F09] to-[#090F09]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.08)_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.06)_0%,_transparent_60%)]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* 3D Rotating Product Image — behind text */}
      <RotatingProductImage />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Image
              src="/images/logo.png"
              alt="THC Plus"
              width={48}
              height={48}
              className="h-12 w-12 brightness-0 invert opacity-60"
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-gold">
              Will-Call Ordering
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative z-10 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {banner?.titleEn || (
              <>
                Premium Hemp,
                <br />
                <span className="text-gold-gradient">Ready When You Are.</span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative z-10 mt-4 max-w-xl text-base text-zinc-400 sm:text-lg"
          >
            {banner?.bodyEn ||
              "Reserve your favorites online and pick up at your convenience. No payment required until pickup."}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="relative z-10 mt-8"
          >
            <Button asChild size="lg" className="group btn-gold rounded-full px-8 text-base h-12 w-full sm:w-auto">
              <Link href="/products">
                Browse Menu
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {/* 3-Step How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative z-10 mt-14 grid w-full max-w-2xl grid-cols-3 gap-3 sm:gap-8"
          >
            {[
              {
                step: "1",
                icon: Search,
                title: "Browse",
                desc: "Explore our menu",
              },
              {
                step: "2",
                icon: ShoppingCart,
                title: "Reserve",
                desc: "Place your will-call",
              },
              {
                step: "3",
                icon: MapPin,
                title: "Pick Up",
                desc: "Pay when you arrive",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/30 bg-gold-500/10 sm:h-14 sm:w-14">
                  <item.icon className="h-5 w-5 text-gold sm:h-6 sm:w-6" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-[#090F09]">
                    {item.step}
                  </span>
                </div>
                <h2 className="text-sm font-semibold text-white sm:text-base">
                  {item.title}
                </h2>
                <p className="mt-0.5 text-[11px] text-zinc-500 sm:text-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500"
          >
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              No Payment Online
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              Lab Tested Products
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-gold" />
              ID Required at Pickup
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
