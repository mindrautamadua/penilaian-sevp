import { Skeleton } from "@/components/Skeleton"

// Kerangka isi detail pejabat — dipakai sebagai fallback Suspense di modal
// (dan bisa dipakai ulang di halaman penuh). Bentuknya menyerupai kartu artikel
// agar tak ada lompatan saat konten asli tiba.
export function PejabatDetailSkeleton() {
  return (
    <article className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-slate-900/[0.05]">
      {/* Kop / identitas */}
      <header className="flex items-center gap-5 border-b-2 border-navy/10 pb-5">
        <Skeleton className="h-[88px] w-[88px] rounded-full" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-52" />
          <Skeleton className="mt-2 h-7 w-2/3" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
      </header>

      {/* Skor final */}
      <div className="mt-6">
        <Skeleton className="h-3 w-24" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-paper p-5 ring-1 ring-slate-900/[0.05]">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-9 w-32" />
            <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
            <Skeleton className="mt-3 h-4 w-40" />
          </div>
        </div>
      </div>

      {/* Rincian penugasan */}
      <div className="mt-7">
        <Skeleton className="h-3 w-36" />
        <div className="mt-4 grid gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-slate-900/[0.05] pb-2.5">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Rincian KPI */}
      <div className="mt-7">
        <Skeleton className="h-3 w-40" />
        <div className="mt-4 grid gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}
