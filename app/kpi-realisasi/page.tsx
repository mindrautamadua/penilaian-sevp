import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Header, Aurora } from "@/components/Header"
import { KpiRealisasiManager } from "@/components/KpiRealisasiManager"
import { findUser } from "@/lib/auth"
import { kpiRealisasiRows } from "@/lib/kpi"

export const dynamic = "force-dynamic"

export default async function KpiRealisasiPage() {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  if (!user || user.role !== "admin") redirect("/")

  const rows = await kpiRealisasiRows()
  const entitasList = Array.from(new Set(rows.map((r) => r.entitas))).sort()
  const total = rows.length
  const terisi = rows.filter((r) => r.realisasi != null && r.realisasi !== "").length

  return (
    <>
      <Aurora />
      <Header active="/kpi-realisasi" />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="anim-rise">
          <span className="eyebrow bg-grad-teal text-white shadow-soft">Admin</span>
          <h1 className="h-display mt-3 text-3xl sm:text-4xl">Rincian Realisasi Capaian KPI</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Kelola nilai <strong>realisasi</strong> &amp; <strong>% capaian</strong> tiap indikator KPI per entitas.
            Perubahan berlaku untuk semua pejabat pada entitas tersebut dan langsung tampil di halaman detail pejabat.
          </p>
        </div>

        <div className="anim-rise-1 mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Entitas</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-navy">{entitasList.length}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total Indikator</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-navy">{total}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Realisasi Terisi</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-emerald-600">{terisi}</p>
          </div>
        </div>

        <div className="anim-rise-2 mt-8">
          <KpiRealisasiManager rows={rows} entitasList={entitasList} />
        </div>
      </main>
    </>
  )
}
