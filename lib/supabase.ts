// Klien Supabase (server-only) untuk akses data lewat PostgREST + service role key.
// Berbasis HTTP — tidak ada batas koneksi pool seperti koneksi Postgres langsung.
// JANGAN diimpor dari komponen client (memakai service role).
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

// Tanpa tipe Database hasil-generate, pakai skema permisif agar insert/update
// menerima objek biasa (bukan `never`).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDb = SupabaseClient<any, "public", any>

const g = globalThis as unknown as { __sevpDb?: AnyDb }

export const db: AnyDb | null =
  url && key
    ? (g.__sevpDb ??= createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        db: { schema: "public" },
      }))
    : null

export const hasDb = Boolean(db)
