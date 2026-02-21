export default function CartLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 h-8 w-32 animate-pulse rounded-lg bg-zinc-800" />

      {/* Cart items skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl border border-emerald-900/20 bg-[#111A11] p-4"
          >
            <div className="h-16 w-16 animate-pulse rounded-lg bg-zinc-800/40" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-800/60" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-800/40" />
            </div>
            <div className="h-5 w-12 animate-pulse rounded bg-zinc-800/60" />
          </div>
        ))}
      </div>

      {/* Summary skeleton */}
      <div className="mt-6 rounded-xl border border-emerald-900/20 bg-[#111A11] p-4">
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-zinc-800/60" />
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-800/60" />
          </div>
          <div className="h-12 w-full animate-pulse rounded-lg bg-emerald-900/30" />
        </div>
      </div>
    </div>
  );
}
