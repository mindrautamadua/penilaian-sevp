import Link from "next/link"
import { cookies } from "next/headers"
import { Header, Aurora } from "@/components/Header"
import { LhekUploadForm } from "@/components/LhekUploadForm"
import { LhekDocCard } from "@/components/LhekDocCard"
import { KpiSetForm } from "@/components/KpiSetForm"
import { deleteKpiSet } from "@/app/actions"
import { findUser } from "@/lib/auth"
import { getRekap } from "@/lib/data"
import { listLhek } from "@/lib/lhek"
import { listKpiSets } from "@/lib/kpi"

export const dynamic = "force-dynamic"

export default async function LhekPage() {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  const canEdit = user?.role === "admin"
  const [rows, docs, kpiSets] = await Promise.all([getRekap(), listLhek(), listKpiSets()])
  const entitasList = Array.from(new Set(rows.map((r) => r.entitas).filter(Boolean))).sort() as string[]

  // Cakupan: entitas mana yang sudah punya LHEK vs belum.
  const covered = new Set(docs.flatMap((d) => d.entitas))
  const belum = entitasList.filter((e) => !covered.has(e))
  const sudah = entitasList.length - belum.length

  return (
    <>
      <Aurora />
      <Header active="/lhek" />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="anim-rise">
          <span className="eyebrow bg-grad-teal text-white shadow-soft">Referensi</span>
          <h1 className="h-display mt-3 text-3xl sm:text-4xl">Dokumen LHEK</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Laporan Hasil Evaluasi Kinerja per unit penilaian — menjadi referensi penilaian Direktur &amp; SEVP. Regional
            mengacu pada LHEK PTPN induknya. Tautan dokumen muncul otomatis di halaman pejabat sesuai unitnya.
          </p>
        </div>

        {/* Ringkasan cakupan entitas */}
        <div className="anim-rise-1 mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total Unit Penilaian</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-navy">{entitasList.length}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Sudah Ada LHEK</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-emerald-600">{sudah}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Belum Ada LHEK</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-rose-600">{belum.length}</p>
          </div>
        </div>

        {belum.length > 0 && (
          <div className="anim-rise-1 mt-4 rounded-2xl bg-rose-50/70 p-5 ring-1 ring-rose-200/70">
            <p className="text-sm font-semibold text-rose-700">{belum.length} unit penilaian belum memiliki dokumen LHEK:</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {belum.map((e) => (
                <span key={e} className="inline-flex rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200">{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* KPI Kolegial */}
        <div className="anim-rise-2 mt-8">
          <h2 className="text-lg font-bold tracking-tight text-navy">KPI Kolegial <span className="data text-sm font-medium text-slate-400">({kpiSets.length})</span></h2>
          <p className="mt-1 text-sm text-slate-500">Skor KPI per unit penilaian — tampil tanpa membuka dokumen.</p>

          <div className="mt-3 grid gap-3">
            {kpiSets.map((s) => (
              <div key={s.id} className="rounded-2xl bg-white/90 p-4 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/lhek/kpi/${s.id}`} className="font-bold text-navy hover:text-primary hover:underline">{s.judul}</Link>
                    <p className="mt-0.5 text-xs text-slate-500"><span className="data">{s.tahun}</span> · {s.jumlah} indikator</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {s.entitas.map((e) => (
                        <span key={e} className="inline-flex rounded-md bg-primary/[0.08] px-2 py-0.5 text-[11px] font-semibold text-primary">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Skor</p>
                      <p className="data text-2xl font-extrabold text-navy">{s.total_skor.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</p>
                    </div>
                    <Link href={`/lhek/kpi/${s.id}`} className="inline-flex min-h-[36px] items-center rounded-full bg-navy px-4 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98]">Lihat</Link>
                    {canEdit && (
                      <form action={deleteKpiSet}>
                        <input type="hidden" name="id" value={s.id} />
                        <button type="submit" className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full bg-white px-3.5 text-sm font-medium text-rose-600 shadow-soft ring-1 ring-rose-200 transition-all hover:bg-rose-50 active:scale-[0.98]">Hapus</button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {kpiSets.length === 0 && (
              <p className="rounded-2xl bg-white/70 px-4 py-10 text-center text-sm text-slate-400 ring-1 ring-slate-900/[0.05]">Belum ada KPI.</p>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="anim-rise-2 mt-8">
            <LhekUploadForm entitasList={entitasList} />
          </div>
        )}

        {canEdit && (
          <div className="anim-rise-2 mt-4">
            <KpiSetForm entitasList={entitasList} />
          </div>
        )}

        <div className="anim-rise-2 mt-8">
          <h2 className="text-lg font-bold tracking-tight text-navy">Daftar Dokumen <span className="data text-sm font-medium text-slate-400">({docs.length})</span></h2>
          <div className="mt-3 grid gap-3">
            {docs.map((d) => (
              <LhekDocCard key={d.id} canEdit={canEdit}
                doc={{ id: d.id, judul: d.judul, tahun: d.tahun, file_name: d.file_name, size_bytes: d.size_bytes, entitas: d.entitas }} />
            ))}
            {docs.length === 0 && (
              <p className="rounded-2xl bg-white/70 px-4 py-10 text-center text-sm text-slate-400 ring-1 ring-slate-900/[0.05]">
                Belum ada dokumen LHEK.{canEdit ? " Unggah lewat formulir di atas." : ""}
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
