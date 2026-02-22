export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="h-4 w-64 skeleton rounded" />
      </div>

      {/* KPI stat cards skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-emerald-900/20 bg-[#111A11] p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 skeleton rounded" />
              <div className="h-8 w-8 skeleton rounded-lg" />
            </div>
            <div className="h-8 w-20 skeleton rounded" />
            <div className="h-3 w-16 skeleton rounded" />
          </div>
        ))}
      </div>

      {/* Orders table skeleton */}
      <div className="rounded-xl border border-emerald-900/20 bg-[#111A11]">
        {/* Table header */}
        <div className="border-b border-emerald-900/20 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 skeleton rounded" />
            <div className="flex gap-2">
              <div className="h-9 w-28 skeleton rounded-lg" />
              <div className="h-9 w-28 skeleton rounded-lg" />
            </div>
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-emerald-900/20">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-4 w-24 skeleton rounded" />
              <div className="h-4 w-32 skeleton rounded" />
              <div className="hidden h-4 w-20 skeleton rounded sm:block" />
              <div className="hidden h-4 w-16 skeleton rounded md:block" />
              <div className="h-6 w-20 skeleton rounded-full ml-auto" />
              <div className="h-8 w-8 skeleton rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
