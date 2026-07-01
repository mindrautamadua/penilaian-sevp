import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Header, Aurora } from "@/components/Header"
import { KertasKerjaTable } from "@/components/KertasKerjaTable"
import { findUser } from "@/lib/auth"
import { getKertasKerja } from "@/lib/data"
import { getKategori } from "@/lib/kategori"

export const dynamic = "force-dynamic"

export default async function KertasKerjaPage() {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  if (!user || user.role !== "admin") redirect("/")

  const [rows, kategori] = await Promise.all([getKertasKerja(), getKategori()])
  const entitasList = Array.from(new Set(rows.map((r) => r.entitas).filter(Boolean))).sort() as string[]

  return (
    <>
      <Aurora />
      <Header active="/kertas-kerja" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="anim-rise">
          <span className="eyebrow bg-grad-teal text-white shadow-soft">Tahun Kinerja 2025</span>
          <h1 className="h-display mt-3 text-3xl sm:text-4xl">Kertas Kerja Penilaian</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Data mentah per-penugasan sebelum diringkas menjadi satu skor per pejabat.
          </p>
        </div>
        <div className="anim-rise-1 mt-7">
          <KertasKerjaTable rows={rows} entitasList={entitasList} kategori={kategori} />
        </div>
      </main>
    </>
  )
}
