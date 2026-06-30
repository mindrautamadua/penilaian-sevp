"use server"
import { randomUUID } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { verifyCredentials, findUser, setPassword } from "@/lib/auth"
import { sql } from "@/lib/db"
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
  if (!sql) return { ok: false, error: "Database tidak tersedia." }

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

  try {
    const res = await sql`update rekap set skor=${skor}, bulan=${bulan}, catatan=${catatan} where id=${id}`
    if (res.count === 0) return { ok: false, error: "Baris rekap tidak ditemukan." }
  } catch (e) {
    return { ok: false, error: "Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)) }
  }

  // halaman force-dynamic, tapi revalidasi untuk jaga-jaga
  revalidatePath("/", "layout")
  return { ok: true, message: "Skor tersimpan." }
}

// Ubah satu baris kertas kerja (skor sementara, hari, bulan, keterangan). Hanya admin.
export async function updateKertasKerja(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang mengubah data." }
  if (!sql) return { ok: false, error: "Database tidak tersedia." }

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

  try {
    const res = await sql`update kertas_kerja set skor=${skor}, hari=${hari}, bulan=${bulan}, keterangan=${keterangan} where id=${id}`
    if (res.count === 0) return { ok: false, error: "Baris penugasan tidak ditemukan." }
  } catch (e) {
    return { ok: false, error: "Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)) }
  }

  revalidatePath("/", "layout")
  return { ok: true, message: "Penugasan tersimpan." }
}

// Ganti password user yang sedang login. Verifikasi password lama dulu.
export async function changePassword(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user) return { ok: false, error: "Sesi tidak valid. Silakan masuk ulang." }
  if (!sql) return { ok: false, error: "Database tidak tersedia." }

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
  if (!sql) return { ok: false, error: "Database tidak tersedia." }
  if (!hasStorage) return { ok: false, error: "Supabase Storage belum dikonfigurasi." }

  const judul = String(formData.get("judul") ?? "").trim()
  const tahunRaw = String(formData.get("tahun") ?? "").trim()
  const entitas = formData.getAll("entitas").map((e) => String(e)).filter(Boolean)
  const file = formData.get("file")

  if (!judul) return { ok: false, error: "Judul wajib diisi." }
  if (entitas.length === 0) return { ok: false, error: "Pilih minimal satu entitas." }
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
    await sql`
      insert into lhek_doc (judul, tahun, entitas, path, file_name, size_bytes, uploaded_by)
      values (${judul}, ${tahun}, ${entitas}, ${path}, ${file.name}, ${file.size}, ${user.username})`
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
  if (!user || user.role !== "admin" || !sql) return

  const id = Number(formData.get("id"))
  if (!Number.isInteger(id) || id <= 0) return

  const rows = await sql<{ path: string }[]>`select path from lhek_doc where id=${id}`
  if (rows[0]) {
    try {
      await storageRemove(rows[0].path)
    } catch {
      // teruskan hapus metadata walau objek storage sudah tidak ada
    }
    await sql`delete from lhek_doc where id=${id}`
  }
  revalidatePath("/lhek")
}

// Ubah judul (juga tahun) dokumen LHEK. Hanya admin.
export async function updateLhekJudul(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!sql) return { ok: false, error: "Database tidak tersedia." }

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

  try {
    const res = tahun != null
      ? await sql`update lhek_doc set judul=${judul}, tahun=${tahun} where id=${id}`
      : await sql`update lhek_doc set judul=${judul} where id=${id}`
    if (res.count === 0) return { ok: false, error: "Dokumen tidak ditemukan." }
  } catch (e) {
    return { ok: false, error: "Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)) }
  }

  revalidatePath("/lhek")
  revalidatePath("/", "layout")
  return { ok: true, message: "Judul tersimpan." }
}

// ── Pengelolaan pejabat (exclude/include dari penilaian) ──

