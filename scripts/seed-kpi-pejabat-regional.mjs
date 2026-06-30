// Seed breakdown KPI per individu untuk sheet REGIONAL (format "CASCADE REGION
// HEAD & SEVP", kolom RH / SEVP Op / SEVP BS).
// AUTO-MATCH: tiap penugasan (kertas kerja) dipetakan ke kolom yang skornya —
// setelah dibobot masa jabatan — menjumlah tepat ke skor final orang itu. Jadi
// breakdown selalu rekonsiliasi dgn skor final, tanpa menebak label jabatan.
// Stint "Plt" dilewati (tidak dinilai). Ekstraksi berbasis label header.
// Tambah regional cukup dengan menambah {sheet, entitas} pada CONFIG.
// Jalankan: node scripts/seed-kpi-pejabat-regional.mjs
import XLSX from "xlsx"
import postgres from "postgres"
import { loadEnv, makeSslOpt } from "./_env.mjs"

loadEnv()
const sql = postgres(process.env.DATABASE_URL, { ssl: makeSslOpt(process.env.DATABASE_URL), prepare: false })

const WB = "Penilaian Kinerja PTPN Group 2025 revvv.xlsx"
const TAHUN = 2025
const TOL = 0.02 // toleransi cocok skor

const ROLES = {
  RH: ["RH Bobot", "RH Skor"],
  "SEVP Op": ["SEVP Op Bobot", "SEVP Op Skor"],
  "SEVP BS": ["SEVP BS Bobot", "SEVP BS Skor"],
}

const CONFIG = [
  { sheet: "N1R1", entitas: "PTPN I - Regional 1" },
  { sheet: "N1R2", entitas: "PTPN I - Regional 2" },
  { sheet: "N1R3", entitas: "PTPN I - Regional 3" },
  { sheet: "N1R4", entitas: "PTPN I - Regional 4" },
  { sheet: "N1R5", entitas: "PTPN I - Regional 5" },
]

const txt = (v) => (v == null ? null : String(v).trim() || null)
const numAt = (v) => (typeof v === "number" ? v : null)
const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim()

function parseSheet(sheet) {
  const ws = XLSX.readFile(WB).Sheets[sheet]
  const F = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null })
  const R = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null })

  let hi = -1, realCol = -1
  F.forEach((r, i) => r.forEach((c, j) => {
    const s = String(c ?? "").trim()
    if (s === "RH Skor") hi = i
    if (s === "Realisasi 2025" && realCol < 0) realCol = j
  }))
  if (hi < 0) throw new Error(`${sheet}: header cascade tak ditemukan`)

  const H = {}
  F[hi].forEach((c, j) => { const s = String(c ?? "").trim(); if (s) H[s] = j })
  const col = (l) => H[l]

  const realMap = {}
  for (let k = 0; k < hi; k++) {
    const ind = txt(F[k]?.[1]), real = realCol >= 0 ? txt(F[k]?.[realCol]) : null
    if (ind && real != null) realMap[norm(ind)] = real
  }

  const items = []
  for (let k = hi + 1; k < F.length; k++) {
    const ind = txt(F[k]?.[col("Key Performance Indicator")])
    if (!ind) continue
    if (/^total$/i.test(ind)) break
    if (typeof R[k]?.[0] !== "number") continue
    const cols = {}
    for (const [role, [bL, sL]] of Object.entries(ROLES)) {
      cols[role] = { bobot: numAt(R[k][col(bL)]), skor: numAt(R[k][col(sL)]) }
    }
    items.push({
      perspektif: txt(F[k][col("Perspektif")]),
      indikator: ind,
      satuan: txt(F[k][col("Satuan")]),
      target: txt(F[k][col("Target")]),
      realisasi: realMap[norm(ind)] ?? null,
      polaritas: txt(F[k][col("Polaritas")]),
      capaian: txt(F[k][col("% Capaian")]),
      cols,
    })
  }
  const totals = {}
  for (const role of Object.keys(ROLES)) totals[role] = items.reduce((a, it) => a + (it.cols[role].skor ?? 0), 0)
  return { items, totals }
}

// cache sheet + pemilihan sheet sesuai sufiks regional pada jabatan (R4 → N1R4, dst).
const WBOOK = XLSX.readFile(WB)
const cache = {}
function getSheet(name) {
  if (!WBOOK.Sheets[name]) return null
  if (!cache[name]) cache[name] = parseSheet(name)
  return cache[name]
}
function sheetForJabatan(jabatan, defaultSheet) {
  const m = String(jabatan ?? "").match(/\bR(\d+)\b/)
  if (!m) return defaultSheet
  const prefix = defaultSheet.match(/^N\d/)?.[0] ?? "N1"   // N1 / N4
  const name = `${prefix}R${m[1]}`
  return WBOOK.Sheets[name] ? name : defaultSheet
}

try {
  let totalRows = 0
  for (const cfg of CONFIG) {
    const kertas = await sql`
      select nama, jabatan, bulan, skor::float8 as skor
      from kertas_kerja where entitas=${cfg.entitas} order by nama`
    await sql`delete from kpi_pejabat where entitas=${cfg.entitas} and tahun=${TAHUN}`

    for (const kk of kertas) {
      if (/^plt\b/i.test(kk.jabatan ?? "")) { console.log(`· lewati Plt: ${kk.nama} (${kk.jabatan})`); continue }
      const bln = kk.bulan ?? 12
      // Skor stint memakai sheet "rumah" entitas (termasuk stint rangkap lintas-
      // regional — lihat Subagiyo R4: stint SEVP BS R5 di-skor pakai BS sheet N1R4).
      const sheetName = cfg.sheet
      const parsed = getSheet(sheetName)
      if (!parsed) { console.warn(`! ${kk.nama} (${kk.jabatan}): sheet ${sheetName} tak ada — dilewati`); continue }
      const { items, totals } = parsed
      // cari kolom yang cocok: total × bln/12 ≈ skor kertas
      const matches = Object.keys(ROLES).filter((role) => Math.abs(totals[role] * (bln / 12) - kk.skor) < TOL)
      if (matches.length !== 1) {
        console.warn(`! ${kk.nama} (${kk.jabatan}, ${bln} bln, skor ${kk.skor}) @ ${sheetName}: cocok ${matches.length} kolom [${matches}] — dilewati, perlu manual`)
        continue
      }
      const role = matches[0]
      let urut = 0
      for (const it of items) {
        urut += 1
        await sql`
          insert into kpi_pejabat (nama, jabatan, entitas, tahun, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, capaian, skor)
          values (${kk.nama}, ${kk.jabatan}, ${cfg.entitas}, ${TAHUN}, ${urut}, ${it.perspektif}, ${it.indikator}, ${it.satuan},
                  ${it.target}, ${it.realisasi}, ${it.polaritas}, ${it.cols[role].bobot}, ${it.capaian}, ${it.cols[role].skor})`
      }
      totalRows += items.length
      console.log(`✓ [${cfg.entitas}] ${kk.nama} (${kk.jabatan}) → ${sheetName}/${role} — setahun ${totals[role].toFixed(2)} · ${bln} bln`)
    }
  }
  console.log(`Selesai. ${totalRows} baris.`)
} catch (e) {
  console.error("✗ GAGAL:", e.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
