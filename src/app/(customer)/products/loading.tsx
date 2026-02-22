export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="mt-2 h-4 w-64 skeleton rounded" />
      </div>

      {/* Category filter skeleton */}
      <div className="mb-6 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 skeleton rounded-full" />
        ))}
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-emerald-900/20 bg-[#111A11]"
          >
            <div className="aspect-square skeleton" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 skeleton rounded" />
              <div className="h-3 w-1/2 skeleton rounded" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-5 w-16 skeleton rounded" />
                <div className="h-8 w-20 skeleton rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
