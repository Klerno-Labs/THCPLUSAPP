export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-800" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-800/60" />
      </div>

      {/* Category filter skeleton */}
      <div className="mb-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-zinc-800/50" />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-emerald-900/20 bg-[#111A11]"
          >
            <div className="aspect-square animate-pulse bg-zinc-800/40" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-800/60" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800/40" />
              <div className="h-5 w-16 animate-pulse rounded bg-zinc-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
