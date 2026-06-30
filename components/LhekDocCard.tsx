"use client"

import { useActionState, useEffect, useState } from "react"
import { updateLhekJudul, deleteLhek, type EditState } from "@/app/actions"

type Doc = {
  id: number
  judul: string
  tahun: number
  file_name: string
  size_bytes: number | null
  entitas: string[]
}

const initial: EditState = { ok: false }

function fmtSize(n: number | null): string {
  if (!n) return "—"
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export function LhekDocCard({ doc, canEdit }: { doc: Doc; canEdit: boolean }) {
  const [editing, setEditing] = useState(false)
  const [state, formAction, pending] = useActionState(updateLhekJudul, initial)

  useEffect(() => {
    if (state.ok) setEditing(false)
  }, [state])

  return (
    <div className="rounded-2xl bg-white/90 p-4 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
      {editing && canEdit ? (
        <form action={formAction}>
          <input type="hidden" name="id" value={doc.id} />
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <label className="block text-xs font-medium text-slate-600">
              Judul dokumen
              <input name="judul" type="text" defaultValue={doc.judul} required autoFocus
                className="mt-1 min-h-[42px] w-full rounded-xl bg-white px-3.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              Tahun
              <input name="tahun" type="number" min={2000} max={2100} defaultValue={doc.tahun}
                className="mt-1 min-h-[42px] w-full rounded-xl bg-white px-3.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] outline-none focus:ring-2 focus:ring-steel" />
            </label>
          </div>
          {state.error && <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{state.error}</p>}
          <div className="mt-3 flex items-center gap-2">
            <button type="submit" disabled={pending}
              className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full bg-navy px-4 text-sm font-bold text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-60">
              {pending ? "Menyimpan…" : "Simpan"}
            </button>
            <button type="button" onClick={() => setEditing(false)} disabled={pending}
              className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full bg-white px-4 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy disabled:opacity-60">
              Batal
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-navy">{doc.judul}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              <span className="data">{doc.tahun}</span> · {doc.file_name} · {fmtSize(doc.size_bytes)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {doc.entitas.map((e) => (
                <span key={e} className="inline-flex rounded-md bg-primary/[0.08] px-2 py-0.5 text-[11px] font-semibold text-primary">{e}</span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={`/api/lhek/${doc.id}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-navy px-4 text-sm font-semibold text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98]">
              Buka PDF
            </a>
            {canEdit && (
              <>
                <button type="button" onClick={() => setEditing(true)}
                  className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full bg-white px-3.5 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy active:scale-[0.98]">
                  Edit
                </button>
                <form action={deleteLhek}>
                  <input type="hidden" name="id" value={doc.id} />
                  <button type="submit"
                    className="inline-flex min-h-[36px] cursor-pointer items-center rounded-full bg-white px-3.5 text-sm font-medium text-rose-600 shadow-soft ring-1 ring-rose-200 transition-all hover:bg-rose-50 active:scale-[0.98]">
                    Hapus
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
