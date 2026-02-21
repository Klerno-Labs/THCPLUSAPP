"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: { icon: "w-8 h-8", text: "text-lg" },
  md: { icon: "w-10 h-10", text: "text-xl" },
  lg: { icon: "w-14 h-14", text: "text-2xl" },
  xl: { icon: "w-20 h-20", text: "text-4xl" },
};

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Cannabis leaf cross icon — matching shopthcplus.com cross2.png branding */}
      <div
        className={cn(
          s.icon,
          "relative flex items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-glow"
        )}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3/4 h-3/4"
        >
          {/* Stylized THC+ cross */}
          <rect x="16" y="4" width="8" height="32" rx="2" fill="white" />
          <rect x="4" y="16" width="32" height="8" rx="2" fill="white" />
          {/* Leaf accent */}
          <circle cx="20" cy="20" r="4" fill="rgba(16,185,129,0.6)" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              s.text,
              "font-extrabold tracking-tight text-foreground leading-none"
            )}
          >
            THC{" "}
            <span className="text-emerald-500">Plus</span>
          </span>
          {size !== "sm" && (
            <span className="text-2xs uppercase tracking-widest text-muted-foreground">
              Premium Hemp Products
            </span>
          )}
        </div>
      )}
    </div>
  );
}
