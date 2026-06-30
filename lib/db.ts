import postgres from "postgres"

// Klien PostgreSQL tunggal (singleton agar aman terhadap HMR di dev).
const url = process.env.DATABASE_URL

// SSL hanya bila diminta lewat sslmode; untuk localhost biasanya tidak perlu.
const ssl = url && /sslmode=(require|verify)/.test(url) ? { rejectUnauthorized: false } : undefined

const g = globalThis as unknown as { __sevpSql?: ReturnType<typeof postgres> }

export const sql = url
  ? (g.__sevpSql ??= postgres(url, { ssl, prepare: false, idle_timeout: 20 }))
  : null

export const hasDb = Boolean(sql)
