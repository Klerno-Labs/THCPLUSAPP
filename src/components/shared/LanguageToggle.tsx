"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_KEY = "thcplus-lang";

export function LanguageToggle({ className }: { className?: string }) {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) setLang(saved);
  }, []);

  const toggle = () => {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
    // In production, this would trigger next-intl locale change
    window.location.reload();
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-medium",
        "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
        "transition-colors duration-200",
        className
      )}
      aria-label={`Switch to ${lang === "en" ? "Spanish" : "English"}`}
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase text-xs font-bold">{lang === "en" ? "ES" : "EN"}</span>
    </button>
  );
}
