"use client"

import { useActionState, useState } from "react"
import { saveKpiItems, type EditState } from "@/app/actions"
import type { KpiItem } from "@/lib/kpi"

type Row = {
  perspektif: string
  indikator: string
  satuan: string
  target: string
  realisasi: string
  polaritas: string
  bobot: string
  skor: string
}

const initial: EditState = { ok: false }
const blank: Row = { perspektif: "", indikator: "", satuan: "", target: "", realisasi: "", polaritas: "Maximize", bobot: "", skor: "" }

const toRow = (i: KpiItem): Row => ({
  perspektif: i.perspektif ?? "",
  indikator: i.indikator,
  satuan: i.satuan ?? "",
  target: i.target ?? "",
  realisasi: i.realisasi ?? "",
  polaritas: i.polaritas ?? "",
  bobot: i.bobot == null ? "" : String(i.bobot),
  skor: i.skor == null ? "" : String(i.skor),
})

const inp = "w-full rounded-lg bg-white px-2 py-1.5 text-[13px] text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel"

export function KpiEditor({ setId, initialItems }: { setId: number; initialItems: KpiItem[] }) {
  const [state, formAction, pending] = useActionState(saveKpiItems, initial)
  const [rows, setRows] = useState<Row[]>(initialItems.length ? initialItems.map(toRow) : [blank])

  const upd = (i: number, k: keyof Row, v: string) =>
    setRows((cur) => cur.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))
  const add = () => setRows((cur) => [...cur, { ...blank }])
  const del = (i: number) => setRows((cur) => cur.filter((_, idx) => idx !== i))

  const totalBobot = rows.reduce((a, r) => a + (parseFloat(r.bobot.replace(",", ".")) || 0), 0)
  const totalSkor = rows.reduce((a, r) => a + (parseFloat(r.skor.replace(",", ".")) || 0), 0)

  return (
    <form action={formAction}>
      <input type="hidden" name="set_id" value={setId} />
      <input type="hidden" name="payload" value={JSON.stringify(rows)} />

      <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-900/[0.06]">
        <table className="w-full min-w-[920px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-paper text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              <th className="p-2 font-semibold">Perspektif</th>
              <th className="p-2 font-semibold">Indikator</th>
              <th className="p-2 font-semibold">Satuan</th>
              <th className="p-2 font-semibold">Target</th>
              <th className="p-2 font-semibold">Realisasi</th>
              <th className="p-2 font-semibold">Polaritas</th>
              <th className="p-2 font-semibold">Bobot</th>
              <th className="p-2 font-semibold">Skor</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-900/[0.05]">
                <td className="p-1"><input className={inp} value={r.perspektif} onChange={(e) => upd(i, "perspektif", e.target.value)} placeholder="A.1 Finansial" /></td>
                <td className="p-1"><input className={inp} value={r.indikator} onChange={(e) => upd(i, "indikator", e.target.value)} placeholder="Nama indikator" /></td>
                <td className="p-1 w-20"><input className={inp} value={r.satuan} onChange={(e) => upd(i, "satuan", e.target.value)} /></td>
                <td className="p-1 w-24"><input className={inp} value={r.target} onChange={(e) => upd(i, "target", e.target.value)} /></td>
                <td className="p-1 w-24"><input className={inp} value={r.realisasi} onChange={(e) => upd(i, "realisasi", e.target.value)} /></td>
                <td className="p-1 w-28">
                  <select className={inp} value={r.polaritas} onChange={(e) => upd(i, "polaritas", e.target.value)}>
                    <option value="">—</option>
                    <option value="Maximize">Maximize</option>
                    <option value="Minimize">Minimize</option>
                  </select>
                </td>
                <td className="p-1 w-16"><input className={`${inp} text-right`} value={r.bobot} onChange={(e) => upd(i, "bobot", e.target.value)} inputMode="decimal" /></td>
                <td className="p-1 w-16"><input className={`${inp} text-right`} value={r.skor} onChange={(e) => upd(i, "skor", e.target.value)} inputMode="decimal" /></td>
                <td className="p-1">
                  <button type="button" onClick={() => del(i)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50" aria-label="Hapus baris">✕</button>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 bg-paper/60">
              <td className="p-2 font-bold text-navy" colSpan={6}>Total</td>
              <td className="p-2 text-right data font-extrabold text-navy">{totalBobot.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</td>
              <td className="p-2 text-right data font-extrabold text-navy">{totalSkor.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {state.error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
      {state.ok && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>}

      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={add}
          className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy">
          + Tambah baris
        </button>
        <button type="submit" disabled={pending}
          className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full bg-navy px-6 text-sm font-bold tracking-tight text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-70">
          {pending ? "Menyimpan…" : "Simpan KPI"}
        </button>
      </div>
    </form>
  )
}
