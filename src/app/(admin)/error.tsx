"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-950/40 ring-1 ring-red-900/50">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="mb-2 text-lg font-bold text-zinc-100">
          Dashboard Error
        </h2>
        <p className="mb-5 text-sm text-zinc-400">
          Something went wrong loading this section. Try refreshing.
        </p>
        <Button onClick={reset} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </div>
  );
}
