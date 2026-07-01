// Pembobotan kategori skor penilaian SEVP (skala ~0–100, sebagian > 100).
// Kategori & ambang bisa diatur admin (tabel skor_kategori); DEFAULT dipakai bila
// belum dikonfigurasi atau saat komponen tidak menerima config.

export type Band = {
  label: string
  chip: string   // kelas chip skor (latar lembut + teks pekat + ring)
  bar: string    // warna solid bar/aksen
  dot: string
}

export type Kategori = { label: string; batasMin: number; warna: string }

// Palet warna (kelas Tailwind statis agar ikut ter-build). key → kelas.
// Catatan: warna `teal` & `violet` di-override jadi warna FLAT di tailwind.config
// (tak punya shade 50/500), jadi TIDAK dipakai di sini — gunakan cyan/purple.
export const WARNA: Record<string, { chip: string; bar: string; dot: string; swatch: string }> = {
  emerald: { chip: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-500", swatch: "bg-emerald-500" },
  cyan:    { chip: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",          bar: "bg-cyan-500",    dot: "bg-cyan-500",    swatch: "bg-cyan-500" },
  sky:     { chip: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",             bar: "bg-sky-500",     dot: "bg-sky-500",     swatch: "bg-sky-500" },
  indigo:  { chip: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",    bar: "bg-indigo-500",  dot: "bg-indigo-500",  swatch: "bg-indigo-500" },
  purple:  { chip: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",    bar: "bg-purple-500",  dot: "bg-purple-500",  swatch: "bg-purple-500" },
  fuchsia: { chip: "bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-200", bar: "bg-fuchsia-500", dot: "bg-fuchsia-500", swatch: "bg-fuchsia-500" },
  amber:   { chip: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",       bar: "bg-amber-500",   dot: "bg-amber-500",   swatch: "bg-amber-500" },
  orange:  { chip: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",    bar: "bg-orange-500",  dot: "bg-orange-500",  swatch: "bg-orange-500" },
  rose:    { chip: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",          bar: "bg-rose-500",    dot: "bg-rose-500",    swatch: "bg-rose-500" },
  slate:   { chip: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",      bar: "bg-slate-300",   dot: "bg-slate-300",   swatch: "bg-slate-400" },
}
export const WARNA_KEYS = Object.keys(WARNA)

// Alias warna lama (flat) → padanan berskala, agar config lama tetap tampil benar.
const WARNA_ALIAS: Record<string, string> = { teal: "cyan", violet: "purple" }
export function resolveWarna(w: string): string {
  return WARNA[w] ? w : WARNA_ALIAS[w] ?? "slate"
}

export const DEFAULT_KATEGORI: Kategori[] = [
  { label: "Istimewa", batasMin: 90, warna: "emerald" },
  { label: "Sangat Baik", batasMin: 80, warna: "cyan" },
  { label: "Baik", batasMin: 70, warna: "sky" },
  { label: "Cukup", batasMin: 60, warna: "amber" },
  { label: "Perlu Perhatian", batasMin: 0, warna: "rose" },
]

const belumDinilai: Band = { label: "Belum Dinilai", ...pick("slate") }

function pick(warna: string) {
  const w = WARNA[resolveWarna(warna)] ?? WARNA.slate
  return { chip: w.chip, bar: w.bar, dot: w.dot }
}

export function band(skor: number | null | undefined, kategori: Kategori[] = DEFAULT_KATEGORI): Band {
  if (skor == null) return belumDinilai
  const sorted = [...kategori].sort((a, b) => b.batasMin - a.batasMin)
  const k = sorted.find((c) => skor >= c.batasMin) ?? sorted[sorted.length - 1]
  if (!k) return belumDinilai
  return { label: k.label, ...pick(k.warna) }
}

// Band untuk sebuah label kategori (dipakai override BOD). Tak ketemu → slate.
export function bandForLabel(label: string, kategori: Kategori[] = DEFAULT_KATEGORI): Band {
  const k = kategori.find((c) => c.label === label)
  if (!k) return { label, ...pick("slate") }
  return { label: k.label, ...pick(k.warna) }
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
