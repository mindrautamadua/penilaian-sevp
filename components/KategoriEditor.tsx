"use client"

import { useActionState, useState } from "react"
import { saveKategori, type EditState } from "@/app/actions"
import { band, WARNA, WARNA_KEYS, resolveWarna, type Kategori } from "@/lib/score"

type Row = { label: string; batasMin: string; warna: string }

const initial: EditState = { ok: false }
const inp = "w-full rounded-lg bg-white px-2.5 py-1.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel"

export function KategoriEditor({ initialRows }: { initialRows: Kategori[] }) {
  const [state, formAction, pending] = useActionState(saveKategori, initial)
  const [rows, setRows] = useState<Row[]>(
    (initialRows.length ? initialRows : []).map((r) => ({ label: r.label, batasMin: String(r.batasMin), warna: resolveWarna(r.warna) })),
  )

  const upd = (i: number, k: keyof Row, v: string) => setRows((cur) => cur.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)))
  const add = () => setRows((cur) => [...cur, { label: "", batasMin: "", warna: "slate" }])
  const del = (i: number) => setRows((cur) => cur.filter((_, idx) => idx !== i))

  // kategori efektif untuk pratinjau (urut turun berdasar batas)
  const cats: Kategori[] = rows
    .filter((r) => r.label.trim())
    .map((r) => ({ label: r.label, batasMin: parseFloat(r.batasMin.replace(",", ".")) || 0, warna: r.warna }))
  const samples = [100, 90, 85, 75, 65, 55, 30]

  return (
    <form action={formAction}>
      <input type="hidden" name="payload" value={JSON.stringify(rows)} />

      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-900/[0.06]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-paper text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
              <th className="p-2.5 font-semibold">Label</th>
              <th className="p-2.5 font-semibold">Skor Minimal (≥)</th>
              <th className="p-2.5 font-semibold">Warna</th>
              <th className="p-2.5 font-semibold">Pratinjau</th>
              <th className="p-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const w = WARNA[resolveWarna(r.warna)] ?? WARNA.slate
              const opsi = WARNA_KEYS.includes(r.warna) ? WARNA_KEYS : [r.warna, ...WARNA_KEYS]
              return (
                <tr key={i} className="border-t border-slate-900/[0.05]">
                  <td className="p-1.5"><input className={inp} value={r.label} onChange={(e) => upd(i, "label", e.target.value)} placeholder="mis. Istimewa" /></td>
                  <td className="p-1.5 w-36"><input className={`${inp} text-right`} value={r.batasMin} onChange={(e) => upd(i, "batasMin", e.target.value)} inputMode="decimal" placeholder="90" /></td>
                  <td className="p-1.5 w-40">
                    <div className="flex items-center gap-2">
                      <span className={`h-4 w-4 shrink-0 rounded-full ${w.swatch}`} />
                      <select className={inp} value={r.warna} onChange={(e) => upd(i, "warna", e.target.value)}>
                        {opsi.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="p-1.5"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${w.chip}`}>{r.label || "—"}</span></td>
                  <td className="p-1.5">
                    <button type="button" onClick={() => del(i)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50" aria-label="Hapus">✕</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[11px] text-slate-400">Skor dicek dari kategori dengan batas tertinggi ke terendah. Kategori paling bawah sebaiknya berbatas 0 sebagai penampung. Skor kosong selalu “Belum Dinilai”.</p>

      {/* Pratinjau contoh skor */}
      <div className="mt-4 rounded-2xl bg-paper p-4 ring-1 ring-slate-900/[0.05]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pratinjau</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {samples.map((s) => {
            const b = band(s, cats)
            return (
              <span key={s} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <span className="data font-semibold text-navy">{s}</span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${b.chip}`}>{b.label}</span>
              </span>
            )
          })}
        </div>
      </div>

      {state.error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
      {state.ok && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>}

      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={add} className="inline-flex min-h-[40px] cursor-pointer items-center rounded-full bg-white px-4 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy">+ Tambah kategori</button>
        <button type="submit" disabled={pending} className="inline-flex min-h-[40px] cursor-pointer items-center rounded-full bg-navy px-6 text-sm font-bold text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-70">{pending ? "Menyimpan…" : "Simpan kategori"}</button>
      </div>
    </form>
  )
}
