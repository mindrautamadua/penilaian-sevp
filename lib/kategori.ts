import { db } from "./supabase"
import { DEFAULT_KATEGORI, type Kategori } from "./score"

export type KategoriRow = { id: number; urut: number; label: string; batasMin: number; warna: string }

// Ambil konfigurasi kategori (urut naik). Fallback ke DEFAULT bila kosong/tanpa DB.
export async function getKategori(): Promise<Kategori[]> {
  const rows = await getKategoriRows()
  if (!rows.length) return DEFAULT_KATEGORI
  return rows.map((r) => ({ label: r.label, batasMin: r.batasMin, warna: r.warna }))
}

export async function getKategoriRows(): Promise<KategoriRow[]> {
  if (!db) return []
  const { data, error } = await db.from("skor_kategori").select("id, urut, label, batas_min, warna").order("urut")
  if (error || !data) return []
  return (data as { id: number; urut: number; label: string; batas_min: number | string; warna: string }[]).map((r) => ({
    id: r.id, urut: r.urut, label: r.label, batasMin: Number(r.batas_min), warna: r.warna,
  }))
}
