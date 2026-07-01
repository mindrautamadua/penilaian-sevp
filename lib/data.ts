import { db, hasDb } from "./supabase"
import { photoFor } from "./photos"
import { lhekMapByEntitas, type LhekRef } from "./lhek"
import { getRiwayat, riwayatNamaSet, type RiwayatRow } from "./riwayat"
import raw from "@/db/data.json"

export type RekapRow = {
  id: number
  no: number | null
  nama: string
  entitas: string | null
  jabatan: string | null
  status: "PKWT" | "PKWTT"
  skor: number | null
  bulan: number | null
  catatan: string | null
  foto: string | null
  lhek: LhekRef | null
  rangkap: boolean        // menjabat bersamaan: total bulan semua penugasan > 12
  kategoriBod: string | null   // override kategori oleh BOD; null = ikuti sistem
  hasRiwayat: boolean     // punya riwayat penilaian tahun sebelumnya (2023/2024)
}

export type KertasRow = {
  id: number
  no: number | null
  entitas: string | null
  nama: string
  jabatan: string | null
  keterangan: string | null
  awal: string | null
  akhir: string | null
  hari: number | null
  bulan: number | null
  skor: number | null
  foto: string | null
  lhek: LhekRef | null
}

const n = (v: unknown): number | null => (v == null ? null : Number(v))

type DataOpts = { includeExcluded?: boolean }

// Nama pejabat yang total bulan seluruh penugasannya > 12 → menjabat bersamaan (rangkap).
async function rangkapSet(): Promise<Set<string>> {
  if (!db) {
    return sumBulanOver12((raw.kertas_kerja as { nama: string; bulan: number | null }[]))
  }
  const { data } = await db.from("kertas_kerja").select("nama, bulan")
  return sumBulanOver12((data ?? []) as { nama: string; bulan: number | null }[])
}

function sumBulanOver12(rows: { nama: string; bulan: number | null }[]): Set<string> {
  const total = new Map<string, number>()
  for (const r of rows) total.set(r.nama, (total.get(r.nama) ?? 0) + (Number(r.bulan) || 0))
  return new Set([...total].filter(([, b]) => b > 12).map(([nama]) => nama))
}

// ── Pejabat yang dikecualikan dari penilaian ──
export type ExcludedInfo = { nama: string; alasan: string | null; oleh: string | null; waktu: string }

export async function getExcluded(): Promise<ExcludedInfo[]> {
  if (!db) return []
  const { data, error } = await db.from("pejabat_excluded").select("nama, alasan, oleh, waktu").order("nama")
  if (error || !data) return []
  return data as ExcludedInfo[]
}

async function excludedSet(): Promise<Set<string>> {
  return new Set((await getExcluded()).map((e) => e.nama))
}

// ── Sumber data: PostgreSQL bila tersedia, jika tidak fallback ke db/data.json ──

export async function getRekap(opts: DataOpts = {}): Promise<RekapRow[]> {
  if (hasDb && db) {
    const [res, lhekMap, excluded, rangkap, riwayat] = await Promise.all([
      db
        .from("rekap")
        .select("id, no, nama, entitas, jabatan, status, skor, bulan, catatan, kategori_bod")
        .order("status")
        .order("entitas", { ascending: true, nullsFirst: false })
        .order("no"),
      lhekMapByEntitas(),
      opts.includeExcluded ? Promise.resolve(new Set<string>()) : excludedSet(),
      rangkapSet(),
      riwayatNamaSet(),
    ])
    const rows = (res.data ?? []) as (Omit<RekapRow, "foto" | "lhek" | "rangkap" | "kategoriBod" | "hasRiwayat"> & { kategori_bod: string | null })[]
    return rows
      .filter((r) => opts.includeExcluded || !excluded.has(r.nama))
      .map(({ kategori_bod, ...r }) => ({ ...r, skor: n(r.skor), foto: photoFor(r.nama), lhek: r.entitas ? lhekMap[r.entitas] ?? null : null, rangkap: rangkap.has(r.nama), kategoriBod: kategori_bod ?? null, hasRiwayat: riwayat.has(r.nama) }))
  }
  // fallback (data.json tanpa id) → id sintetis berurutan
  const rangkap = await rangkapSet()
  return (raw.rekap as Omit<RekapRow, "id" | "foto" | "lhek" | "rangkap" | "kategoriBod" | "hasRiwayat">[]).map((r, i) => ({ ...r, id: i + 1, skor: n(r.skor), foto: photoFor(r.nama), lhek: null, rangkap: rangkap.has(r.nama), kategoriBod: null, hasRiwayat: false }))
}

