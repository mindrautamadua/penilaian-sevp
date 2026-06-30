import { sql } from "./db"

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
  if (!sql) return []
  try {
    return await sql<LhekDoc[]>`
      select id, judul, tahun, entitas, path, file_name, size_bytes, uploaded_by, uploaded_at::text
      from lhek_doc order by tahun desc, judul`
  } catch {
    return []
  }
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
  if (!sql || ents.length === 0) return []
  try {
    return await sql<LhekDoc[]>`
      select id, judul, tahun, entitas, path, file_name, size_bytes, uploaded_by, uploaded_at::text
      from lhek_doc where entitas && ${ents} order by tahun desc, judul`
  } catch {
    return []
  }
}
