// Loader .env.local portabel (tanpa dependensi).
import { readFileSync } from "node:fs"

export function loadEnv() {
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "")
    }
  } catch {
    // .env.local belum ada
  }
  if (!process.env.DATABASE_URL) {
    console.error("✗ DATABASE_URL belum diisi. Salin .env.example → .env.local lalu isi koneksinya.")
    process.exit(1)
  }
}

export function makeSslOpt(url) {
  return /sslmode=(require|verify)/.test(url) ? { rejectUnauthorized: false } : undefined
}
