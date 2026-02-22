"use client";

import { useState, useCallback } from "react";
import { Share2, Check, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export default function ShareButton({
  title,
  text,
  url,
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    // Try native Web Share API first (mobile / supported browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err: any) {
        // User cancelled or share failed — fall through to clipboard
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort — select a temporary input
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [title, text, url]);

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        aria-label={copied ? "Link copied" : "Share"}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full border transition-all",
          copied
            ? "border-emerald-500/50 bg-emerald-950/40 text-emerald-400"
            : "border-zinc-700/40 bg-zinc-900/40 text-zinc-400 hover:border-emerald-700/40 hover:text-emerald-400",
          className
        )}
      >
        {copied ? (
          <Check className="h-5 w-5" />
        ) : (
          <Share2 className="h-5 w-5" />
        )}
      </button>

      {/* Copied toast */}
      {copied && (
        <div className="absolute -bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-emerald-800/40 bg-[#111A11] px-3 py-1.5 text-xs font-medium text-emerald-400 shadow-lg">
          <div className="flex items-center gap-1.5">
            <LinkIcon className="h-3 w-3" />
            Link copied!
          </div>
        </div>
      )}
    </div>
  );
}
