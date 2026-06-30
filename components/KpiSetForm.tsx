"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { createKpiSet, type EditState } from "@/app/actions"

const initial: EditState = { ok: false }

export function KpiSetForm({ entitasList, tahunDefault = 2025 }: { entitasList: string[]; tahunDefault?: number }) {
  const [state, formAction, pending] = useActionState(createKpiSet, initial)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset()
      setPicked(new Set())
    }
  }, [state])

  const toggle = (e: string) =>
    setPicked((cur) => {
      const next = new Set(cur)
      next.has(e) ? next.delete(e) : next.add(e)
      return next
    })

  const field = "mt-1 min-h-[44px] w-full rounded-xl bg-white px-3.5 text-sm text-ink shadow-soft outline-none ring-1 ring-slate-900/[0.08] focus:ring-2 focus:ring-steel"

  return (
    <details className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
      <summary className="cursor-pointer text-sm font-bold text-navy">+ Tambah set KPI Kolegial</summary>
      <form ref={formRef} action={formAction} className="mt-4 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div>
            <label htmlFor="kpi-judul" className="block text-sm font-medium text-slate-700">Judul</label>
            <input id="kpi-judul" name="judul" type="text" required placeholder="mis. KPI Kolegial PT ..." className={field} />
          </div>
          <div>
            <label htmlFor="kpi-tahun" className="block text-sm font-medium text-slate-700">Tahun</label>
            <input id="kpi-tahun" name="tahun" type="number" min={2000} max={2100} defaultValue={tahunDefault} className={field} />
          </div>
        </div>
        <div>
          <span className="block text-sm font-medium text-slate-700">Entitas yang dicakup <span className="text-slate-400">({picked.size})</span></span>
          <div className="mt-2 grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto rounded-xl bg-paper p-3 ring-1 ring-slate-900/[0.06] sm:grid-cols-2">
            {entitasList.map((e) => (
              <label key={e} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-white">
                <input type="checkbox" name="entitas" value={e} checked={picked.has(e)} onChange={() => toggle(e)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-steel" />
                {e}
              </label>
            ))}
          </div>
        </div>
        {state.error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
        {state.ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message} Tambahkan itemnya lewat tombol Edit pada daftar.</p>}
        <div>
          <button type="submit" disabled={pending} className="inline-flex min-h-[44px] cursor-pointer items-center rounded-full bg-navy px-6 text-sm font-bold text-white shadow-soft transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-70">
            {pending ? "Menyimpan…" : "Buat set"}
          </button>
        </div>
      </form>
    </details>
  )
}
