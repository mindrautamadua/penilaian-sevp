"use server"
import { randomUUID } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { verifyCredentials, findUser, setPassword } from "@/lib/auth"
import { db } from "@/lib/supabase"
import { uploadLhek as storageUpload, removeLhek as storageRemove, hasStorage } from "@/lib/storage"

export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  const user = await verifyCredentials(username, password)
  if (!user) {
    redirect("/login?error=1")
  }

  const store = await cookies()
  store.set("sevp_auth", user.username, { httpOnly: true, sameSite: "lax", path: "/" })
  store.set("sevp_role", user.role, { httpOnly: true, sameSite: "lax", path: "/" })
  redirect("/")
}

export async function logout() {
  const store = await cookies()
  store.delete("sevp_auth")
  store.delete("sevp_role")
  redirect("/login")
}

export type EditState = { ok: boolean; error?: string; message?: string }

// Ubah skor (juga bulan & catatan) satu baris rekap. Hanya admin.
export async function updateRekapSkor(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang mengubah skor." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const id = Number(formData.get("id"))
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "ID rekap tidak valid." }

  const skorRaw = String(formData.get("skor") ?? "").trim().replace(",", ".")
  const bulanRaw = String(formData.get("bulan") ?? "").trim()
  const catatanRaw = String(formData.get("catatan") ?? "").trim()

  let skor: number | null = null
  if (skorRaw !== "") {
    skor = Number(skorRaw)
    if (!Number.isFinite(skor) || skor < 0 || skor > 200) {
      return { ok: false, error: "Skor harus angka antara 0 dan 200 (atau kosongkan)." }
    }
    skor = Math.round(skor * 10000) / 10000
  }

  let bulan: number | null = null
  if (bulanRaw !== "") {
    bulan = Number(bulanRaw)
    if (!Number.isInteger(bulan) || bulan < 0 || bulan > 12) {
      return { ok: false, error: "Bulan harus bilangan bulat 0–12 (atau kosongkan)." }
    }
  }

  const catatan = catatanRaw === "" ? null : catatanRaw

  const { data, error } = await db.from("rekap").update({ skor, bulan, catatan }).eq("id", id).select("id")
  if (error) return { ok: false, error: "Gagal menyimpan: " + error.message }
  if (!data || data.length === 0) return { ok: false, error: "Baris rekap tidak ditemukan." }

  // halaman force-dynamic, tapi revalidasi untuk jaga-jaga
  revalidatePath("/", "layout")
  return { ok: true, message: "Skor tersimpan." }
}

// Ubah satu baris kertas kerja (skor sementara, hari, bulan, keterangan). Hanya admin.
export async function updateKertasKerja(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang mengubah data." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const id = Number(formData.get("id"))
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "ID penugasan tidak valid." }

  const skorRaw = String(formData.get("skor") ?? "").trim().replace(",", ".")
  const hariRaw = String(formData.get("hari") ?? "").trim()
  const bulanRaw = String(formData.get("bulan") ?? "").trim()
  const keteranganRaw = String(formData.get("keterangan") ?? "").trim()

  let skor: number | null = null
  if (skorRaw !== "") {
    skor = Number(skorRaw)
    if (!Number.isFinite(skor) || skor < 0 || skor > 200) {
      return { ok: false, error: "Skor sementara harus angka 0–200 (atau kosongkan)." }
    }
    skor = Math.round(skor * 10000) / 10000
  }

  let hari: number | null = null
  if (hariRaw !== "") {
    hari = Number(hariRaw)
    if (!Number.isInteger(hari) || hari < 0 || hari > 366) {
      return { ok: false, error: "Hari harus bilangan bulat 0–366 (atau kosongkan)." }
    }
  }

  let bulan: number | null = null
  if (bulanRaw !== "") {
    bulan = Number(bulanRaw)
    if (!Number.isInteger(bulan) || bulan < 0 || bulan > 12) {
      return { ok: false, error: "Bulan harus bilangan bulat 0–12 (atau kosongkan)." }
    }
  }

  const keterangan = keteranganRaw === "" ? null : keteranganRaw

  const { data, error } = await db.from("kertas_kerja").update({ skor, hari, bulan, keterangan }).eq("id", id).select("id")
  if (error) return { ok: false, error: "Gagal menyimpan: " + error.message }
  if (!data || data.length === 0) return { ok: false, error: "Baris penugasan tidak ditemukan." }

  revalidatePath("/", "layout")
  return { ok: true, message: "Penugasan tersimpan." }
}

