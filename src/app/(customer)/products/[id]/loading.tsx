export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 skeleton rounded" />
        <div className="h-4 w-4 skeleton rounded" />
        <div className="h-4 w-24 skeleton rounded" />
        <div className="h-4 w-4 skeleton rounded" />
        <div className="h-4 w-32 skeleton rounded" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product image skeleton */}
        <div className="space-y-3">
          <div className="aspect-square w-full skeleton rounded-2xl" />
          {/* Thumbnail row */}
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-16 skeleton rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-6">
          {/* Category badge */}
          <div className="h-6 w-20 skeleton rounded-full" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-3/4 skeleton rounded" />
            <div className="h-5 w-1/2 skeleton rounded" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 w-5 skeleton rounded" />
              ))}
            </div>
            <div className="h-4 w-20 skeleton rounded" />
          </div>

          {/* Price */}
          <div className="h-10 w-24 skeleton rounded" />

          {/* THC / strain info */}
          <div className="flex gap-3">
            <div className="h-8 w-28 skeleton rounded-lg" />
            <div className="h-8 w-28 skeleton rounded-lg" />
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full skeleton rounded" />
            <div className="h-4 w-full skeleton rounded" />
            <div className="h-4 w-5/6 skeleton rounded" />
            <div className="h-4 w-2/3 skeleton rounded" />
          </div>

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 pt-4">
            <div className="h-12 w-32 skeleton rounded-lg" />
            <div className="h-12 flex-1 skeleton rounded-lg" />
          </div>
        </div>
      </div>

      {/* Reviews section skeleton */}
      <div className="mt-12 space-y-4">
        <div className="h-7 w-32 skeleton rounded" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-emerald-900/20 bg-[#111A11] p-5 space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 skeleton rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 w-24 skeleton rounded" />
                  <div className="h-3 w-16 skeleton rounded" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-full skeleton rounded" />
                <div className="h-3 w-3/4 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
