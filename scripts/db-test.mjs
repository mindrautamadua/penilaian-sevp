// Uji koneksi ke PostgreSQL Datacomm. Jalankan: npm run db:test
import postgres from "postgres"
import { loadEnv, makeSslOpt } from "./_env.mjs"

loadEnv()
const url = process.env.DATABASE_URL
const sql = postgres(url, { ssl: makeSslOpt(url), prepare: false, idle_timeout: 5, connect_timeout: 10 })

try {
  const [{ now, db, ver }] = await sql`select now() as now, current_database() as db, version() as ver`
  console.log("✓ Koneksi BERHASIL")
  console.log("  Database :", db)
  console.log("  Waktu    :", now)
  console.log("  Versi    :", String(ver).split(",")[0])
  const tables = await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`
  console.log("  Tabel    :", tables.length ? tables.map(t => t.table_name).join(", ") : "(belum ada)")
} catch (e) {
  console.error("✗ Koneksi GAGAL:", e.message)
  process.exitCode = 1
} finally {
  await sql.end()
}