// Ganti password user yang sedang login. Verifikasi password lama dulu.
export async function changePassword(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user) return { ok: false, error: "Sesi tidak valid. Silakan masuk ulang." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const current = String(formData.get("current") ?? "")
  const next = String(formData.get("next") ?? "")
  const confirm = String(formData.get("confirm") ?? "")

  if (!current || !next || !confirm) return { ok: false, error: "Semua kolom wajib diisi." }
  if (next.length < 6) return { ok: false, error: "Password baru minimal 6 karakter." }
  if (next !== confirm) return { ok: false, error: "Konfirmasi password tidak cocok." }
  if (next === current) return { ok: false, error: "Password baru harus berbeda dari yang lama." }

  const ok = await verifyCredentials(user.username, current)
  if (!ok) return { ok: false, error: "Password lama salah." }

  try {
    await setPassword(user, next)
  } catch (e) {
    return { ok: false, error: "Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)) }
  }
  return { ok: true, message: "Password berhasil diperbarui." }
}

// ── Dokumen LHEK ──

// Unggah dokumen LHEK (PDF) ke Supabase Storage + simpan metadata. Hanya admin.
export async function uploadLhek(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang mengunggah dokumen." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }
  if (!hasStorage) return { ok: false, error: "Supabase Storage belum dikonfigurasi." }

  const judul = String(formData.get("judul") ?? "").trim()
  const tahunRaw = String(formData.get("tahun") ?? "").trim()
  const entitas = formData.getAll("entitas").map((e) => String(e)).filter(Boolean)
  const file = formData.get("file")

  if (!judul) return { ok: false, error: "Judul wajib diisi." }
  if (entitas.length === 0) return { ok: false, error: "Pilih minimal satu unit penilaian." }
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "File PDF wajib diunggah." }
  if (file.type && file.type !== "application/pdf") return { ok: false, error: "File harus berformat PDF." }
  if (file.size > 10 * 1024 * 1024) return { ok: false, error: "Ukuran file maksimal 10 MB." }

  let tahun = 2025
  if (tahunRaw !== "") {
    tahun = Number(tahunRaw)
    if (!Number.isInteger(tahun) || tahun < 2000 || tahun > 2100) return { ok: false, error: "Tahun tidak valid." }
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-120)
  const path = `${tahun}/${randomUUID()}-${safeName}`

  try {
    const buf = Buffer.from(await file.arrayBuffer())
    await storageUpload(path, buf, "application/pdf")
    const { error } = await db.from("lhek_doc").insert({
      judul, tahun, entitas, path, file_name: file.name, size_bytes: file.size, uploaded_by: user.username,
    })
    if (error) throw new Error(error.message)
  } catch (e) {
    return { ok: false, error: "Gagal mengunggah: " + (e instanceof Error ? e.message : String(e)) }
  }

  revalidatePath("/lhek")
  revalidatePath("/", "layout")
  return { ok: true, message: "Dokumen LHEK tersimpan." }
}

// Hapus dokumen LHEK (Storage + metadata). Hanya admin.
export async function deleteLhek(formData: FormData): Promise<void> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin" || !db) return

  const id = Number(formData.get("id"))
  if (!Number.isInteger(id) || id <= 0) return

  const { data: doc } = await db.from("lhek_doc").select("path").eq("id", id).maybeSingle()
  if (doc) {
    try {
      await storageRemove((doc as { path: string }).path)
    } catch {
      // teruskan hapus metadata walau objek storage sudah tidak ada
    }
    await db.from("lhek_doc").delete().eq("id", id)
  }
  revalidatePath("/lhek")
}

// Ubah judul (juga tahun) dokumen LHEK. Hanya admin.
export async function updateLhekJudul(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const id = Number(formData.get("id"))
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "ID dokumen tidak valid." }

  const judul = String(formData.get("judul") ?? "").trim()
  if (judul.length < 3) return { ok: false, error: "Judul minimal 3 karakter." }
  if (judul.length > 200) return { ok: false, error: "Judul maksimal 200 karakter." }

  const tahunRaw = String(formData.get("tahun") ?? "").trim()
  let tahun: number | null = null
  if (tahunRaw !== "") {
    tahun = Number(tahunRaw)
    if (!Number.isInteger(tahun) || tahun < 2000 || tahun > 2100) {
      return { ok: false, error: "Tahun harus 2000–2100." }
    }
  }

  const patch: { judul: string; tahun?: number } = { judul }
  if (tahun != null) patch.tahun = tahun
  const { data, error } = await db.from("lhek_doc").update(patch).eq("id", id).select("id")
  if (error) return { ok: false, error: "Gagal menyimpan: " + error.message }
  if (!data || data.length === 0) return { ok: false, error: "Dokumen tidak ditemukan." }

  revalidatePath("/lhek")
  revalidatePath("/", "layout")
  return { ok: true, message: "Judul tersimpan." }
}

