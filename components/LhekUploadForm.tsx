"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { uploadLhek, type EditState } from "@/app/actions"

const initial: EditState = { ok: false }

export function LhekUploadForm({ entitasList, tahunDefault = 2025 }: { entitasList: string[]; tahunDefault?: number }) {
  const [state, formAction, pending] = useActionState(uploadLhek, initial)
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

  const field =
    "mt-1 min-h-[44px] w-full rounded-xl bg-white px-3.5 text-sm text-ink shadow-soft outline-none ring-1 ring-slate-900/[0.08] transition-all focus:ring-2 focus:ring-steel"

  return (
    <section className="rounded-3xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm sm:p-6">
      <span className="eyebrow bg-primary/10 text-primary">Unggah</span>
      <h2 className="mt-2 text-lg font-bold tracking-tight text-navy">Tambah Dokumen LHEK</h2>
      <p className="mt-1 text-sm text-slate-500">Unggah PDF LHEK lalu pilih entitas yang dicakup (boleh lebih dari satu).</p>

      <form ref={formRef} action={formAction} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div>
            <label htmlFor="judul" className="block text-sm font-medium text-slate-700">Judul dokumen</label>
            <input id="judul" name="judul" type="text" required placeholder="mis. LHEK PTPN I dan entitas anaknya 2025" className={field} />
          </div>
          <div>
            <label htmlFor="tahun" className="block text-sm font-medium text-slate-700">Tahun</label>
            <input id="tahun" name="tahun" type="number" min={2000} max={2100} defaultValue={tahunDefault} className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-slate-700">File PDF <span className="text-slate-400">(maks. 10 MB)</span></label>
          <input id="file" name="file" type="file" accept="application/pdf" required
            className="mt-1 w-full rounded-xl bg-paper px-3.5 py-2.5 text-sm text-ink shadow-inner ring-1 ring-slate-900/[0.08] file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-primary" />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700">Entitas yang dicakup <span className="text-slate-400">({picked.size} dipilih)</span></span>
          <div className="mt-2 grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto rounded-xl bg-paper p-3 ring-1 ring-slate-900/[0.06] sm:grid-cols-2">
            {entitasList.map((e) => (
              <label key={e} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-white">
                <input type="checkbox" name="entitas" value={e} checked={picked.has(e)} onChange={() => toggle(e)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-steel" />
                {e}
              </label>
            ))}
          </div>
        </div>

        {state.error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>}
        {state.ok && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>}

        <div>
          <button type="submit" disabled={pending}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-navy px-6 text-sm font-bold tracking-tight text-white shadow-soft transition-all hover:bg-primary hover:shadow-card active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70">
            {pending ? "Mengunggah…" : "Unggah dokumen"}
          </button>
        </div>
      </form>
    </section>
  )
}
