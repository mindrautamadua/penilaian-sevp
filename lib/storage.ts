// Klien Supabase Storage (server-only). Pakai service role key — JANGAN
// diimpor dari komponen client. Bucket 'lhek' bersifat privat; akses file
// lewat signed URL berdurasi pendek.

import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
export const LHEK_BUCKET = process.env.LHEK_BUCKET ?? "lhek"

const g = globalThis as unknown as { __sevpStorage?: ReturnType<typeof createClient> }

export const storage =
  url && key
    ? (g.__sevpStorage ??= createClient(url, key, { auth: { persistSession: false } }))
    : null

export const hasStorage = Boolean(storage)

export async function uploadLhek(path: string, body: ArrayBuffer | Buffer, contentType = "application/pdf") {
  if (!storage) throw new Error("Supabase Storage belum dikonfigurasi.")
  const { error } = await storage.storage.from(LHEK_BUCKET).upload(path, body, { contentType, upsert: false })
  if (error) throw error
}

export async function removeLhek(path: string) {
  if (!storage) throw new Error("Supabase Storage belum dikonfigurasi.")
  const { error } = await storage.storage.from(LHEK_BUCKET).remove([path])
  if (error) throw error
}

// URL bertanda tangan untuk membuka/mengunduh (default 1 jam).
export async function signedLhekUrl(path: string, expiresIn = 3600): Promise<string | null> {
  if (!storage) return null
  const { data, error } = await storage.storage.from(LHEK_BUCKET).createSignedUrl(path, expiresIn)
  if (error) return null
  return data.signedUrl
}