// ── Rincian Realisasi Capaian KPI per entitas ──
// Ubah realisasi (& % capaian) satu indikator pada satu entitas → berlaku ke
// semua baris pejabat di entitas itu (nilai realisasi bersifat per-entitas).
export async function updateKpiRealisasi(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const entitas = String(formData.get("entitas") ?? "").trim()
  const indikator = String(formData.get("indikator") ?? "").trim()
  if (!entitas || !indikator) return { ok: false, error: "Unit penilaian/indikator tidak valid." }

  const val = (k: string) => {
    const v = String(formData.get(k) ?? "").trim()
    return v === "" ? null : v
  }
  const realisasi = val("realisasi")
  const capaian = val("capaian")

  const { data, error } = await db
    .from("kpi_pejabat")
    .update({ realisasi, capaian })
    .eq("entitas", entitas)
    .eq("indikator", indikator)
    .eq("tahun", 2025)
    .select("id")
  if (error) return { ok: false, error: "Gagal menyimpan: " + error.message }
  if (!data || data.length === 0) return { ok: false, error: "Indikator tidak ditemukan." }

  revalidatePath("/", "layout")
  return { ok: true, message: `Tersimpan (${data.length} baris pejabat).` }
}

// ── Pengelolaan pejabat (exclude/include dari penilaian) ──

export async function excludePejabat(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const nama = String(formData.get("nama") ?? "").trim()
  if (!nama) return { ok: false, error: "Nama tidak valid." }
  const alasan = String(formData.get("alasan") ?? "").trim() || null

  const { error } = await db
    .from("pejabat_excluded")
    .upsert({ nama, alasan, oleh: user.username, waktu: new Date().toISOString() }, { onConflict: "nama" })
  if (error) return { ok: false, error: "Gagal menyimpan: " + error.message }

  revalidatePath("/", "layout")
  return { ok: true, message: `${nama} dikecualikan dari penilaian.` }
}

export async function includePejabat(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const nama = String(formData.get("nama") ?? "").trim()
  if (!nama) return { ok: false, error: "Nama tidak valid." }

  const { error } = await db.from("pejabat_excluded").delete().eq("nama", nama)
  if (error) return { ok: false, error: "Gagal menyimpan: " + error.message }

  revalidatePath("/", "layout")
  return { ok: true, message: `${nama} dipulihkan ke penilaian.` }
}

// ── KPI Kolegial ──

// Buat set KPI baru (kosong). Hanya admin.
export async function createKpiSet(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const judul = String(formData.get("judul") ?? "").trim()
  const entitas = formData.getAll("entitas").map((e) => String(e)).filter(Boolean)
  const tahunRaw = String(formData.get("tahun") ?? "").trim()
  if (!judul) return { ok: false, error: "Judul wajib diisi." }
  if (entitas.length === 0) return { ok: false, error: "Pilih minimal satu unit penilaian." }
  let tahun = 2025
  if (tahunRaw !== "") {
    tahun = Number(tahunRaw)
    if (!Number.isInteger(tahun) || tahun < 2000 || tahun > 2100) return { ok: false, error: "Tahun tidak valid." }
  }
  const { error } = await db
    .from("kpi_kolegial")
    .upsert({ judul, tahun, entitas, updated_at: new Date().toISOString() }, { onConflict: "judul,tahun" })
  if (error) return { ok: false, error: "Gagal menyimpan: " + error.message }
  revalidatePath("/lhek")
  return { ok: true, message: "Set KPI tersimpan." }
}

export async function deleteKpiSet(formData: FormData): Promise<void> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin" || !db) return
  const id = Number(formData.get("id"))
  if (!Number.isInteger(id) || id <= 0) return
  await db.from("kpi_kolegial").delete().eq("id", id) // item ikut terhapus (cascade)
  revalidatePath("/lhek")
}

type KpiItemInput = {
  perspektif?: string
  indikator?: string
  satuan?: string
  target?: string
  realisasi?: string
  polaritas?: string
  bobot?: string | number
  skor?: string | number
}

