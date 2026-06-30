import { LoadingShell, Skeleton } from "@/components/Skeleton"

export default function Loading() {
  return (
    <LoadingShell narrow>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-slate-900/[0.05]">
        {/* Kop identitas */}
        <div className="flex items-center gap-5 border-b-2 border-navy/10 pb-5">
          <Skeleton className="h-[88px] w-[88px] rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-2 h-7 w-1/2" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </div>
        </div>
        {/* Skor final */}
        <Skeleton className="mt-6 h-4 w-28" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
        {/* Rincian penugasan */}
        <Skeleton className="mt-7 h-4 w-40" />
        <div className="mt-3 grid gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      </div>
    </LoadingShell>
  )
}
