// Perbaiki PRESISI skor item KPI Kolegial dari kolom "Skor Realisasi KPI" di Excel,
// TANPA mengubah label/target/realisasi (tetap pakai teks rapi hasil seed PDF).
// Hanya untuk entitas yang nilainya identik dgn PDF (sekadar pembulatan):
//   LPP (101,12 → 101,13). KINRA & PTPN IV TIDAK disertakan (nilai Excel beda dari PDF).
// Pencocokan berdasarkan urutan baris; abort bila jumlah item tak sama.
// Jalankan: node scripts/seed-kpi-kolegial-xlsx.mjs
import XLSX from "xlsx"
import postgres from "postgres"
import { loadEnv, makeSslOpt } from "./_env.mjs"

loadEnv()
const sql = postgres(process.env.DATABASE_URL, { ssl: makeSslOpt(process.env.DATABASE_URL), prepare: false })

const WB = "Penilaian Kinerja PTPN Group 2025 revvv.xlsx"
const TAHUN = 2025

const CONFIG = [
  { judul: "KPI Kolegial PT LPP Agro Nusantara", sheet: "LPP", skorIdx: 16 },
]

// Daftar skor item (presisi penuh) dari kolom Kolegial, urut sesuai sheet.
function skorList(sheet, skorIdx) {
  const R = XLSX.utils.sheet_to_json(XLSX.readFile(WB).Sheets[sheet], { header: 1, raw: true, defval: null })
  const out = []
  for (const r of R) {
    const ind = r[1]
    if (ind == null || String(ind).trim() === "" || /^total$/i.test(String(ind).trim())) continue
    const s = r[skorIdx]
    if (typeof s === "number") out.push(s)
  }
  return out
}

try {
  for (const cfg of CONFIG) {
    const set = (await sql`select id from kpi_kolegial where judul=${cfg.judul} and tahun=${TAHUN}`)[0]
    if (!set) { console.warn(`! set "${cfg.judul}" tak ditemukan`); continue }
    const items = await sql`select id, urut, skor from kpi_item where set_id=${set.id} order by urut, id`
    const skors = skorList(cfg.sheet, cfg.skorIdx)
    if (items.length !== skors.length) {
      console.warn(`! ${cfg.judul}: jumlah item DB (${items.length}) ≠ Excel (${skors.length}) — dilewati`)
      continue
    }
    const before = items.reduce((a, b) => a + Number(b.skor), 0)
    await sql.begin(async (tx) => {
      for (let i = 0; i < items.length; i++) {
        await tx`update kpi_item set skor=${skors[i]} where id=${items[i].id}`
      }
      await tx`update kpi_kolegial set updated_at=now() where id=${set.id}`
    })
    const [{ total }] = await sql`select round(coalesce(sum(skor),0),2) total from kpi_item where set_id=${set.id}`
    console.log(`✓ ${cfg.judul} — presisi skor diperbarui (${before.toFixed(2)} → total ${total})`)
  }
  console.log("Selesai.")
} catch (e) {
  console.error("✗ GAGAL:", e.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
