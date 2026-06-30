// Pembobotan kategori skor penilaian SEVP (skala ~0–100, sebagian > 100).

export type Band = {
  label: string
  // kelas untuk chip skor (latar lembut + teks pekat)
  chip: string
  // warna solid untuk bar/aksen
  bar: string
  dot: string
}

export function band(skor: number | null | undefined): Band {
  if (skor == null) {
    return { label: "Belum Dinilai", chip: "bg-slate-100 text-slate-500 ring-1 ring-slate-200", bar: "bg-slate-300", dot: "bg-slate-300" }
  }
  if (skor >= 90) return { label: "Istimewa",    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-500" }
  if (skor >= 80) return { label: "Sangat Baik", chip: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",          bar: "bg-teal",        dot: "bg-teal" }
  if (skor >= 70) return { label: "Baik",        chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",             bar: "bg-sky-500",     dot: "bg-sky-500" }
  if (skor >= 60) return { label: "Cukup",       chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       bar: "bg-amber-500",   dot: "bg-amber-500" }
  return { label: "Perlu Perhatian", chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-200", bar: "bg-rose-500", dot: "bg-rose-500" }
}

export function fmt(skor: number | null | undefined): string {
  if (skor == null) return "—"
  return skor.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// lebar bar relatif terhadap 100 (di-cap di 100%)
export function barPct(skor: number | null | undefined): number {
  if (skor == null) return 0
  return Math.max(0, Math.min(100, skor))
}
