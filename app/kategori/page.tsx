import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Header, Aurora } from "@/components/Header"
import { KategoriEditor } from "@/components/KategoriEditor"
import { findUser } from "@/lib/auth"
import { getKategori } from "@/lib/kategori"

export const dynamic = "force-dynamic"

export default async function KategoriPage() {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  if (user?.role !== "admin") redirect("/")

  const kategori = await getKategori()

  return (
    <>
      <Aurora />
      <Header active="/kategori" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="anim-rise">
          <span className="eyebrow bg-grad-teal text-white shadow-soft">Pengaturan</span>
          <h1 className="h-display mt-3 text-3xl sm:text-4xl">Kategori Skor</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Atur ambang &amp; label kategori (Istimewa, Sangat Baik, dst). Perubahan berlaku di seluruh halaman —
            dashboard, kartu skor, tabel rekap, dan laporan.
          </p>
        </div>
        <div className="anim-rise-1 mt-7">
          <KategoriEditor initialRows={kategori} />
        </div>
      </main>
    </>
  )
}
