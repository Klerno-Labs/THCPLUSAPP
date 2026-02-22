"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090F09] text-[#EBF0EB] font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-800/30 bg-red-950/20">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            Something went wrong
          </h1>
          <p className="mb-6 max-w-md text-sm text-zinc-400">
            An unexpected error occurred. Please try again or contact support if
            the problem persists.
          </p>
          <button
            onClick={reset}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
