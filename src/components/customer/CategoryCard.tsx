"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Leaf,
  Cookie,
  Wind,
  Droplets,
  Cigarette,
  Pipette,
  Hand,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Leaf,
  Cookie,
  Wind,
  Droplets,
  Cigarette,
  Pipette,
  Hand,
  Wrench,
};

interface CategoryCardProps {
  name: string;
  slug: string;
  icon?: string;
  productCount?: number;
  className?: string;
}

export function CategoryCard({
  name,
  slug,
  icon,
  productCount,
  className,
}: CategoryCardProps) {
  const Icon = icon ? iconMap[icon] || Leaf : Leaf;

  return (
    <Link
      href={`/products/${slug}`}
      className={cn(
        "group flex flex-col items-center gap-3 p-5 rounded-xl",
        "border border-border/50 bg-card hover:bg-accent",
        "transition-all duration-200",
        "hover:border-emerald-500/30 hover:shadow-glow",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        {productCount !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {productCount} products
          </p>
        )}
      </div>
    </Link>
  );
}
