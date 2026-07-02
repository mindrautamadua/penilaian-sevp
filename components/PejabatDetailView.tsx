import Link from "next/link"
import { cookies } from "next/headers"
import { EditSkorForm } from "@/components/EditSkorForm"
import { PenugasanRow } from "@/components/PenugasanRow"
import { ApplyToFinalButton } from "@/components/ApplyToFinalButton"
import { Avatar } from "@/components/Avatar"
import { KpiTable } from "@/components/KpiTable"
import { KpiBreakdownTable } from "@/components/KpiBreakdownTable"
import { RiwayatPenilaian } from "@/components/RiwayatPenilaian"
import { findUser } from "@/lib/auth"
import { getPejabat } from "@/lib/data"
import { lhekForEntitas } from "@/lib/lhek"
import { kpiForEntitas, kpiPejabat } from "@/lib/kpi"
import { photoFor } from "@/lib/photos"
import { fmt } from "@/lib/score"
import { getKategori } from "@/lib/kategori"

// Isi detail pejabat — dipakai oleh halaman penuh (/pejabat/[nama]) DAN modal
// (intercepting route). Self-contained: cukup diberi `nama`. Mengembalikan null
// bila data tidak ada (pemanggil menentukan perlakuan not-found).
export async function PejabatDetailView({ nama }: { nama: string }) {
  const data = await getPejabat(nama)
  if (!data) return null

  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  const canEdit = user?.role === "admin"

  const entitasUtama = data.rekap[0]?.entitas ?? data.assignments[0]?.entitas ?? null
  const entitasAll = [...data.rekap.map((r) => r.entitas), ...data.assignments.map((a) => a.entitas)]
  const [lhekDocs, kpiSets, kpiBreakdown, kategori] = await Promise.all([
    lhekForEntitas(entitasAll),
    kpiForEntitas(entitasAll),
    kpiPejabat(data.nama),
    getKategori(),
  ])

  // Kelompokkan breakdown per (entitas, jabatan) — satu orang bisa menjabat di beberapa entitas.
  const kpiGroups: {
    key: string
    entitas: string | null
    jabatan: string | null
    items: typeof kpiBreakdown
    bulan: number | null      // masa jabatan (dari kertas kerja)
    kontribusi: number | null // skor terbobot bulan = kontribusi ke skor final
  }[] = []
  for (const it of kpiBreakdown) {
    const key = `${it.entitas}__${it.jabatan}`
    let g = kpiGroups.find((x) => x.key === key)
    if (!g) {
      const asg = data.assignments.find((a) => a.entitas === it.entitas && a.jabatan === it.jabatan)
      g = { key, entitas: it.entitas, jabatan: it.jabatan, items: [], bulan: asg?.bulan ?? null, kontribusi: asg?.skor ?? null }
      kpiGroups.push(g)
    }
    g.items.push(it)
  }
  const foto = data.rekap[0]?.foto ?? data.assignments[0]?.foto ?? photoFor(data.nama)
  const komponen = data.assignments.reduce((a, r) => a + (r.skor ?? 0), 0)

  // Kasus sumber-tunggal yang aman: tepat 1 rekap & 1 penugasan → boleh salin skor sementara ke final.
  const single =
    data.rekap.length === 1 && data.assignments.length === 1
      ? { rekap: data.rekap[0], asg: data.assignments[0] }
      : null
  const showApply =
    canEdit && single != null && single.asg.skor != null && single.asg.skor !== single.rekap.skor

  return (
    <>
      {data.excluded && (
        <div className="mb-4 rounded-2xl bg-rose-50/70 px-5 py-3 text-sm font-medium text-rose-700 ring-1 ring-rose-200/70">
          Pejabat ini <strong>dikecualikan</strong> dari penilaian — tidak tampil di Dashboard, Kertas Kerja, maupun Laporan. Atur di menu <span className="font-semibold">Kelola Pejabat</span>.
        </div>
      )}

      <article className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-slate-900/[0.05] print:rounded-none print:p-0 print:shadow-none print:ring-0">
        {/* Kop / identitas */}
        <header className="avoid-break flex items-center gap-5 border-b-2 border-navy pb-5">
          <Avatar src={foto} name={data.nama} size={88} className="shadow-soft" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Penilaian Direktur, RH &amp; SEVP · Tahun Kinerja 2025</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-navy">{data.nama}</h1>
            <p className="mt-1 text-sm text-slate-500">{entitasUtama}</p>
          </div>
        </header>

        {/* Skor final (dari rekap) */}
        <section className="avoid-break mt-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Skor Final</h2>
            {canEdit && <span className="text-[11px] text-slate-400 no-print">Anda dapat menyunting skor</span>}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {data.rekap.length === 0 && (
              <p className="text-sm text-slate-400">Tidak ada entri rekap untuk pejabat ini.</p>
            )}
            {data.rekap.map((r) => (
              <EditSkorForm key={r.id} canEdit={canEdit} kategori={kategori}
                row={{ id: r.id, skor: r.skor, bulan: r.bulan, catatan: r.catatan, jabatan: r.jabatan, status: r.status }} />
            ))}
          </div>
          {showApply && single && (
            <ApplyToFinalButton rekapId={single.rekap.id} skor={single.asg.skor as number}
              bulan={single.asg.bulan} catatan={single.rekap.catatan} currentFinal={single.rekap.skor} />
          )}
        </section>

        {/* Riwayat penilaian tahun sebelumnya */}
        <RiwayatPenilaian rows={data.riwayat} />

        {/* Rincian penugasan (kertas kerja) */}
        <section className="mt-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Rincian Penugasan</h2>
            <span className="text-xs text-slate-400">{data.assignments.length} baris</span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 border-b border-slate-200">
                  <th className="py-1.5 pr-2 font-semibold">Jabatan</th>
                  <th className="py-1.5 pr-2 font-semibold">Unit Penilaian</th>
                  <th className="py-1.5 pr-2 font-semibold">Periode</th>
                  <th className="py-1.5 pr-2 text-right font-semibold">Hari</th>
                  <th className="py-1.5 pr-2 text-right font-semibold">Bln</th>
                  <th className="py-1.5 text-right font-semibold">Skor Sementara</th>
                </tr>
              </thead>
              <tbody>
                {data.assignments.map((r) => (
                  <PenugasanRow key={r.id} canEdit={canEdit} colSpan={6}
                    row={{ id: r.id, jabatan: r.jabatan, entitas: r.entitas, awal: r.awal, akhir: r.akhir, hari: r.hari, bulan: r.bulan, skor: r.skor, keterangan: r.keterangan }} />
                ))}
                {data.assignments.length > 1 && (
                  <tr className="border-t-2 border-slate-200">
                    <td className="py-1.5 pr-2 font-bold text-navy" colSpan={5}>Total komponen skor sementara</td>
                    <td className="py-1.5 text-right data font-extrabold text-navy">{fmt(komponen)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Skor sementara sudah terbobot masa jabatan. Skor final pada rekap memperhitungkan kombinasi penugasan (lihat catatan).
          </p>
        </section>

        {/* Breakdown KPI individu (sesuai jabatan) — bisa >1 bila menjabat di beberapa entitas */}
        {kpiGroups.map((g) => {
          const kpiSetahun = g.items.reduce((a, b) => a + (b.skor ?? 0), 0)
          const terbobot = g.bulan != null && g.bulan < 12 && g.kontribusi != null
          return (
            <section key={g.key} className="mt-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Rincian Skor KPI{kpiGroups.length > 1 ? ` · ${g.entitas}` : ""}
                </h2>
                <span className="text-sm text-slate-500">
                  {g.jabatan ?? g.entitas} · KPI setahun{" "}
                  <span className="data font-bold text-navy">{kpiSetahun.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</span> / 100
                </span>
              </div>

              {terbobot && (
                <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-[12px] text-slate-600 ring-1 ring-slate-900/[0.05]">
                  Masa jabatan <span className="data font-semibold text-navy">{g.bulan} bln</span> → kontribusi skor{" "}
                  <span className="data font-semibold text-navy">{(g.kontribusi as number).toLocaleString("id-ID", { maximumFractionDigits: 2 })}</span>{" "}
                  <span className="text-slate-400">(KPI setahun × {g.bulan}/12)</span>
                </p>
              )}

              <div className="mt-3">
                <KpiBreakdownTable items={g.items} />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Total tabel = KPI penuh setahun untuk jabatan ini. Skor final pejabat = penjumlahan kontribusi tiap masa jabatan (terbobot bulan).
              </p>
            </section>
          )
        })}

        {/* Rekonsiliasi skor final bila ada >1 masa jabatan terbobot */}
        {kpiGroups.filter((g) => g.kontribusi != null).length > 1 && (
          <section className="mt-5 rounded-2xl bg-grad-grape-teal p-5 text-white shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Skor Final = Jumlah Kontribusi</p>
            <div className="mt-2 space-y-1 text-sm">
              {kpiGroups.filter((g) => g.kontribusi != null).map((g) => (
                <div key={g.key} className="flex justify-between gap-3">
                  <span className="text-white/85">{g.entitas} · {g.jabatan} · {g.bulan} bln</span>
                  <span className="data font-semibold">{(g.kontribusi as number).toLocaleString("id-ID", { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between gap-3 border-t border-white/20 pt-2 font-bold">
                <span>Total</span>
                <span className="data">
                  {kpiGroups.reduce((a, g) => a + (g.kontribusi ?? 0), 0).toLocaleString("id-ID", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Referensi LHEK sesuai entitas */}
        {lhekDocs.length > 0 && (
          <section className="mt-7 no-print">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Referensi LHEK</h2>
            <div className="mt-3 grid gap-2">
              {lhekDocs.map((d) => (
                <a key={d.id} href={`/api/lhek/${d.id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl bg-paper px-4 py-3 ring-1 ring-slate-900/[0.06] transition-colors hover:bg-white">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-navy">{d.judul}</span>
                    <span className="block text-[11px] text-slate-500">LHEK {d.tahun} · {d.file_name}</span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-primary">Buka PDF →</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* KPI Kolegial entitas — hanya bila tidak ada breakdown individu */}
        {kpiBreakdown.length === 0 && kpiSets.map(({ set, items }) => {
          const totalSkor = items.reduce((a, b) => a + (b.skor ?? 0), 0)
          return (
            <section key={set.id} className="mt-7">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">KPI Kolegial {set.tahun}</h2>
                <span className="text-sm text-slate-500">
                  Total skor <span className="data font-bold text-navy">{totalSkor.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</span> / 100
                  <Link href={`/lhek/kpi/${set.id}`} className="ml-3 font-semibold text-primary hover:underline no-print">Detail →</Link>
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">{set.judul}</p>
              <div className="mt-3">
                <KpiTable items={items} />
              </div>
            </section>
          )
        })}
      </article>
    </>
  )
}
