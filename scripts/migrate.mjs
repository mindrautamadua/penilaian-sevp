// Buat tabel dari db/schema.sql. Jalankan: npm run db:migrate
import { readFileSync } from "node:fs"
import postgres from "postgres"
import { loadEnv, makeSslOpt } from "./_env.mjs"

loadEnv()
const url = process.env.DATABASE_URL
const sql = postgres(url, { ssl: makeSslOpt(url), prepare: false })

try {
  const schema = readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")
  await sql.unsafe(schema)
  console.log("✓ Migrasi selesai (tabel kertas_kerja, rekap siap)")
} catch (e) {
  console.error("✗ Migrasi GAGAL:", e.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
