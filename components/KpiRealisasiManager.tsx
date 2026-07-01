"use client"

import { useEffect, useMemo, useState } from "react"
import { useActionState } from "react"
import { updateKpiRealisasi, type EditState } from "@/app/actions"
import type { KpiRealisasiRow } from "@/lib/kpi"

const initial: EditState = { ok: false }
const inp =
  "w-full rounded-lg bg-white px-2.5 py-1.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel"

function RowEditor({ row }: { row: KpiRealisasiRow }) {
  const [realisasi, setRealisasi] = useState(row.realisasi ?? "")
  const [capaian, setCapaian] = useState(row.capaian ?? "")
  const [saved, setSaved] = useState({ realisasi: row.realisasi ?? "", capaian: row.capaian ?? "" })
  const [state, formAction, pending] = useActionState(updateKpiRealisasi, initial)

  useEffect(() => {
    if (state.ok) setSaved({ realisasi, capaian })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const dirty = realisasi !== saved.realisasi || capaian !== saved.capaian

  return (
    <tr className="border-b border-slate-900/[0.05] align-top hover:bg-paper/60">
      <td className="py-2 pr-3">
        <div className="font-medium text-navy">{row.indikator}</div>
        {row.polaritas && <div className="text-[11px] text-slate-400">{row.polaritas}</div>}
      </td>
      <td className="py-2 pr-3 text-slate-500">{row.satuan ?? "—"}</td>
      <td className="py-2 pr-3 data text-slate-500">{row.target ?? "—"}</td>
      <td className="py-2 pr-3">
        <input value={realisasi} onChange={(e) => setRealisasi(e.target.value)} placeholder="—" className={inp} />
      </td>
      <td className="py-2 pr-3">
        <input value={capaian} onChange={(e) => setCapaian(e.target.value)} placeholder="—" className={`${inp} w-24`} />
      </td>
      <td className="py-2">
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="entitas" value={row.entitas} />
          <input type="hidden" name="indikator" value={row.indikator} />
          <input type="hidden" name="realisasi" value={realisasi} />
          <input type="hidden" name="capaian" value={capaian} />
          <button
            type="submit"
            disabled={!dirty || pending}
            className="inline-flex min-h-[32px] cursor-pointer items-center rounded-full bg-navy px-3.5 text-xs font-bold text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "…" : "Simpan"}
          </button>
          {!dirty && state.ok && <span className="text-xs font-medium text-emerald-600">✓</span>}
          {state.error && <span className="text-[11px] text-rose-600">{state.error}</span>}
        </form>
      </td>
    </tr>
  )
}

export function KpiRealisasiManager({ rows, entitasList }: { rows: KpiRealisasiRow[]; entitasList: string[] }) {
  const [entitas, setEntitas] = useState(entitasList[0] ?? "")
  const [q, setQ] = useState("")

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows.filter((r) => r.entitas === entitas && (!term || r.indikator.toLowerCase().includes(term)))
  }, [rows, entitas, q])

  // kelompokkan per perspektif dengan urutan kemunculan
  const groups = useMemo(() => {
    const m = new Map<string, KpiRealisasiRow[]>()
    for (const r of filtered) {
      const k = r.perspektif ?? "Lainnya"
      if (!m.has(k)) m.set(k, [])
      m.get(k)!.push(r)
    }
    return Array.from(m.entries())
  }, [filtered])

  const terisi = filtered.filter((r) => r.realisasi != null && r.realisasi !== "").length

  return (
    <section className="rounded-3xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm sm:p-6">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-xs font-medium text-slate-600">
          Entitas
          <select value={entitas} onChange={(e) => setEntitas(e.target.value)} className="mt-1 w-full rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel">
            {entitasList.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Cari indikator
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="mis. EBITDA…" className="mt-1 w-full rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.06] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-steel" />
        </label>
        <p className="text-sm text-slate-500">
          <span className="data font-semibold text-navy">{terisi}/{filtered.length}</span> realisasi terisi
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-900/[0.08] text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <th className="py-2.5 pr-3 font-semibold">Indikator</th>
              <th className="py-2.5 pr-3 font-semibold">Satuan</th>
              <th className="py-2.5 pr-3 font-semibold">Target</th>
              <th className="py-2.5 pr-3 font-semibold">Realisasi</th>
              <th className="py-2.5 pr-3 font-semibold">% Capaian</th>
              <th className="py-2.5 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(([persp, items]) => (
              <FragmentGroup key={persp} persp={persp} items={items} />
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-400">Tidak ada indikator.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        Nilai realisasi & % capaian berlaku untuk seluruh pejabat pada entitas terpilih. Skor KPI tidak dihitung ulang otomatis.
      </p>
    </section>
  )
}

function FragmentGroup({ persp, items }: { persp: string; items: KpiRealisasiRow[] }) {
  return (
    <>
      <tr className="bg-primary/[0.04]">
        <td colSpan={6} className="py-1.5 pr-3 text-[11px] font-bold uppercase tracking-wide text-primary">{persp}</td>
      </tr>
      {items.map((r) => <RowEditor key={`${r.entitas}||${r.indikator}`} row={r} />)}
    </>
  )
}
