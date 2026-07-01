"use client"

import { useState } from "react"
import { setRekapUsulan } from "@/app/actions"

// Sel isian usulan Penilaian 2025 (PHDP / Person Grade). Free-text, simpan
// saat blur / Enter, optimistik (revert bila gagal). Admin-only untuk edit.
export function UsulanCell({
  id,
  field,
  value,
  fallback = null,
  canEdit,
  placeholder,
  widthClass = "w-20",
}: {
  id: number
  field: "phdp" | "person_grade"
  value: string | null
  fallback?: string | null // default tampilan bila belum ada nilai tersimpan
  canEdit: boolean
  placeholder?: string
  widthClass?: string
}) {
  // Tampilan diisi nilai tersimpan; bila kosong pakai default (mis. Person Grade terakhir).
  // Baseline "saved" = nilai ASLI di DB (bukan default), agar menyetujui default =
  // perubahan nyata → ikut tersimpan saat blur/Enter.
  const [val, setVal] = useState(value ?? fallback ?? "")
  const [saved, setSaved] = useState(value ?? "")
  const [saving, setSaving] = useState(false)

  // Keterangan perubahan "acuan (terakhir) → keputusan 2025" — hanya bila berbeda.
  const acuan = (fallback ?? "").trim()
  const kini = val.trim()
  const berubah = kini !== "" && kini !== acuan
  const perubahan = berubah ? (
    <span className="mt-1 flex items-center gap-1 text-[10px] whitespace-nowrap" title={`Perubahan ${field === "phdp" ? "Golongan PhDP" : "Person Grade"}: nilai terakhir → keputusan 2025`}>
      <span className="text-slate-400 line-through">{acuan || "—"}</span>
      <span className="text-slate-400">→</span>
      <span className="font-semibold text-primary">{kini}</span>
    </span>
  ) : null

  if (!canEdit) {
    return (
      <span className="inline-flex flex-col items-start gap-0.5">
        <span className="data text-slate-600">{(value ?? fallback) || "—"}</span>
        {perubahan}
      </span>
    )
  }

  async function commit() {
    if (val.trim() === saved.trim()) return
    setSaving(true)
    const res = await setRekapUsulan(id, field, val)
    setSaving(false)
    if (res?.ok) setSaved(val)
    else setVal(saved) // gagal → kembalikan
  }

  // Masih menampilkan default (sama dgn riwayat) & belum tersimpan → tampil redup.
  const usingDefault = val.trim() !== "" && val === (fallback ?? "") && val.trim() !== saved.trim()

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
        disabled={saving}
        placeholder={placeholder ?? "—"}
        title={usingDefault ? `Default dari ${field === "phdp" ? "Golongan PhDP" : "Person Grade"} terakhir — edit untuk menetapkan keputusan 2025` : undefined}
        className={`data ${widthClass} rounded-lg bg-paper px-2 py-1 text-[11px] font-semibold ${usingDefault ? "italic text-slate-500" : "text-navy"} shadow-inner ring-1 ring-slate-900/[0.06] placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-steel disabled:opacity-60`}
      />
      {perubahan}
    </span>
  )
}
