import { cookies } from "next/headers"
import { Header, Aurora } from "@/components/Header"
import { RekapSection } from "@/components/RekapSection"
import { Avatar } from "@/components/Avatar"
import { getRekap, summarize, indukOf, type RekapRow } from "@/lib/data"
import { getKategori } from "@/lib/kategori"
import { findUser } from "@/lib/auth"
import { band, fmt, type Kategori } from "@/lib/score"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const [rows, kategori, user] = await Promise.all([
    getRekap(),
    getKategori(),
    findUser((await cookies()).get("sevp_auth")?.value),
  ])
  const canEdit = user?.role === "admin"
  const s = summarize(rows)

  const entitasList = Array.from(new Set(rows.map((r) => r.entitas).filter(Boolean))).sort() as string[]

  // ringkasan per induk
  const grup = new Map<string, RekapRow[]>()
  for (const r of rows) {
    const k = indukOf(r.entitas)
    if (!grup.has(k)) grup.set(k, [])
    grup.get(k)!.push(r)
  }
  const induk = Array.from(grup.entries()).map(([nama, rs]) => {
    const dinilai = rs.filter((r) => r.skor != null)
    const avg = dinilai.length ? dinilai.reduce((a, b) => a + (b.skor as number), 0) / dinilai.length : null
    return { nama, jumlah: rs.length, dinilai: dinilai.length, avg }
  })

  return (
    <>
      <Aurora />
      <Header active="/" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Hero */}
        <div className="anim-rise">
          <span className="eyebrow bg-grad-teal text-white shadow-soft">Tahun Kinerja 2025</span>
          <h1 className="h-display mt-3 text-3xl sm:text-4xl">Penilaian Region Head &amp; SEVP</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Rekapitulasi skor kinerja PTPN Group berdasarkan kertas kerja penilaian — terbobot masa jabatan,
            disajikan satu skor per pejabat.
          </p>
        </div>

        {/* Statistik + Rekap interaktif (klik kartu untuk memfilter) */}
        <RekapSection rows={rows} summary={s} entitasList={entitasList} kategori={kategori} canEdit={canEdit}>
          {/* Tertinggi / Terendah */}
          {s.tertinggi && s.terendah && (
            <div className="anim-rise-1 mt-4 grid gap-4 sm:grid-cols-2">
              <HighlightCard label="Skor Tertinggi" row={s.tertinggi} kategori={kategori} />
              <HighlightCard label="Skor Terendah" row={s.terendah} kategori={kategori} />
            </div>
          )}

          {/* Ringkasan per induk */}
          <div className="anim-rise-2 mt-8">
            <span className="eyebrow bg-primary/10 text-primary">Per Kelompok Induk</span>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {induk.map((g) => (
                <div key={g.nama} className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
                  <p className="text-sm font-bold text-navy">{g.nama}</p>
                  <p className="mt-1 text-xs text-slate-500">{g.jumlah} pejabat · {g.dinilai} dinilai</p>
                  <p className="data mt-3 text-2xl font-extrabold text-navy">{fmt(g.avg)}<span className="ml-1 text-xs font-medium text-slate-400">rata-rata</span></p>
                </div>
              ))}
            </div>
          </div>
        </RekapSection>

        <p className="mt-8 text-center text-xs text-slate-400">
          Sumber: tab “Kertas Kerja” — Penilaian Kinerja PTPN Group 2025 · Database <span className="data">penilaian_sevp</span>
        </p>
      </main>
    </>
  )
}

function HighlightCard({ label, row, kategori }: { label: string; row: RekapRow; kategori: Kategori[] }) {
  const b = band(row.skor, kategori)
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={row.foto} name={row.nama} size={48} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-1 truncate font-bold text-navy">{row.nama}</p>
          <p className="truncate text-xs text-slate-500">{row.jabatan} · {row.entitas}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="data text-2xl font-extrabold text-navy">{fmt(row.skor)}</p>
        <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${b.chip}`}>{b.label}</span>
      </div>
    </div>
  )
}