export async function getKertasKerja(opts: DataOpts = {}): Promise<KertasRow[]> {
  if (hasDb && db) {
    const [res, lhekMap, excluded] = await Promise.all([
      db
        .from("kertas_kerja")
        .select("id, no, entitas, nama, jabatan, keterangan, awal, akhir, hari, bulan, skor")
        .order("id"),
      lhekMapByEntitas(),
      opts.includeExcluded ? Promise.resolve(new Set<string>()) : excludedSet(),
    ])
    const rows = (res.data ?? []) as Omit<KertasRow, "foto" | "lhek">[]
    return rows
      .filter((r) => opts.includeExcluded || !excluded.has(r.nama))
      .map((r) => ({ ...r, skor: n(r.skor), foto: photoFor(r.nama), lhek: r.entitas ? lhekMap[r.entitas] ?? null : null }))
  }
  return (raw.kertas_kerja as Omit<KertasRow, "id" | "foto" | "lhek">[]).map((r, i) => ({ ...r, id: i + 1, skor: n(r.skor), foto: photoFor(r.nama), lhek: null }))
}

export type Summary = {
  total: number
  dinilai: number
  belum: number
  rataRata: number | null
  tertinggi: RekapRow | null
  terendah: RekapRow | null
  pkwt: number
  pkwtt: number
  entitas: number
}

export function summarize(rows: RekapRow[]): Summary {
  const dinilai = rows.filter((r) => r.skor != null)
  const skor = dinilai.map((r) => r.skor as number)
  const sorted = [...dinilai].sort((a, b) => (b.skor as number) - (a.skor as number))
  return {
    total: rows.length,
    dinilai: dinilai.length,
    belum: rows.length - dinilai.length,
    rataRata: skor.length ? skor.reduce((a, b) => a + b, 0) / skor.length : null,
    tertinggi: sorted[0] ?? null,
    terendah: sorted[sorted.length - 1] ?? null,
    pkwt: rows.filter((r) => r.status === "PKWT").length,
    pkwtt: rows.filter((r) => r.status === "PKWTT").length,
    entitas: new Set(rows.map((r) => r.entitas).filter(Boolean)).size,
  }
}

// ── Detail per orang ──
export type PejabatDetail = {
  nama: string
  rekap: RekapRow[]          // umumnya 1; bisa 2 bila ada entri PKWT & PKWTT
  assignments: KertasRow[]   // semua baris kertas kerja milik orang ini
  excluded: boolean          // dikecualikan dari penilaian?
  riwayat: RiwayatRow[]      // riwayat penilaian tahun-tahun sebelumnya
}

export async function getPejabat(nama: string): Promise<PejabatDetail | null> {
  // includeExcluded agar detail tetap bisa dibuka meski pejabat dikecualikan
  const [rekap, kk, exSet, riwayat] = await Promise.all([
    getRekap({ includeExcluded: true }),
    getKertasKerja({ includeExcluded: true }),
    excludedSet(),
    getRiwayat(nama),
  ])
  const r = rekap.filter((x) => x.nama === nama)
  const a = kk.filter((x) => x.nama === nama)
  if (!r.length && !a.length) return null
  return { nama, rekap: r, assignments: a, excluded: exSet.has(nama), riwayat }
}

// ── Daftar pengelolaan pejabat (semua orang + status dikecualikan) ──
export type KelolaRow = {
  nama: string
  entitas: string | null
  jabatan: string | null
  status: "PKWT" | "PKWTT"
  skor: number | null
  foto: string | null
  excluded: boolean
  alasan: string | null
}

export async function getPejabatKelola(): Promise<KelolaRow[]> {
  const [rekap, ex] = await Promise.all([getRekap({ includeExcluded: true }), getExcluded()])
  const exMap = new Map(ex.map((e) => [e.nama, e.alasan]))
  return rekap.map((r) => ({
    nama: r.nama, entitas: r.entitas, jabatan: r.jabatan, status: r.status, skor: r.skor, foto: r.foto,
    excluded: exMap.has(r.nama), alasan: exMap.get(r.nama) ?? null,
  }))
}

// kelompok entitas → induk (PTPN I / PTPN IV / Anak Perusahaan) untuk ringkasan
export function indukOf(entitas: string | null): string {
  if (!entitas) return "Lainnya"
  if (entitas.startsWith("PTPN I -")) return "PTPN I (SupportingCo)"
  if (entitas.startsWith("PTPN IV")) return "PTPN IV (PalmCo)"
  return "Anak Perusahaan"
}
