import { notFound } from "next/navigation"
import { Header, Aurora } from "@/components/Header"
import { PrintButton } from "@/components/PrintButton"
import { BackButton } from "@/components/BackButton"
import { PejabatDetailView } from "@/components/PejabatDetailView"
import { getPejabat } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function PejabatPage({ params }: { params: Promise<{ nama: string }> }) {
  const { nama } = await params
  const decoded = decodeURIComponent(nama)
  // Not-found ditangani di halaman penuh (buka langsung / refresh).
  if (!(await getPejabat(decoded))) notFound()

  return (
    <>
      <Aurora />
      <Header />
      <main className="report-shell mx-auto max-w-4xl px-6 py-8">
        <div className="no-print mb-5 flex items-center justify-between gap-3">
          <BackButton className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy hover:shadow-card" />
          <PrintButton label="Unduh PDF" />
        </div>
        <PejabatDetailView nama={decoded} />
      </main>
    </>
  )
}
