"use client";

import Link from "next/link";
import {
  Flower2,
  Cookie,
  Droplets,
  Pill,
  Cannabis,
  Package,
  Beaker,
  Cigarette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FadeIn from "./FadeIn";

const iconMap: Record<string, React.ReactNode> = {
  flower: <Flower2 className="h-6 w-6" />,
  edibles: <Cookie className="h-6 w-6" />,
  tinctures: <Droplets className="h-6 w-6" />,
  capsules: <Pill className="h-6 w-6" />,
  concentrates: <Beaker className="h-6 w-6" />,
  prerolls: <Cigarette className="h-6 w-6" />,
  vapes: <Cannabis className="h-6 w-6" />,
  default: <Package className="h-6 w-6" />,
};

interface CategoryItem {
  id: string;
  nameEn: string;
  slug: string;
  icon?: string | null;
  _count?: {
    products: number;
  };
}

interface CategoryGridProps {
  categories: CategoryItem[];
}

const gradients = [
  "from-emerald-600/20 to-emerald-900/10",
  "from-purple-600/20 to-purple-900/10",
  "from-amber-600/20 to-amber-900/10",
  "from-blue-600/20 to-blue-900/10",
  "from-rose-600/20 to-rose-900/10",
  "from-teal-600/20 to-teal-900/10",
  "from-orange-600/20 to-orange-900/10",
  "from-indigo-600/20 to-indigo-900/10",
];

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <FadeIn delay={0.1}>
      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Find exactly what you are looking for
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {categories.map((category, i) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className={cn(
                  "group flex flex-col items-center gap-3 rounded-xl border border-emerald-900/30 p-5 transition-all duration-200",
                  "bg-gradient-to-br",
                  gradients[i % gradients.length],
                  "hover:border-emerald-700/40 hover:shadow-glow"
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111A11] text-emerald-400 transition-colors group-hover:bg-emerald-900/40 group-hover:text-emerald-300">
                  {iconMap[category.icon?.toLowerCase() || "default"] ||
                    iconMap.default}
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-semibold text-white">
                    {category.nameEn}
                  </h3>
                  {category._count?.products != null && (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {category._count.products} product
                      {category._count.products !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
