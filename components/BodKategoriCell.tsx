"use client"

import { useRef } from "react"
import { setKategoriBod } from "@/app/actions"
import { band, bandForLabel, DEFAULT_KATEGORI, type Kategori } from "@/lib/score"

// Kolom "Kategori (BOD)" di dashboard. Default mengikuti kategori sistem;
// admin dapat menyesuaikan sesuai aspirasi BOD via dropdown. Bila pilihan
// dikembalikan ke kategori sistem, override dihapus (kembali ikut sistem).
export function BodKategoriCell({
  id,
  skor,
  kategoriBod,
  kategori = DEFAULT_KATEGORI,
  canEdit,
}: {
  id: number
  skor: number | null
  kategoriBod: string | null
  kategori?: Kategori[]
  canEdit: boolean
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const sys = band(skor, kategori)
  const eff = kategoriBod ? bandForLabel(kategoriBod, kategori) : sys
  const adjusted = !!kategoriBod && kategoriBod !== sys.label

  // Skor belum ada → tak ada yang dikategorikan; tampilkan status apa adanya.
  if (skor == null || !canEdit) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${eff.chip}`}>{eff.label}</span>
        {adjusted && <span title="Disesuaikan oleh BOD" className="text-[13px] font-bold leading-none text-primary">•</span>}
      </span>
    )
  }

  return (
    <form ref={formRef} action={setKategoriBod} className="inline-flex items-center gap-1.5">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="sistem" value={sys.label} />
      <span className={`h-2 w-2 shrink-0 rounded-full ${eff.dot}`} />
      <select
        name="label"
        defaultValue={kategoriBod ?? sys.label}
        onChange={() => formRef.current?.requestSubmit()}
        className="max-w-[9.5rem] rounded-lg bg-paper px-2 py-1 text-[11px] font-semibold text-navy shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel"
      >
        {kategori.map((k) => (
          <option key={k.label} value={k.label}>{k.label}</option>
        ))}
      </select>
      {adjusted && (
        <span title="Berbeda dari kategori sistem" className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">disesuaikan</span>
      )}
    </form>
  )
}
