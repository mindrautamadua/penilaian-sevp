import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { findUser } from "@/lib/auth"
import { db } from "@/lib/supabase"
import { signedLhekUrl } from "@/lib/storage"

// Buka dokumen LHEK: validasi sesi → buat signed URL → redirect.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  if (!user) return NextResponse.json({ error: "Tidak berwenang" }, { status: 401 })
  if (!db) return NextResponse.json({ error: "Database tidak tersedia" }, { status: 503 })

  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })

  const { data } = await db.from("lhek_doc").select("path").eq("id", id).maybeSingle()
  if (!data) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 })

  const url = await signedLhekUrl((data as { path: string }).path, 3600)
  if (!url) return NextResponse.json({ error: "Gagal membuat tautan" }, { status: 500 })
  return NextResponse.redirect(url)
}
