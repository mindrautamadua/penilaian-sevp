// Seed data Penilaian SEVP 2025 dari db/data.json (hasil ekstraksi tab "Kertas Kerja").
// Jalankan: npm run db:seed
import { readFileSync } from "node:fs"
import postgres from "postgres"
import { loadEnv, makeSslOpt } from "./_env.mjs"

loadEnv()
const url = process.env.DATABASE_URL
const sql = postgres(url, { ssl: makeSslOpt(url), prepare: false })

const data = JSON.parse(readFileSync(new URL("../db/data.json", import.meta.url), "utf8"))

try {
  await sql.begin(async (tx) => {
    await tx`truncate table kertas_kerja restart identity`
    await tx`truncate table rekap restart identity`

    for (const k of data.kertas_kerja) {
      await tx`insert into kertas_kerja (no, entitas, nama, jabatan, keterangan, awal, akhir, hari, bulan, skor, rangkap)
        values (${k.no}, ${k.entitas}, ${k.nama}, ${k.jabatan}, ${k.keterangan},
                ${k.awal}, ${k.akhir}, ${k.hari}, ${k.bulan}, ${k.skor}, ${k.rangkap})`
    }

    for (const r of data.rekap) {
      await tx`insert into rekap (no, nama, entitas, jabatan, status, skor, bulan, catatan)
        values (${r.no}, ${r.nama}, ${r.entitas}, ${r.jabatan}, ${r.status}, ${r.skor}, ${r.bulan}, ${r.catatan})`
    }
  })

  const [{ kk }] = await sql`select count(*)::int as kk from kertas_kerja`
  const [{ rk }] = await sql`select count(*)::int as rk from rekap`
  console.log(`✓ Seed selesai — kertas_kerja: ${kk} baris, rekap: ${rk} baris`)
} catch (e) {
  console.error("✗ Seed GAGAL:", e.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
