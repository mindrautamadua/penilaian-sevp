import Link from "next/link"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Header, Aurora } from "@/components/Header"
import { KpiTable } from "@/components/KpiTable"
import { findUser } from "@/lib/auth"
import { getKpiSet } from "@/lib/kpi"

export const dynamic = "force-dynamic"

export default async function KpiSetPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  const data = await getKpiSet(id)
  if (!data) notFound()

  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  const canEdit = user?.role === "admin"
  const totalSkor = data.items.reduce((a, b) => a + (b.skor ?? 0), 0)

  return (
    <>
      <Aurora />
      <Header active="/lhek" />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="no-print mb-5">
          <Link href="/lhek" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy hover:shadow-card">← Daftar LHEK</Link>
        </div>

        <div className="anim-rise flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="eyebrow bg-grad-teal text-white shadow-soft">KPI Kolegial</span>
            <h1 className="h-display mt-3 text-2xl sm:text-3xl">{data.set.judul}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.set.entitas.map((e) => (
                <span key={e} className="inline-flex rounded-md bg-primary/[0.08] px-2 py-0.5 text-[11px] font-semibold text-primary">{e}</span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total Skor {data.set.tahun}</p>
            <p className="data text-4xl font-extrabold tracking-tightest text-navy">{totalSkor.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</p>
            {canEdit && (
              <Link href={`/lhek/kpi/${id}/edit`} className="mt-2 inline-flex rounded-full bg-navy px-4 py-1.5 text-xs font-semibold text-white shadow-soft transition-all hover:bg-primary no-print">Edit KPI</Link>
            )}
          </div>
        </div>

        <div className="anim-rise-1 mt-7 rounded-3xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm sm:p-6">
          {data.items.length > 0 ? (
            <KpiTable items={data.items} />
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">Belum ada item KPI.{canEdit ? " Klik “Edit KPI” untuk menambah." : ""}</p>
          )}
        </div>
      </main>
    </>
  )
}
