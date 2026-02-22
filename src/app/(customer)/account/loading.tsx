export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Profile card skeleton */}
      <div className="mb-6 rounded-xl border border-emerald-900/20 bg-[#111A11] p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 skeleton rounded-full" />
          <div className="space-y-2">
            <div className="h-5 w-32 skeleton rounded" />
            <div className="h-3 w-40 skeleton rounded" />
          </div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-emerald-900/20 bg-[#111A11] p-4 text-center"
          >
            <div className="mx-auto h-8 w-12 skeleton rounded mb-2" />
            <div className="mx-auto h-3 w-16 skeleton rounded" />
          </div>
        ))}
      </div>

      {/* Loyalty card skeleton */}
      <div className="mb-6 rounded-xl border border-emerald-900/20 bg-[#111A11] p-6">
        <div className="space-y-3">
          <div className="h-5 w-24 skeleton rounded" />
          <div className="h-3 w-full skeleton rounded-full" />
          <div className="h-4 w-20 skeleton rounded" />
        </div>
      </div>

      {/* Recent orders skeleton */}
      <div className="mb-4">
        <div className="h-6 w-32 skeleton rounded mb-3" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-emerald-900/20 bg-[#111A11] p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 skeleton rounded" />
                <div className="h-6 w-20 skeleton rounded-full" />
              </div>
              <div className="h-3 w-3/4 skeleton rounded" />
              <div className="h-3 w-1/2 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Menu items skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-emerald-900/20 bg-[#111A11] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 skeleton rounded" />
              <div className="h-4 w-24 skeleton rounded" />
            </div>
            <div className="h-4 w-4 skeleton rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
