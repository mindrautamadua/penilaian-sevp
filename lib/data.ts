import { db, hasDb } from "./supabase"
import { photoFor } from "./photos"
import { lhekMapByEntitas, type LhekRef } from "./lhek"
import { getRiwayat, riwayatNamaSet, latestGradeMap, latestGolonganMap, type RiwayatRow } from "./riwayat"
import { kolegialTotalByEntitas } from "./kpi"
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
  phdp: string | null          // usulan Golongan PhDP 2025 (tersimpan)
  phdpDefault: string | null   // Golongan PhDP terakhir dari riwayat (default tampilan)
  personGrade: string | null   // usulan Person Grade 2025 (tersimpan)
  personGradeDefault: string | null  // Person Grade terakhir dari riwayat (default tampilan)
  skorKolegial: boolean        // skor berasal dari KPI Kolegial LHEK (Direktur)
}

// Direktur dinilai kolegial: skor = total KPI Kolegial entitas (dari LHEK).
const isDirektur = (jabatan: string | null): boolean => /direktur|direksi/i.test(jabatan ?? "")

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

// Agregasi kertas kerja per nama (satu query):
// - rangkap: total bulan seluruh penugasan > 12 → menjabat bersamaan
// - bulanMax: masa jabatan terpanjang (dipakai sbg fallback bulan bila rekap null, mis. Direktur)
type KkAgg = { rangkap: Set<string>; bulanMax: Record<string, number> }
async function kkAgg(): Promise<KkAgg> {
  const rows = (db
    ? ((await db.from("kertas_kerja").select("nama, bulan")).data ?? [])
    : (raw.kertas_kerja as unknown[])) as { nama: string; bulan: number | null }[]
  const total = new Map<string, number>()
  const bulanMax: Record<string, number> = {}
  for (const r of rows) {
    const b = Number(r.bulan) || 0
    total.set(r.nama, (total.get(r.nama) ?? 0) + b)
    if (b > (bulanMax[r.nama] ?? 0)) bulanMax[r.nama] = b
  }
  const rangkap = new Set([...total].filter(([, b]) => b > 12).map(([nama]) => nama))
  return { rangkap, bulanMax }
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
    const [res, lhekMap, excluded, kk, riwayat, gradeDefault, golonganDefault, kolegial] = await Promise.all([
      db
        .from("rekap")
        .select("id, no, nama, entitas, jabatan, status, skor, bulan, catatan, kategori_bod, phdp, person_grade")
        .order("status")
        .order("entitas", { ascending: true, nullsFirst: false })
        .order("no"),
      lhekMapByEntitas(),
      opts.includeExcluded ? Promise.resolve(new Set<string>()) : excludedSet(),
      kkAgg(),
      riwayatNamaSet(),
      latestGradeMap(),
      latestGolonganMap(),
      kolegialTotalByEntitas(),
    ])
    const rows = (res.data ?? []) as (Omit<RekapRow, "foto" | "lhek" | "rangkap" | "kategoriBod" | "hasRiwayat" | "personGrade" | "personGradeDefault" | "phdpDefault" | "skorKolegial"> & { kategori_bod: string | null; person_grade: string | null })[]
    return rows
      .filter((r) => opts.includeExcluded || !excluded.has(r.nama))
      .map(({ kategori_bod, person_grade, ...r }) => {
        const raw = n(r.skor)
        // Direktur tanpa skor individu → pakai total KPI Kolegial entitas (dari LHEK).
        const kol = raw == null && isDirektur(r.jabatan) && r.entitas ? kolegial[r.entitas] ?? null : null
        return {
          ...r,
          skor: kol ?? raw,
          skorKolegial: kol != null,
          bulan: r.bulan ?? kk.bulanMax[r.nama] ?? null, // fallback masa jabatan dari kertas kerja (mis. Direktur)
          foto: photoFor(r.nama),
          lhek: r.entitas ? lhekMap[r.entitas] ?? null : null,
          rangkap: kk.rangkap.has(r.nama),
          kategoriBod: kategori_bod ?? null,
          hasRiwayat: riwayat.has(r.nama),
          personGrade: person_grade ?? null,
          personGradeDefault: gradeDefault[r.nama] ?? null,
          phdpDefault: golonganDefault[r.nama] ?? null,
        }
      })
  }
  // fallback (data.json tanpa id) → id sintetis berurutan
  const kk = await kkAgg()
  return (raw.rekap as Omit<RekapRow, "id" | "foto" | "lhek" | "rangkap" | "kategoriBod" | "hasRiwayat" | "phdp" | "phdpDefault" | "personGrade" | "personGradeDefault" | "skorKolegial">[]).map((r, i) => ({ ...r, id: i + 1, skor: n(r.skor), bulan: r.bulan ?? kk.bulanMax[r.nama] ?? null, foto: photoFor(r.nama), lhek: null, rangkap: kk.rangkap.has(r.nama), kategoriBod: null, hasRiwayat: false, phdp: null, phdpDefault: null, personGrade: null, personGradeDefault: null, skorKolegial: false }))
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