export async function excludePejabat(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!sql) return { ok: false, error: "Database tidak tersedia." }

  const nama = String(formData.get("nama") ?? "").trim()
  if (!nama) return { ok: false, error: "Nama tidak valid." }
  const alasan = String(formData.get("alasan") ?? "").trim() || null

  try {
    await sql`
      insert into pejabat_excluded (nama, alasan, oleh)
      values (${nama}, ${alasan}, ${user.username})
      on conflict (nama) do update set alasan = ${alasan}, oleh = ${user.username}, waktu = now()`
  } catch (e) {
    return { ok: false, error: "Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)) }
  }

  revalidatePath("/", "layout")
  return { ok: true, message: `${nama} dikecualikan dari penilaian.` }
}

export async function includePejabat(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!sql) return { ok: false, error: "Database tidak tersedia." }

  const nama = String(formData.get("nama") ?? "").trim()
  if (!nama) return { ok: false, error: "Nama tidak valid." }

  try {
    await sql`delete from pejabat_excluded where nama = ${nama}`
  } catch (e) {
    return { ok: false, error: "Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)) }
  }

  revalidatePath("/", "layout")
  return { ok: true, message: `${nama} dipulihkan ke penilaian.` }
}

// ── KPI Kolegial ──

// Buat set KPI baru (kosong). Hanya admin.
export async function createKpiSet(_prev: EditState, formData: FormData): Promise<EditState> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin") return { ok: false, error: "Tidak berwenang." }
  if (!sql) return { ok: false, error: "Database tidak tersedia." }

  const judul = String(formData.get("judul") ?? "").trim()
  const entitas = formData.getAll("entitas").map((e) => String(e)).filter(Boolean)
  const tahunRaw = String(formData.get("tahun") ?? "").trim()
  if (!judul) return { ok: false, error: "Judul wajib diisi." }
  if (entitas.length === 0) return { ok: false, error: "Pilih minimal satu entitas." }
  let tahun = 2025
  if (tahunRaw !== "") {
    tahun = Number(tahunRaw)
    if (!Number.isInteger(tahun) || tahun < 2000 || tahun > 2100) return { ok: false, error: "Tahun tidak valid." }
  }
  try {
    await sql`
      insert into kpi_kolegial (judul, tahun, entitas) values (${judul}, ${tahun}, ${entitas})
      on conflict (judul, tahun) do update set entitas = excluded.entitas, updated_at = now()`
  } catch (e) {
    return { ok: false, error: "Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)) }
  }
  revalidatePath("/lhek")
  return { ok: true, message: "Set KPI tersimpan." }
}

export async function deleteKpiSet(formData: FormData): Promise<void> {
  const store = await cookies()
  const user = await findUser(store.get("sevp_auth")?.value)
  if (!user || user.role !== "admin" || !sql) return
  const id = Number(formData.get("id"))
  if (!Number.isInteger(id) || id <= 0) return
  await sql`delete from kpi_kolegial where id=${id}` // item ikut terhapus (cascade)
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
  if (!sql) return { ok: false, error: "Database tidak tersedia." }

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

  try {
    await sql.begin(async (tx) => {
      await tx`delete from kpi_item where set_id=${setId}`
      let urut = 0
      for (const it of items) {
        const indikator = String(it.indikator ?? "").trim()
        if (!indikator) continue
        urut += 1
        await tx`
          insert into kpi_item (set_id, urut, perspektif, indikator, satuan, target, realisasi, polaritas, bobot, skor)
          values (${setId}, ${urut}, ${it.perspektif?.trim() || null}, ${indikator}, ${it.satuan?.trim() || null},
                  ${it.target?.toString().trim() || null}, ${it.realisasi?.toString().trim() || null},
                  ${it.polaritas?.trim() || null}, ${num(it.bobot)}, ${num(it.skor)})`
      }
      await tx`update kpi_kolegial set updated_at = now() where id=${setId}`
    })
  } catch (e) {
    return { ok: false, error: "Gagal menyimpan: " + (e instanceof Error ? e.message : String(e)) }
  }
  revalidatePath("/lhek")
  revalidatePath(`/lhek/kpi/${setId}`)
  return { ok: true, message: "KPI tersimpan." }
}
