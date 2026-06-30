import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findUser } from "@/lib/auth"
import { sql } from "@/lib/db"
import { signedLhekUrl } from "@/lib/storage"

// Buka dokumen LHEK: validasi sesi → buat signed URL → redirect.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  if (!user) return NextResponse.json({ error: "Tidak berwenang" }, { status: 401 })
  if (!sql) return NextResponse.json({ error: "Database tidak tersedia" }, { status: 503 })

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })

  const rows = await sql<{ path: string }[]>`select path from lhek_doc where id=${id}`
  if (!rows[0]) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 })

  const url = await signedLhekUrl(rows[0].path, 3600)
  if (!url) return NextResponse.json({ error: "Gagal membuat tautan" }, { status: 500 })
  return NextResponse.redirect(url)
}
