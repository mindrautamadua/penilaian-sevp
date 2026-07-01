import { db } from "./supabase"

export type RiwayatRow = {
  nama: string
  tahun: number
  nilai: number | null
  rating: string | null
  golongan: string | null
  grade: string | null
  perusahaan: string | null
  jabatan: string | null
  entitas: string | null
}

// Peta nama → nilai kolom (grade/golongan) terakhir (tahun terbaru yang non-kosong).
async function latestFieldMap(field: "grade" | "golongan"): Promise<Record<string, string>> {
  if (!db) return {}
  const { data, error } = await db.from("riwayat_penilaian").select(`nama, tahun, ${field}`)
  if (error || !data) return {}
  const best: Record<string, { tahun: number; val: string }> = {}
  for (const r of data as Record<string, unknown>[]) {
    const nama = r.nama as string
    const tahun = r.tahun as number
    const val = r[field] as string | null
    if (val == null || val.trim() === "") continue
    if (!best[nama] || tahun > best[nama].tahun) best[nama] = { tahun, val }
  }
  const out: Record<string, string> = {}
  for (const k in best) out[k] = best[k].val
  return out
}

// Peta nama → Person Grade terakhir.
export const latestGradeMap = () => latestFieldMap("grade")
// Peta nama → Golongan PhDP terakhir.
export const latestGolonganMap = () => latestFieldMap("golongan")

// Himpunan nama pejabat yang punya riwayat penilaian (untuk penanda di daftar).
export async function riwayatNamaSet(): Promise<Set<string>> {
  if (!db) return new Set()
  const { data, error } = await db.from("riwayat_penilaian").select("nama")
  if (error || !data) return new Set()
  return new Set((data as { nama: string }[]).map((r) => r.nama))
}

// Riwayat penilaian (tahun-tahun sebelumnya) untuk satu pejabat, urut tahun.
export async function getRiwayat(nama: string): Promise<RiwayatRow[]> {
  if (!db || !nama) return []
  const { data, error } = await db
    .from("riwayat_penilaian")
    .select("nama, tahun, nilai, rating, golongan, grade, perusahaan, jabatan, entitas")
    .eq("nama", nama)
    .order("tahun")
  if (error || !data) return []
  return (data as RiwayatRow[]).map((r) => ({ ...r, nilai: r.nilai == null ? null : Number(r.nilai) }))
}
