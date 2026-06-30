import { Fragment } from "react"
import type { KpiPejabatItem } from "@/lib/kpi"

const fmtNum = (n: number | null) =>
  n == null ? "—" : n.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })

// Breakdown KPI individu: per indikator dengan bobot, % capaian, dan skor — total = skor final.
export function KpiBreakdownTable({ items }: { items: KpiPejabatItem[] }) {
  const totalBobot = items.reduce((a, b) => a + (b.bobot ?? 0), 0)
  const totalSkor = items.reduce((a, b) => a + (b.skor ?? 0), 0)

  const groups: { perspektif: string; rows: KpiPejabatItem[] }[] = []
  for (const it of items) {
    const p = it.perspektif ?? "Lainnya"
    let g = groups[groups.length - 1]
    if (!g || g.perspektif !== p) {
      g = { perspektif: p, rows: [] }
      groups.push(g)
    }
    g.rows.push(it)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-[12px]">
        <colgroup>
          <col />
          <col className="w-[58px]" />
          <col className="w-[90px]" />
          <col className="w-[90px]" />
          <col className="w-[48px]" />
          <col className="w-[64px]" />
          <col className="w-[52px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-slate-900/[0.08] text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            <th className="py-2 pr-2 font-semibold">Indikator</th>
            <th className="py-2 pr-2 font-semibold">Satuan</th>
            <th className="py-2 pr-2 text-right font-semibold">Target</th>
            <th className="py-2 pr-2 text-right font-semibold">Realisasi</th>
            <th className="py-2 pr-2 text-right font-semibold">Bobot</th>
            <th className="py-2 pr-2 text-right font-semibold">%&nbsp;Capaian</th>
            <th className="py-2 text-right font-semibold">Skor</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <Fragment key={g.perspektif}>
              <tr className="bg-paper/70">
                <td colSpan={7} className="py-1.5 pr-2 text-[11px] font-bold uppercase tracking-wide text-primary">{g.perspektif}</td>
              </tr>
              {g.rows.map((it) => (
                <tr key={it.id} className="border-b border-slate-900/[0.05] align-top">
                  <td className="py-2 pr-2 font-medium text-navy">{it.indikator}</td>
                  <td className="py-2 pr-2 text-slate-500">{it.satuan ?? "—"}</td>
                  <td className="py-2 pr-2 text-right data text-slate-600 tabular-nums">{it.target ?? "—"}</td>
                  <td className="py-2 pr-2 text-right data text-slate-600 tabular-nums">{it.realisasi ?? "—"}</td>
                  <td className="py-2 pr-2 text-right data text-slate-600 tabular-nums">{fmtNum(it.bobot)}</td>
                  <td className="py-2 pr-2 text-right data text-slate-500 tabular-nums">{it.capaian ?? "—"}</td>
                  <td className="py-2 text-right data font-semibold text-navy tabular-nums">{fmtNum(it.skor)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
          <tr className="border-t-2 border-slate-200">
            <td className="py-2 pr-2 font-bold text-navy" colSpan={4}>Total</td>
            <td className="py-2 pr-2 text-right data font-extrabold text-navy tabular-nums">{fmtNum(totalBobot)}</td>
            <td></td>
            <td className="py-2 text-right data font-extrabold text-navy tabular-nums">{fmtNum(totalSkor)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
