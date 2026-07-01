// Seed riwayat penilaian 2023 & 2024 (dari Lampiran REKAPITULASI PENILAIAN SEVP 2023 & 2024).
// Jalankan: node scripts/seed-riwayat.mjs
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/)
  if (m) process.env[m[1]] ??= m[2]
}
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const ON = "ON TARGET", AB = "ABOVE TARGET"
// [perusahaan, nama, jabatan, entitas, n23,r23,g23,pg23, n24,r24,g24,pg24]  (g/pg "NG" → null)
const D = [
  ["PTPN I", "Asep Sontani", "SEVP Operation R5", "PTPN I", 85.44, ON, "IVD/4", "16", 92.15, AB, "IVD/6", "16"],
  ["PTPN I", "Benny Sandjaya", "SEVP Business Support R5", "PTPN I", 87.35, ON, "IVC/2", "17", 91.65, AB, "IVC/4", "17"],
  ["PTPN I", "Budiyono", "SEVP Operation R3", "PTPN I", 86.38, ON, "IVD/6", "16", 89.04, ON, "IVD/6", "16"],
  ["PTPN I", "Dedy Gurning", "SEVP Operation II R2", "PTPN IV", 78.96, ON, "IVC/4", "17", 101.44, AB, "IVC/6", "17"],
  ["PTPN I", "Dimas Eko Prasetyo", "SEVP Strategic Business", "PT SGN", 94.90, AB, "IVC/0", "17", 97.13, AB, "IVC/2", "17"],
  ["PTPN I", "Febri Ari Marpaung", "SEVP Operasional KSO", "PT SGN", 97.86, AB, "IVC/1", "17", 92.68, AB, "IVC/3", "17"],
  ["PTPN I", "Imam Cipto Suyitno", "SEVP Koordinasi KSO", "PT SGN", 94.90, AB, "IVD/4", "17", 94.50, AB, "IVD/6", "17"],
  ["PTPN I", "Kennedy Nasib P. Sibarani", "SEVP Operation", "PT KINRA", 135.00, AB, "IVC/9", "17", 99.72, AB, "IVD/0", "17"],
  ["PTPN I", "Maalun Lamau", "SEVP Business Support R8", "PTPN I", 86.21, ON, "IVD/2", "15", 71.12, ON, "IVD/4", "16"],
  ["PTPN I", "Okta Kurniawan", "SEVP Business Support R2", "PTPN I", 85.96, ON, "IVD/4", "18", 95.51, AB, "IVD/4", "18"],
  ["PTPN I", "Subagiyo", "Region Head R4", "PTPN I", 73.88, ON, "IVD/2", "17", 88.92, ON, "IVD/4", "17"],
  ["PTPN I", "Ir Tengku Zein Ichwan", "SEVP Operation R6", "PTPN IV", 87.06, ON, "IVD/6", "16", 83.97, ON, "IVD/6", "16"],
  ["PTPN I", "Winarto", "Region Head R5", "PTPN I", 91.18, AB, "IVD/4", "17", 91.52, AB, "IVD/6", "17"],
  ["PTPN I", "Wiyoso", "SEVP Operation R7", "PTPN I", 81.56, ON, "IVD/3", "16", 95.77, AB, "IVD/4", "17"],
  ["PTPN IV", "Achmedi Akbar", "SEVP Business Support R4", "PTPN IV", 97.53, AB, "IVD/6", "16", 96.94, AB, "IVD/6", "16"],
  ["PTPN IV", "Ahmad Diponegoro", "SEVP Business Support R3", "PTPN IV", 63.09, ON, "IVD/6", "22", 82.29, ON, "IVD/6", "22"],
  ["PTPN IV", "Alwin Abdi", "SEVP Business Support", "PT KINRA", 135.00, AB, "IVD/6", "19", 99.57, AB, "IVD/6", "19"],
  ["PTPN IV", "Amalia Nasution", "SEVP Operation", "PT IKN", 80.00, ON, "IVD/6", "20", 79.26, ON, "IVD/6", "20"],
  ["PTPN IV", "Arief Subhan Siregar", "SEVP Operation I R2", "PTPN IV", 97.18, AB, "IVD/6", "19", 93.07, AB, "IVD/6", "19"],
  ["PTPN IV", "Arif Budiman", "SEVP Operation", "PT KPBN", 103.80, AB, "IVD/6", "20", 81.93, ON, "IVD/6", "20"],
  ["PTPN IV", "Bambang Agustian", "SEVP Business Support R7", "PTPN I", 95.83, AB, "IVC/5", "18", 98.45, AB, "IVC/7", "19"],
  ["PTPN IV", "Budi Susilo", "SEVP Operation I R1", "PTPN IV", 78.80, ON, "IVD/0", "18", 97.09, AB, "IVD/2", "19"],
  ["PTPN IV", "Budi Susanto", "SEVP Business Support R2", "PTPN IV", 95.90, AB, "IVD/6", "19", 98.04, AB, "IVD/6", "19"],
  ["PTPN IV", "Darmansyah Siregar", "SEVP Operation I R5", "PTPN IV", 95.00, AB, "IVD/6", "20", 73.51, ON, "IVD/6", "20"],
  ["PTPN IV", "Fauzi Chairul Fitrie", "SEVP Operation", "PT SPMN", 103.80, AB, "IVD/6", "19", 88.85, ON, "IVD/6", "19"],
  ["PTPN IV", "Ganda Wiatmaja", "SEVP Aset R1", "PTPN I", 92.00, AB, "IVC/6", "18", 83.47, ON, "IVC/8", "19"],
  ["PTPN IV", "Ifri Handi Lubis", "SEVP Business Support R4", "PTPN IV", 99.37, AB, "IVC/4", "18", 95.81, AB, "IVC/6", "19"],
  ["PTPN IV", "Ihsan", "SEVP Operation II R5", "PTPN IV", 81.38, ON, "IVC/7", "16", 64.58, ON, "IVC/9", "17"],
  ["PTPN IV", "Iskandar Dewantara", "SEVP Business Support", "PT KPBN", 103.80, AB, "IVD/4", "19", 79.89, ON, "IVD/6", "19"],
  ["PTPN IV", "Iyan Heryanto", "SEVP Operation", "PTPN I", 81.20, ON, "IVD/2", "15", 96.97, AB, "IVD/4", "16"],
  ["PTPN IV", "Khayamuddin Panjaitan", "Region Head R5", "PTPN IV", 58.44, ON, "IVD/4", "18", 62.85, ON, "IVD/6", "18"],
  ["PTPN IV", "Muhammad Zulham Rambe", "SEVP Business Support R5", "PTPN IV", 89.00, ON, "IVD/4", "16", 61.12, ON, "IVD/6", "16"],
  ["PTPN IV", "Oshutri Anwar", "SEVP Operation R7", "PTPN IV", 89.00, ON, "IVD/6", "20", 80.83, ON, "IVD/6", "20"],
  ["PTPN IV", "Sudarma Bhakti Lessan", "Region Head R2", "PTPN IV", 95.00, AB, "IVD/6", "20", 99.74, AB, "IVD/6", "20"],
  ["PTPN IV", "Wispramono Budiman", "SEVP Business Support R1", "PT INL", 59.67, ON, "IVD/4", "18", 81.87, ON, "IVD/6", "19"],
  ["PTPN IV", "Yudhi Cahyadi", "SEVP Operation R3", "PTPN IV", 95.00, AB, "IVD/6", "22", 88.72, ON, "IVD/6", "22"],
  ["PT RPN", "Edy Suprianto", "SEVP Business Support", "PT RPN", 111.00, AB, "IVC/6", null, 88.92, ON, "IVC/8", null],
  ["PT RPN", "Muhammad Edwin Syahputra", "SEVP Riset, Inovasi, dan Sustainability", "PT RPN", 111.00, AB, "IVD/6", null, 86.33, ON, "IVD/6", null],
  ["PT LPPAN", "Pugar Indriawan", "SEVP Operation", "PT LPPAN", 100.00, AB, "IVC/8", "16", 103.65, AB, "IVD/0", "17"],
  ["PKWT", "Tengku Rinel", "SEVP Business Support R1", "PTPN IV", 95.00, AB, "IVD/6", "20", 90.28, AB, null, null],
  ["PKWT", "Ahmad Gusmar Harahap", "Region Head R1", "PTPN IV", 84.49, ON, null, null, 91.51, AB, null, null],
  ["PKWT", "Bambang Eko Prasetyo", "SEVP Business Support R7", "PTPN IV", 94.90, AB, null, null, 72.92, ON, null, null],
  ["PKWT", "Dede Kusdiman", "SEVP Operation", "PT BIN", 89.00, ON, null, null, 71.84, ON, null, null],
  ["PKWT", "Denny Ramadhan Nasution", "Region Head R7", "PTPN IV", 68.73, ON, null, null, 90.09, AB, null, null],
  ["PKWT", "Desmanto", "Region Head R2", "PTPN I", 92.09, AB, null, null, 88.96, ON, null, null],
  ["PKWT", "Joni Raja Siregar", "SEVP Operation II R1", "PTPN IV", 95.90, AB, null, null, 92.74, AB, null, null],
  ["PKWT", "Misnawi", "SEVP Operation II", "PT RPN", 111.00, AB, null, null, 94.17, AB, null, null],
  ["PKWT", "Ospin Sembiring", "Region Head R4", "PTPN IV", 99.10, AB, null, null, 96.37, AB, null, null],
  ["PKWT", "Rurianto", "Region Head R3", "PTPN IV", 99.10, AB, null, null, 83.49, ON, null, null],
  ["PKWT", "Sosiawan Hary Kustanto", "SEVP Business Support", "PT LPPAN", 100.00, AB, null, null, 102.04, AB, null, null],
  ["PKWT", "Syahriadi Siregar", "Region Head R6", "PTPN IV", 63.12, ON, null, null, 84.17, ON, null, null],
  ["PKWT", "Tjahjono Herawan", "SEVP Operation I", "PT RPN", 111.00, AB, null, null, 97.68, AB, null, null],
  ["PKWT", "Tri Septiono", "Region Head R3", "PTPN I", 89.85, ON, null, null, 91.33, AB, null, null],
  ["PKWT", "Tuhu Bangun", "Region Head R7", "PTPN I", 95.89, AB, null, null, 95.61, AB, null, null],
  ["PKWT", "R Tulus Panduwidjaja", "Region Head R8", "PTPN I", 80.33, ON, null, null, 74.11, ON, null, null],
  ["LEMBAGA LAIN", "Didik Prasetyo", "Region Head R1", "PTPN I", 90.96, AB, null, null, 82.15, ON, null, null],
  ["LEMBAGA LAIN", "Pulung Rinandoro", "SEVP Aset R2", "PTPN I", 68.86, ON, null, null, 96.97, AB, null, null],
]

const rows = []
for (const [perusahaan, nama, jabatan, entitas, n23, r23, g23, pg23, n24, r24, g24, pg24] of D) {
  rows.push({ nama, tahun: 2023, nilai: n23, rating: r23, golongan: g23, grade: pg23, perusahaan, jabatan, entitas })
  rows.push({ nama, tahun: 2024, nilai: n24, rating: r24, golongan: g24, grade: pg24, perusahaan, jabatan, entitas })
}

const { error } = await db.from("riwayat_penilaian").upsert(rows, { onConflict: "nama,tahun" })
if (error) { console.error("✗ GAGAL:", error.message); process.exit(1) }
console.log(`✓ Riwayat tersimpan: ${rows.length} baris (${D.length} pejabat × 2 tahun).`)
