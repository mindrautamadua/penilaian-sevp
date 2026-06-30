import { sql } from "./db"

export type KpiItem = {
  id: number
  urut: number
  perspektif: string | null
  indikator: string
  satuan: string | null
  target: string | null
  realisasi: string | null
  polaritas: string | null
  bobot: number | null
  skor: number | null
}

export type KpiSet = {
  id: number
  judul: string
  tahun: number
  entitas: string[]
  catatan: string | null
  updated_at: string
}

export type KpiSetSummary = KpiSet & { total_bobot: number; total_skor: number; jumlah: number }

const n = (v: unknown): number => (v == null ? 0 : Number(v))

export async function listKpiSets(): Promise<KpiSetSummary[]> {
  if (!sql) return []
  try {
    const rows = await sql<KpiSetSummary[]>`
      select s.id, s.judul, s.tahun, s.entitas, s.catatan, s.updated_at::text,
             coalesce(sum(i.bobot),0) as total_bobot,
             coalesce(sum(i.skor),0)  as total_skor,
             count(i.id)::int          as jumlah
      from kpi_kolegial s left join kpi_item i on i.set_id = s.id
      group by s.id order by s.tahun desc, s.judul`
    return rows.map((r) => ({ ...r, total_bobot: n(r.total_bobot), total_skor: n(r.total_skor) }))
  } catch {
    return []
  }
}

export async function getKpiSet(id: number): Promise<{ set: KpiSet; items: KpiItem[] } | null> {
  if (!sql) return null
  try {
    const s = await sql<KpiSet[]>`select id, judul, tahun, entitas, catatan, updated_at::text from kpi_kolegial where id=${id}`
    if (!s[0]) return null
    const items = await sql<KpiItem[]>`
      select id, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, skor
      from kpi_item where set_id=${id} order by urut, id`
    return { set: s[0], items: items.map((i) => ({ ...i, bobot: i.bobot == null ? null : n(i.bobot), skor: i.skor == null ? null : n(i.skor) })) }
  } catch {
    return null
  }
}

export type KpiPejabatItem = {
  id: number
  jabatan: string | null
  entitas: string | null
  urut: number
  perspektif: string | null
  indikator: string
  satuan: string | null
  target: string | null
  realisasi: string | null
  polaritas: string | null
  bobot: number | null
  capaian: string | null
  skor: number | null
}

// Breakdown KPI individu (sesuai jabatan) untuk satu pejabat.
export async function kpiPejabat(nama: string, tahun = 2025): Promise<KpiPejabatItem[]> {
  if (!sql || !nama) return []
  try {
    const items = await sql<KpiPejabatItem[]>`
      select id, jabatan, entitas, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, capaian, skor
      from kpi_pejabat where nama=${nama} and tahun=${tahun} order by entitas, jabatan, urut, id`
    return items.map((i) => ({ ...i, bobot: i.bobot == null ? null : n(i.bobot), skor: i.skor == null ? null : n(i.skor) }))
  } catch {
    return []
  }
}

// Set KPI yang mencakup salah satu entitas (untuk halaman pejabat), beserta item.
export async function kpiForEntitas(list: (string | null)[]): Promise<{ set: KpiSet; items: KpiItem[] }[]> {
  const ents = Array.from(new Set(list.filter(Boolean))) as string[]
  if (!sql || ents.length === 0) return []
  try {
    const sets = await sql<KpiSet[]>`
      select id, judul, tahun, entitas, catatan, updated_at::text
      from kpi_kolegial where entitas && ${ents} order by tahun desc, judul`
    const out: { set: KpiSet; items: KpiItem[] }[] = []
    for (const set of sets) {
      const items = await sql<KpiItem[]>`
        select id, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, skor
        from kpi_item where set_id=${set.id} order by urut, id`
      out.push({ set, items: items.map((i) => ({ ...i, bobot: i.bobot == null ? null : n(i.bobot), skor: i.skor == null ? null : n(i.skor) })) })
    }
    return out
  } catch {
    return []
  }
}
