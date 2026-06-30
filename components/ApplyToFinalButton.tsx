"use client"

import { useActionState } from "react"
import { updateRekapSkor, type EditState } from "@/app/actions"
import { fmt } from "@/lib/score"

const initial: EditState = { ok: false }

// Salin skor sementara penugasan tunggal → skor final (rekap) dengan sekali klik.
// Catatan rekap yang sudah ada ikut dipertahankan (dikirim sebagai hidden field).
export function ApplyToFinalButton({
  rekapId, skor, bulan, catatan, currentFinal,
}: {
  rekapId: number
  skor: number
  bulan: number | null
  catatan: string | null
  currentFinal: number | null
}) {
  const [state, formAction, pending] = useActionState(updateRekapSkor, initial)

  return (
    <form action={formAction} className="mt-3 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] p-4 no-print">
      <input type="hidden" name="id" value={rekapId} />
      <input type="hidden" name="skor" value={skor} />
      <input type="hidden" name="bulan" value={bulan ?? ""} />
      <input type="hidden" name="catatan" value={catatan ?? ""} />

      <p className="text-xs text-slate-600">
        Penugasan tunggal — skor sementara <span className="data font-bold text-navy">{fmt(skor)}</span> berbeda dari skor final{" "}
        <span className="data font-bold text-navy">{fmt(currentFinal)}</span>.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button type="submit" disabled={pending}
          className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-violet px-4 text-sm font-bold text-white shadow-soft transition-all hover:shadow-card active:scale-[0.98] disabled:opacity-60">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {pending ? "Menerapkan…" : `Terapkan ke skor final (${fmt(skor)})`}
        </button>
      </div>

      {state.error && <p role="alert" className="mt-2 text-xs text-rose-700">{state.error}</p>}
      {state.ok && <p className="mt-2 text-xs font-medium text-emerald-600">{state.message}</p>}
    </form>
  )
}