// Simpan ulang seluruh item satu set (ganti total). Hanya admin.
export async function saveKpiItems(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  const setId = Number(formData.get("set_id"))
  if (!Number.isInteger(setId) || setId <= 0) return { ok: false, error: "Set tidak valid." }

  let items: KpiItemInput[]
  try {
    items = JSON.parse(String(formData.get("payload") ?? "[]"))
  } catch {
    return { ok: false, error: "Data tidak valid." }
  }
  const num = (v: unknown): number | null => {
    const s = String(v ?? "").trim().replace(",", ".")
    if (s === "") return null
    const x = Number(s)
    return Number.isFinite(x) ? x : null
  }

  // Ganti total: hapus item lama, sisipkan yang baru (non-atomik — cukup utk edit admin).
  const rows: Record<string, unknown>[] = []
  let urut = 0
  for (const it of items) {
    const indikator = String(it.indikator ?? "").trim()
    if (!indikator) continue
    urut += 1
    rows.push({
      set_id: setId, urut,
      perspektif: it.perspektif?.trim() || null, indikator,
      satuan: it.satuan?.trim() || null,
      target: it.target?.toString().trim() || null,
      realisasi: it.realisasi?.toString().trim() || null,
      polaritas: it.polaritas?.trim() || null,
      bobot: num(it.bobot), skor: num(it.skor),
    })
  }

  const delRes = await db.from("kpi_item").delete().eq("set_id", setId)
  if (delRes.error) return { ok: false, error: "Gagal menyimpan: " + delRes.error.message }
  if (rows.length) {
    const insRes = await db.from("kpi_item").insert(rows)
    if (insRes.error) return { ok: false, error: "Gagal menyimpan: " + insRes.error.message }
  }
  await db.from("kpi_kolegial").update({ updated_at: new Date().toISOString() }).eq("id", setId)

  revalidatePath("/lhek")
  revalidatePath(`/lhek/kpi/${setId}`)
  return { ok: true, message: "KPI tersimpan." }
}

// Set/hapus override kategori BOD untuk satu baris rekap. Hanya admin.
// label kosong = ikuti kategori sistem (kolom di-null-kan).
// Dipanggil langsung dari klien (BodKategoriCell) secara optimistik.
// Sengaja TANPA revalidatePath: sel memperbarui tampilannya sendiri, jadi tak
// perlu re-render seluruh halaman (yang menghapus filter/scroll & terasa refresh).
export async function setKategoriBod(id: number, label: string, sistem: string): Promise<{ ok: boolean }> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin" || !db) return { ok: false }

  if (!Number.isInteger(id) || id <= 0) return { ok: false }

  const l = label.trim()
  const s = sistem.trim()
  // kosong atau sama dengan kategori sistem → hapus override (kembali ikut sistem)
  const value = l === "" || l === s ? null : l
  const { error } = await db.from("rekap").update({ kategori_bod: value }).eq("id", id)
  return { ok: !error }
}

// ── Kategori skor (Istimewa/Sangat Baik/dst) ──
type KategoriInput = { label?: string; batasMin?: string | number; warna?: string }

// Simpan ulang seluruh kategori skor (ganti total). Hanya admin.
export async function saveKategori(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!db) return { ok: false, error: "Database tidak tersedia." }

  let items: KategoriInput[]
  try {
    items = JSON.parse(String(formData.get("payload") ?? "[]"))
  } catch {
    return { ok: false, error: "Data tidak valid." }
  }

  const rows: Record<string, unknown>[] = []
  let urut = 0
  for (const it of items) {
    const label = String(it.label ?? "").trim()
    if (!label) continue
    const min = Number(String(it.batasMin ?? "").toString().replace(",", "."))
    if (!Number.isFinite(min)) return { ok: false, error: `Batas untuk "${label}" tidak valid.` }
    urut += 10
    rows.push({ urut, label, batas_min: min, warna: (it.warna ?? "slate").trim() || "slate" })
  }
  if (rows.length === 0) return { ok: false, error: "Minimal satu kategori." }

  const del = await db.from("skor_kategori").delete().gte("id", 0)
  if (del.error) return { ok: false, error: "Gagal menyimpan: " + del.error.message }
  const ins = await db.from("skor_kategori").insert(rows)
  if (ins.error) return { ok: false, error: "Gagal menyimpan: " + ins.error.message }

  revalidatePath("/", "layout")
  return { ok: true, message: "Kategori skor tersimpan." }
}
