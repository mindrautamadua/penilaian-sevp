"use client"

import { useActionState, useEffect, useState } from "react"
import { updateRekapSkor, type EditState } from "@/app/actions"
import { band, fmt, barPct } from "@/lib/score"

type Row = {
  id: number
  skor: number | null
  bulan: number | null
  catatan: string | null
  jabatan: string | null
  status: "PKWT" | "PKWTT"
}

const initial: EditState = { ok: false }

export function EditSkorForm({ row, canEdit }: { row: Row; canEdit: boolean }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updateRekapSkor, initial)
  const b = band(row.skor)

  // tutup mode edit setelah simpan berhasil (data sudah ter-revalidate)
  useEffect(() => {
    if (state.ok) setEditing(false)
  }, [state])

  if (editing && canEdit) {
    return (
      <form action={formAction} className="rounded-2xl bg-paper p-5 ring-1 ring-slate-900/[0.05]">
        <input type="hidden" name="id" value={row.id} />
        <div className="flex items-center justify-between">
          <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${row.status === "PKWTT" ? "bg-primary/10 text-primary" : "bg-slate-900/[0.06] text-slate-500"}`}>{row.status}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">Mode Edit</span>
        </div>

        <label className="mt-3 block text-xs font-medium text-slate-600">Skor <span className="text-slate-400">(0–200, kosongkan = belum dinilai)</span></label>
        <input name="skor" type="text" inputMode="decimal" defaultValue={row.skor ?? ""} placeholder="mis. 85.50"
          className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" autoFocus />

        <label className="mt-3 block text-xs font-medium text-slate-600">Bulan dinilai <span className="text-slate-400">(0–12)</span></label>
        <input name="bulan" type="number" min={0} max={12} defaultValue={row.bulan ?? ""} placeholder="mis. 12"
          className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" />

        <label className="mt-3 block text-xs font-medium text-slate-600">Catatan</label>
        <textarea name="catatan" rows={2} defaultValue={row.catatan ?? ""} placeholder="opsional"
          className="mt-1 w-full resize-none rounded-xl bg-white px-3 py-2 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" />

        {state.error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}

        <div className="mt-4 flex items-center gap-2">
          <button type="submit" disabled={pending}
            className="inline-flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full bg-navy px-4 text-sm font-bold text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-60">
            {pending ? "Menyimpan…" : "Simpan"}
          </button>
          <button type="button" onClick={() => setEditing(false)} disabled={pending}
            className="inline-flex min-h-[38px] cursor-pointer items-center rounded-full bg-white px-4 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy disabled:opacity-60">
            Batal
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="rounded-2xl bg-paper p-5 ring-1 ring-slate-900/[0.05]">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${row.status === "PKWTT" ? "bg-primary/10 text-primary" : "bg-slate-900/[0.06] text-slate-500"}`}>{row.status}</span>
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${b.chip}`}>{b.label}</span>
      </div>
      <p className="data mt-3 text-4xl font-extrabold tracking-tightest text-navy">{fmt(row.skor)}</p>
      <span className="mt-3 block h-1.5 w-full overflow-hidden rounded-full bg-slate-900/[0.06]">
        <span className={`block h-full rounded-full ${b.bar}`} style={{ width: `${barPct(row.skor)}%` }} />
      </span>
      <p className="mt-3 text-sm font-medium text-slate-600">{row.jabatan}</p>
      {row.bulan != null && <p className="text-xs text-slate-500">Masa dinilai: {row.bulan} bulan</p>}
      {row.catatan && <p className="mt-1 text-[11px] italic text-slate-400">{row.catatan}</p>}

      {canEdit && (
        <button type="button" onClick={() => setEditing(true)}
          className="mt-4 inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy hover:shadow-card no-print">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Edit skor
        </button>
      )}
      {state.ok && <p className="mt-2 text-[11px] font-medium text-emerald-600 no-print">{state.message}</p>}
    </div>
  )
}
