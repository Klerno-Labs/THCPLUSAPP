import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-sm text-zinc-500">Loading dashboard...</p>
      </div>
    </div>
  );
}
