import { LoadingShell, Skeleton } from "@/components/Skeleton"

export default function Loading() {
  return (
    <LoadingShell narrow>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-40 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-slate-900/[0.05]">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        <div className="mt-7 grid gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
        </div>
      </div>
    </LoadingShell>
  )
}
