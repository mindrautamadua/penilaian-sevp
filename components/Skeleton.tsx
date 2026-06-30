import { Aurora } from "@/components/Header"

// Primitif skeleton (shimmer via kelas .skeleton di globals.css).
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />
}

// Header tiruan statis (logo asli + placeholder nav) agar tak ada lompatan layout.
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-900/[0.06] bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-[11px] font-bold tracking-tight text-white shadow-soft ring-1 ring-white/10">SEVP</span>
          <div>
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-1.5 h-2.5 w-44" />
          </div>
        </div>
        <div className="hidden items-center gap-1.5 sm:flex">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full" />)}
        </div>
      </div>
    </header>
  )
}

// Kerangka halaman untuk semua loading.tsx.
export function LoadingShell({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <>
      <Aurora />
      <HeaderSkeleton />
      <main className={`mx-auto ${narrow ? "max-w-4xl" : "max-w-6xl"} px-6 py-8`}>{children}</main>
    </>
  )
}

// Hero (eyebrow + judul + subjudul).
export function HeroSkeleton() {
  return (
    <div>
      <Skeleton className="h-6 w-40 rounded-full" />
      <Skeleton className="mt-3 h-9 w-2/3" />
      <Skeleton className="mt-2 h-4 w-1/2" />
    </div>
  )
}

// Grid kartu statistik.
export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  const cols = count === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
  return (
    <div className={`mt-7 grid gap-4 sm:grid-cols-2 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05]">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-20" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

// Baris-baris daftar (kartu) dengan avatar.
export function RowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="grid gap-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 p-4 shadow-card ring-1 ring-slate-900/[0.05]">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full" />
            <div>
              <Skeleton className="h-4 w-44" />
              <Skeleton className="mt-1.5 h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// Tabel besar (header + baris) di dalam panel.
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-3xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] sm:p-6">
      <Skeleton className="h-6 w-48 rounded-full" />
      <Skeleton className="mt-2 h-7 w-64" />
      <div className="mt-5 grid gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-slate-900/[0.05] pb-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-1.5 h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
