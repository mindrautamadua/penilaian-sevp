// Resolusi foto pejabat (server-only). File ada di public/foto/<slug>.<ext>.
// Nama → slug diambil dari public/foto/_targets.json; slug → file dari isi folder.
import { readdirSync, readFileSync } from "node:fs"
import { join, extname, basename } from "node:path"

const FOTO_DIR = join(process.cwd(), "public", "foto")
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"])

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

type Maps = { byName: Record<string, string>; bySlug: Record<string, string> }
let cache: Maps | null = null

function build(): Maps {
  if (cache) return cache
  const bySlug: Record<string, string> = {}
  const byName: Record<string, string> = {}
  try {
    for (const f of readdirSync(FOTO_DIR)) {
      if (f.startsWith("_") || f.startsWith(".")) continue
      const ext = extname(f).toLowerCase()
      if (!EXTS.has(ext)) continue
      bySlug[basename(f, extname(f))] = `/foto/${f}`
    }
    try {
      const targets = JSON.parse(readFileSync(join(FOTO_DIR, "_targets.json"), "utf8")) as { nama: string; slug: string }[]
      for (const t of targets) if (bySlug[t.slug]) byName[t.nama] = bySlug[t.slug]
    } catch {
      // _targets.json tidak ada → andalkan slugify saja
    }
  } catch {
    // folder foto belum ada
  }
  cache = { byName, bySlug }
  return cache
}

export function photoFor(nama: string | null | undefined): string | null {
  if (!nama) return null
  const m = build()
  return m.byName[nama] ?? m.bySlug[slugify(nama)] ?? null
}
