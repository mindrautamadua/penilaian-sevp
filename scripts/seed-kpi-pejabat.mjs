// Seed breakdown KPI per individu (sesuai jabatan) dari sheet entitas pada workbook Excel.
// Tiap orang memakai kolom bobot/%capaian/skor sesuai jabatannya pada sheet.
// Tambah entitas baru cukup dengan menambah entri pada CONFIG.
// Jalankan: node scripts/seed-kpi-pejabat.mjs
import XLSX from "xlsx"
import postgres from "postgres"
import { loadEnv, makeSslOpt } from "./_env.mjs"

loadEnv()
const sql = postgres(process.env.DATABASE_URL, { ssl: makeSslOpt(process.env.DATABASE_URL), prepare: false })

const WB = "Penilaian Kinerja PTPN Group 2025 revvv.xlsx"
const TAHUN = 2025

// Kolom (0-based) sumber pada tiap sheet. Kolom kiri (indikator..polaritas) sama;
// blok kanan per jabatan = [bobot, %capaian, skor].
const CONFIG = [
  {
    sheet: "LPP",
    entitas: "PT LPPAN",
    left: { indikator: 1, satuan: 4, target: 5, realisasi: 6, polaritas: 7 },
    jabatanCols: {
      "Direktur": [14, 15, 16],            // kolom Kolegial
      "SEVP Operation": [21, 22, 23],
      "SEVP Business Support": [24, 25, 26],
    },
    orang: [
      { nama: "Pranoto Hadi Raharjo", jabatan: "Direktur" },
      { nama: "Pugar Indriawan", jabatan: "SEVP Operation" },
      { nama: "Sosiawan Hary Kustanto", jabatan: "SEVP Business Support" },
    ],
  },
  {
    sheet: "IKN",
    entitas: "PT IKN",
    left: { indikator: 1, satuan: 4, target: 5, realisasi: 6, polaritas: 7 },
    jabatanCols: {
      "Direktur": [15, 16, 17],            // kolom Kolegial (sheet IKN bergeser +1)
      "SEVP Operation": [22, 23, 24],
      "SEVP Business Support": [25, 26, 27],
    },
    orang: [
      { nama: "Amalia Nasution", jabatan: "SEVP Operation" },
      { nama: "Muhammad Zulham Rambe", jabatan: "Direktur" },
      { nama: "VT Moses Situmorang", jabatan: "Direktur" },
    ],
  },
  {
    sheet: "KINRA",
    entitas: "PT KINRA",
    left: { indikator: 1, satuan: 4, target: 5, realisasi: 6, polaritas: 7 },
    jabatanCols: {
      "Direktur": [16, 17, 18],            // kolom Kolegial
      "SEVP Operation": [23, 24, 25],
      "SEVP Business Support": [26, 27, 28],
    },
    orang: [
      { nama: "VT Moses Situmorang", jabatan: "Direktur" },
      { nama: "Arif Budiman", jabatan: "Direktur" },
      { nama: "Alwin Abdi", jabatan: "SEVP Business Support" },
      { nama: "Kennedy Nasib P. Sibarani", jabatan: "SEVP Operation" },
    ],
  },
]

const txt = (v) => (v == null ? null : String(v).trim() || null)
const num = (v) => {
  const s = String(v ?? "").replace(/[^\d.\-]/g, "")
  if (s === "" || s === "-") return null
  const x = Number(s)
  return Number.isFinite(x) ? x : null
}

// Baris item = punya skor pada kolom Kolegial (skorIdx). Tangani:
// - header perspektif (col0 "A.1 …")
// - indikator induk bergrup (col0 angka, tanpa skor) → jadi prefix sub-indikatornya
// - baris TOTAL diabaikan
function readItems(sheet, left, skorIdx) {
  const ws = XLSX.readFile(WB).Sheets[sheet]
  const rowsF = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: null }) // teks terformat (tanggal, %)
  const rowsR = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null })  // angka presisi penuh
  const items = []
  let perspektif = null
  let parent = null
  for (let i = 0; i < rowsF.length; i++) {
    const r = rowsF[i]
    const rn = rowsR[i] || []
    const c0 = r[0] == null ? "" : String(r[0]).trim()
    if (/^[A-E]\./.test(c0)) { perspektif = c0.replace(/\s+/g, " "); parent = null; continue }

    const indikator = txt(r[left.indikator])
    if (!indikator || /^total$/i.test(indikator)) continue
    const skor = numAt(rn[skorIdx])        // deteksi item dari skor mentah Kolegial
    const numbered = /^\d+$/.test(c0)

    if (numbered) parent = null            // baris bernomor → mulai segar
    if (skor == null) {                    // tak ada skor
      if (numbered) parent = indikator     // → indikator induk grup
      continue
    }
    const sub = indikator.replace(/^[a-z]\.\s*/i, "")  // buang "a. " / "b. "
    items.push({
      perspektif,
      indikator: parent ? `${parent} — ${sub}` : indikator,
      satuan: txt(r[left.satuan]),
      target: txt(r[left.target]),
      realisasi: txt(r[left.realisasi]),
      polaritas: txt(r[left.polaritas]),
      raw: r,        // terformat → untuk capaian "79,5%"
      rawNum: rn,    // mentah → untuk bobot & skor presisi penuh
    })
  }
  return items
}

const numAt = (v) => {
  if (typeof v === "number") return v
  return num(v)
}

try {
  let totalRows = 0
  for (const cfg of CONFIG) {
    const skorIdx = cfg.jabatanCols["Direktur"][2]   // kolom skor Kolegial = penanda baris item
    const items = readItems(cfg.sheet, cfg.left, skorIdx)
    for (const o of cfg.orang) {
      const cols = cfg.jabatanCols[o.jabatan]
      if (!cols) { console.warn(`! ${o.nama}: jabatan "${o.jabatan}" tak ada kolomnya, dilewati`); continue }
      const [bi, ci, si] = cols
      await sql`delete from kpi_pejabat where nama=${o.nama} and entitas=${cfg.entitas} and tahun=${TAHUN}`
      let urut = 0, sum = 0
      for (const it of items) {
        urut += 1
        const bobot = numAt(it.rawNum[bi]), skor = numAt(it.rawNum[si]), capaian = txt(it.raw[ci])
        sum += skor ?? 0
        await sql`
          insert into kpi_pejabat (nama, jabatan, entitas, tahun, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, capaian, skor)
          values (${o.nama}, ${o.jabatan}, ${cfg.entitas}, ${TAHUN}, ${urut}, ${it.perspektif}, ${it.indikator}, ${it.satuan},
                  ${it.target}, ${it.realisasi}, ${it.polaritas}, ${bobot}, ${capaian}, ${skor})`
      }
      totalRows += items.length
      console.log(`✓ [${cfg.entitas}] ${o.nama} (${o.jabatan}) — ${items.length} indikator, total ${sum.toFixed(2)}`)
    }
  }
  console.log(`Selesai. ${totalRows} baris.`)
} catch (e) {
  console.error("✗ Seed GAGAL:", e.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
