import { db } from "./supabase"

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
const SET_COLS = "id, judul, tahun, entitas, catatan, updated_at"
const ITEM_COLS = "id, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, skor"

export async function listKpiSets(): Promise<KpiSetSummary[]> {
  if (!db) return []
  const [setsRes, itemsRes] = await Promise.all([
    db.from("kpi_kolegial").select(SET_COLS).order("tahun", { ascending: false }).order("judul"),
    db.from("kpi_item").select("set_id, bobot, skor"),
  ])
  if (setsRes.error || !setsRes.data) return []
  const items = (itemsRes.data ?? []) as { set_id: number; bobot: number | null; skor: number | null }[]
  return (setsRes.data as KpiSet[]).map((s) => {
    const own = items.filter((i) => i.set_id === s.id)
    return {
      ...s,
      total_bobot: own.reduce((a, i) => a + n(i.bobot), 0),
      total_skor: own.reduce((a, i) => a + n(i.skor), 0),
      jumlah: own.length,
    }
  })
}

export async function getKpiSet(id: number): Promise<{ set: KpiSet; items: KpiItem[] } | null> {
  if (!db) return null
  const setRes = await db.from("kpi_kolegial").select(SET_COLS).eq("id", id).maybeSingle()
  if (setRes.error || !setRes.data) return null
  const itemsRes = await db.from("kpi_item").select(ITEM_COLS).eq("set_id", id).order("urut").order("id")
  const items = ((itemsRes.data ?? []) as KpiItem[]).map((i) => ({
    ...i, bobot: i.bobot == null ? null : n(i.bobot), skor: i.skor == null ? null : n(i.skor),
  }))
  return { set: setRes.data as KpiSet, items }
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
  if (!db || !nama) return []
  const { data, error } = await db
    .from("kpi_pejabat")
    .select("id, jabatan, entitas, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, capaian, skor")
    .eq("nama", nama)
    .eq("tahun", tahun)
    .order("entitas").order("jabatan").order("urut").order("id")
  if (error || !data) return []
  return (data as KpiPejabatItem[]).map((i) => ({
    ...i, bobot: i.bobot == null ? null : n(i.bobot), skor: i.skor == null ? null : n(i.skor),
  }))
}

// Set KPI yang mencakup salah satu entitas (untuk halaman pejabat), beserta item.
export async function kpiForEntitas(list: (string | null)[]): Promise<{ set: KpiSet; items: KpiItem[] }[]> {
  const ents = Array.from(new Set(list.filter(Boolean))) as string[]
  if (!db || ents.length === 0) return []
  const setsRes = await db.from("kpi_kolegial").select(SET_COLS).overlaps("entitas", ents).order("tahun", { ascending: false }).order("judul")
  if (setsRes.error || !setsRes.data) return []
  const out: { set: KpiSet; items: KpiItem[] }[] = []
  for (const set of setsRes.data as KpiSet[]) {
    const itemsRes = await db.from("kpi_item").select(ITEM_COLS).eq("set_id", set.id).order("urut").order("id")
    const items = ((itemsRes.data ?? []) as KpiItem[]).map((i) => ({
      ...i, bobot: i.bobot == null ? null : n(i.bobot), skor: i.skor == null ? null : n(i.skor),
    }))
    out.push({ set, items })
  }
  return out
}
