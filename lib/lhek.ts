import { db } from "./supabase"

const COLS = "id, judul, tahun, entitas, path, file_name, size_bytes, uploaded_by, uploaded_at"

export type LhekDoc = {
  id: number
  judul: string
  tahun: number
  entitas: string[]
  path: string
  file_name: string
  size_bytes: number | null
  uploaded_by: string | null
  uploaded_at: string
}

export async function listLhek(): Promise<LhekDoc[]> {
  if (!db) return []
  const { data, error } = await db.from("lhek_doc").select(COLS).order("tahun", { ascending: false }).order("judul")
  if (error || !data) return []
  return data as LhekDoc[]
}

export type LhekRef = { id: number; judul: string; tahun: number }

// Peta entitas → dokumen LHEK (dokumen pertama yang mencakup entitas itu).
// Dipakai untuk menampilkan tautan LHEK cepat di tiap baris daftar.
export async function lhekMapByEntitas(): Promise<Record<string, LhekRef>> {
  const docs = await listLhek()
  const map: Record<string, LhekRef> = {}
  for (const d of docs) {
    for (const e of d.entitas) {
      if (!map[e]) map[e] = { id: d.id, judul: d.judul, tahun: d.tahun }
    }
  }
  return map
}

// Dokumen LHEK yang mencakup salah satu entitas pada daftar (untuk halaman pejabat).
export async function lhekForEntitas(list: (string | null)[]): Promise<LhekDoc[]> {
  const ents = Array.from(new Set(list.filter(Boolean))) as string[]
  if (!db || ents.length === 0) return []
  const { data, error } = await db
    .from("lhek_doc")
    .select(COLS)
    .overlaps("entitas", ents)
    .order("tahun", { ascending: false })
    .order("judul")
  if (error || !data) return []
  return data as LhekDoc[]
}
