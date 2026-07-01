"use client"

import { useState } from "react"
import { setKategoriBod } from "@/app/actions"
import { band, bandForLabel, DEFAULT_KATEGORI, type Kategori } from "@/lib/score"

// Kolom "Kategori (BOD)" di dashboard. Default mengikuti kategori sistem;
// admin dapat menyesuaikan sesuai aspirasi BOD via dropdown. Bila pilihan
// dikembalikan ke kategori sistem, override dihapus (kembali ikut sistem).
//
// Perubahan diterapkan OPTIMISTIK: tampilan sel langsung berubah, simpan ke DB
// berjalan di latar belakang (tanpa refresh halaman). Bila gagal → dikembalikan.
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
  const [bod, setBod] = useState<string | null>(kategoriBod)
  const [saving, setSaving] = useState(false)

  const sys = band(skor, kategori)
  const eff = bod ? bandForLabel(bod, kategori) : sys
  const adjusted = !!bod && bod !== sys.label

  // Keterangan perubahan "Sistem → BOD" (muncul hanya bila berbeda).
  const perubahan = adjusted ? (
    <span className="mt-1 flex items-center gap-1 text-[10px] whitespace-nowrap" title="Perubahan rating: Sistem → BOD">
      <span className="text-slate-400 line-through">{sys.label}</span>
      <span className="text-slate-400">→</span>
      <span className="font-semibold text-primary">{bod}</span>
    </span>
  ) : null

  // Skor belum ada → tak ada yang dikategorikan; tampilkan status apa adanya.
  if (skor == null || !canEdit) {
    return (
      <span className="inline-flex flex-col items-start gap-0.5">
        <span className="inline-flex items-center gap-1.5">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${eff.chip}`}>{eff.label}</span>
          {adjusted && <span title="Disesuaikan oleh BOD" className="text-[13px] font-bold leading-none text-primary">•</span>}
        </span>
        {perubahan}
      </span>
    )
  }

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const label = e.target.value
    const next = label === sys.label ? null : label
    const prev = bod
    setBod(next) // optimistik: tampilkan langsung
    setSaving(true)
    const res = await setKategoriBod(id, label, sys.label)
    setSaving(false)
    if (!res?.ok) setBod(prev) // gagal → kembalikan
  }

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-2 w-2 shrink-0 rounded-full ${eff.dot}`} />
        <select
          name="label"
          value={bod ?? sys.label}
          onChange={onChange}
          disabled={saving}
          className="max-w-[7.5rem] rounded-lg bg-paper px-2 py-1 text-[11px] font-semibold text-navy shadow-inner ring-1 ring-slate-900/[0.06] focus:outline-none focus:ring-2 focus:ring-steel disabled:opacity-60"
        >
          {kategori.map((k) => (
            <option key={k.label} value={k.label}>{k.label}</option>
          ))}
        </select>
      </span>
      {perubahan}
    </span>
  )
}
