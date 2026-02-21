"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customer page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/40 ring-1 ring-red-900/50">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-zinc-100">
          Oops! Something went wrong
        </h2>
        <p className="mb-5 text-sm text-zinc-400">
          We hit a snag loading this page. Give it another try.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </Button>
          <Button asChild size="sm">
            <a href="/" className="gap-2">
              <Home className="h-3.5 w-3.5" />
              Home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
