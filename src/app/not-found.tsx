import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090F09] p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-800/30 bg-emerald-950/20">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="mb-2 text-3xl font-bold text-white">404</h1>
      <p className="mb-1 text-lg font-medium text-zinc-300">Page Not Found</p>
      <p className="mb-8 max-w-sm text-sm text-zinc-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          Go Home
        </Link>
        <Link
          href="/products"
          className="rounded-xl border border-zinc-700/50 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-[#111A11]"
        >
          Browse Menu
        </Link>
      </div>
    </div>
  );
}
