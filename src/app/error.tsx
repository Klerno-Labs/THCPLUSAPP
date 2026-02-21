"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/40 ring-1 ring-red-900/50">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-zinc-100">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          An unexpected error occurred. Please try again or return to the home page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild>
            <a href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
