import type { RiwayatRow } from "@/lib/riwayat"

function ratingChip(rating: string | null): string {
  const r = (rating ?? "").toUpperCase()
  if (r.includes("ABOVE")) return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
  if (r.includes("BELOW")) return "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
  if (r.includes("ON")) return "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
  return "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
}

const fmtNilai = (n: number | null) =>
  n == null ? "—" : n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function RiwayatPenilaian({ rows }: { rows: RiwayatRow[] }) {
  if (!rows.length) return null
  const sorted = [...rows].sort((a, b) => a.tahun - b.tahun)

  return (
    <section className="avoid-break mt-7">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Riwayat Penilaian</h2>
        <span className="text-xs text-slate-400">Tahun sebelumnya</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              <th className="py-1.5 pr-3 font-semibold">Tahun</th>
              <th className="py-1.5 pr-3 text-right font-semibold">Nilai</th>
              <th className="py-1.5 pr-3 font-semibold">Rating</th>
              <th className="py-1.5 pr-3 font-semibold">Golongan PhDP</th>
              <th className="py-1.5 font-semibold">Person Grade</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.tahun} className="border-b border-slate-100">
                <td className="py-2 pr-3 data font-bold text-navy">{r.tahun}</td>
                <td className="py-2 pr-3 text-right data font-bold text-navy">{fmtNilai(r.nilai)}</td>
                <td className="py-2 pr-3">
                  {r.rating ? (
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ratingChip(r.rating)}`}>{r.rating}</span>
                  ) : "—"}
                </td>
                <td className="py-2 pr-3 data text-slate-600">{r.golongan ?? "—"}</td>
                <td className="py-2 data text-slate-600">{r.grade ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        Sumber: Rekapitulasi Penilaian Kinerja Region Head &amp; SEVP PTPN Group 2023 &amp; 2024.
      </p>
    </section>
  )
}
