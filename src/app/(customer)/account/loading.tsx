export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Profile card skeleton */}
      <div className="mb-6 rounded-xl border border-emerald-900/20 bg-[#111A11] p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-800/60" />
          <div className="space-y-2">
            <div className="h-5 w-32 animate-pulse rounded bg-zinc-800/60" />
            <div className="h-3 w-40 animate-pulse rounded bg-zinc-800/40" />
          </div>
        </div>
      </div>

      {/* Loyalty card skeleton */}
      <div className="mb-6 rounded-xl border border-emerald-900/20 bg-[#111A11] p-6">
        <div className="space-y-3">
          <div className="h-5 w-24 animate-pulse rounded bg-zinc-800/60" />
          <div className="h-3 w-full animate-pulse rounded-full bg-zinc-800/30" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-800/40" />
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
              <div className="h-5 w-5 animate-pulse rounded bg-zinc-800/40" />
              <div className="h-4 w-24 animate-pulse rounded bg-zinc-800/60" />
            </div>
            <div className="h-4 w-4 animate-pulse rounded bg-zinc-800/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
