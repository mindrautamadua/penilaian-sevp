import Link from "next/link"
import { Header, Aurora } from "@/components/Header"
import { PrintButton } from "@/components/PrintButton"
import { getRekap, summarize, indukOf, type RekapRow } from "@/lib/data"
import { band, fmt } from "@/lib/score"

export const dynamic = "force-dynamic"

export default async function LaporanPage() {
  const rows = await getRekap()
  const s = summarize(rows)

  // kelompokkan per entitas (urut entitas, lalu skor tertinggi)
  const byEntitas = new Map<string, RekapRow[]>()
  for (const r of [...rows].sort((a, b) => (b.skor ?? -Infinity) - (a.skor ?? -Infinity))) {
    const k = r.entitas ?? "Lainnya"
    if (!byEntitas.has(k)) byEntitas.set(k, [])
    byEntitas.get(k)!.push(r)
  }
  const grup = Array.from(byEntitas.entries()).sort((a, b) => a[0].localeCompare(b[0], "id"))

  return (
    <>
      <Aurora />
      <Header active="/laporan" />

      <main className="report-shell mx-auto max-w-4xl px-6 py-8">
        {/* Toolbar (tidak ikut tercetak) */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow bg-primary/10 text-primary">Laporan Cetak</span>
            <p className="mt-2 text-sm text-slate-500">Format A4 · siap diunduh sebagai PDF (Save as PDF di dialog cetak).</p>
          </div>
          <PrintButton />
        </div>

        {/* ── Dokumen laporan ── */}
        <article className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-slate-900/[0.05] print:rounded-none print:p-0 print:shadow-none print:ring-0">
          {/* Kop */}
          <header className="avoid-break border-b-2 border-navy pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">PTPN Group · Tahun Kinerja 2025</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy">Laporan Penilaian Region Head &amp; SEVP</h1>
                <p className="mt-1 text-sm text-slate-500">Rekapitulasi skor kinerja — satu skor per pejabat (terbobot masa jabatan)</p>
              </div>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy text-xs font-bold text-white">SEVP</span>
            </div>
          </header>

          {/* Ringkasan */}
          <section className="avoid-break mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Ringkasan</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Total Pejabat" value={String(s.total)} sub={`${s.pkwt} PKWT · ${s.pkwtt} PKWTT`} />
              <Stat label="Sudah Dinilai" value={String(s.dinilai)} sub={`${s.belum} belum`} />
              <Stat label="Rata-rata Skor" value={fmt(s.rataRata)} />
              <Stat label="Jumlah Entitas" value={String(s.entitas)} />
            </div>
          </section>

          {/* Tabel per entitas */}
          <section className="mt-7">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Rincian per Entitas</h2>
            {grup.map(([entitas, list]) => (
              <div key={entitas} className="avoid-break mt-5">
                <div className="flex items-baseline justify-between border-b border-slate-200 pb-1.5">
                  <h3 className="text-sm font-bold text-navy">{entitas}</h3>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">{indukOf(entitas)}</span>
                </div>
                <table className="mt-2 w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      <th className="py-1.5 pr-2 font-semibold">Nama</th>
                      <th className="py-1.5 pr-2 font-semibold">Jabatan</th>
                      <th className="py-1.5 pr-2 font-semibold">Status</th>
                      <th className="py-1.5 pr-2 text-right font-semibold">Bln</th>
                      <th className="py-1.5 pr-2 text-right font-semibold">Skor</th>
                      <th className="py-1.5 font-semibold">Kategori</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r, i) => {
                      const b = band(r.skor)
                      return (
                        <tr key={`${r.no}-${i}`} className="border-t border-slate-100">
                          <td className="py-1.5 pr-2 font-semibold text-navy">{r.nama}</td>
                          <td className="py-1.5 pr-2 text-slate-600">{r.jabatan}</td>
                          <td className="py-1.5 pr-2 text-slate-500">{r.status}</td>
                          <td className="py-1.5 pr-2 text-right data text-slate-600">{r.bulan ?? "—"}</td>
                          <td className="py-1.5 pr-2 text-right data font-bold text-navy">{fmt(r.skor)}</td>
                          <td className="py-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                              <span className={`h-2 w-2 rounded-full ${b.dot}`} />{b.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </section>

          <footer className="avoid-break mt-8 border-t border-slate-200 pt-3 text-[11px] text-slate-400">
            Sumber: tab “Kertas Kerja” — Penilaian Kinerja PTPN Group 2025. Kategori: Istimewa ≥90 · Sangat Baik ≥80 · Baik ≥70 · Cukup ≥60 · Perlu Perhatian &lt;60.
          </footer>
        </article>

        <p className="no-print mt-6 text-center text-sm text-slate-400">
          <Link href="/" className="font-medium text-primary hover:underline">← Kembali ke Dashboard</Link>
        </p>
      </main>
    </>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-paper p-3 ring-1 ring-slate-900/[0.05]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="data mt-1 text-xl font-extrabold text-navy">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  )
}
