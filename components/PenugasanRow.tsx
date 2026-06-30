"use client"

import { useActionState, useEffect, useState } from "react"
import { updateKertasKerja, type EditState } from "@/app/actions"
import { fmt } from "@/lib/score"

export type PenugasanData = {
  id: number
  jabatan: string | null
  entitas: string | null
  awal: string | null
  akhir: string | null
  hari: number | null
  bulan: number | null
  skor: number | null
  keterangan: string | null
}

const initial: EditState = { ok: false }

function tgl(s: string | null) {
  if (!s) return "—"
  return new Date(s + "T00:00:00").toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export function PenugasanRow({ row, canEdit, colSpan }: { row: PenugasanData; canEdit: boolean; colSpan: number }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updateKertasKerja, initial)

  useEffect(() => {
    if (state.ok) setEditing(false)
  }, [state])

  if (editing && canEdit) {
    return (
      <tr className="border-b border-slate-100 bg-paper/60">
        <td colSpan={colSpan} className="p-3">
          <form action={formAction}>
            <input type="hidden" name="id" value={row.id} />
            <p className="text-xs font-bold text-navy">{row.jabatan}</p>
            <p className="text-[11px] text-slate-500">{row.entitas} · {tgl(row.awal)} – {tgl(row.akhir)}</p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="block text-xs font-medium text-slate-600">
                Skor sementara <span className="text-slate-400">(0–200)</span>
                <input name="skor" type="text" inputMode="decimal" defaultValue={row.skor ?? ""} placeholder="mis. 85.50" autoFocus
                  className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Hari <span className="text-slate-400">(0–366)</span>
                <input name="hari" type="number" min={0} max={366} defaultValue={row.hari ?? ""}
                  className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" />
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Bulan <span className="text-slate-400">(0–12)</span>
                <input name="bulan" type="number" min={0} max={12} defaultValue={row.bulan ?? ""}
                  className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" />
              </label>
            </div>
            <label className="mt-3 block text-xs font-medium text-slate-600">
              Keterangan
              <input name="keterangan" type="text" defaultValue={row.keterangan ?? ""} placeholder="opsional"
                className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" />
            </label>

            {state.error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}

            <div className="mt-3 flex items-center gap-2">
              <button type="submit" disabled={pending}
                className="inline-flex min-h-[34px] cursor-pointer items-center rounded-full bg-navy px-4 text-xs font-bold text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-60">
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
              <button type="button" onClick={() => setEditing(false)} disabled={pending}
                className="inline-flex min-h-[34px] cursor-pointer items-center rounded-full bg-white px-4 text-xs font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy disabled:opacity-60">
                Batal
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 align-top">
      <td className="py-1.5 pr-2">
        <span className="font-semibold text-navy">{row.jabatan}</span>
        {row.keterangan && <span className="block text-[11px] italic text-slate-400">{row.keterangan}</span>}
      </td>
      <td className="py-1.5 pr-2 text-slate-600">{row.entitas}</td>
      <td className="py-1.5 pr-2 data text-xs text-slate-600">{tgl(row.awal)} – {tgl(row.akhir)}</td>
      <td className="py-1.5 pr-2 text-right data text-slate-600">{row.hari ?? "—"}</td>
      <td className="py-1.5 pr-2 text-right data text-slate-600">{row.bulan ?? "—"}</td>
      <td className="py-1.5 text-right">
        <span className="inline-flex items-center justify-end gap-2">
          <span className="data font-bold text-navy">{row.skor != null ? fmt(row.skor) : "—"}</span>
          {canEdit && (
            <button type="button" onClick={() => setEditing(true)} aria-label="Edit penugasan"
              className="grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-white text-slate-500 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy hover:shadow-card no-print">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          )}
        </span>
      </td>
    </tr>
  )
}
