import Link from "next/link"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Header, Aurora } from "@/components/Header"
import { KpiEditor } from "@/components/KpiEditor"
import { findUser } from "@/lib/auth"
import { getKpiSet } from "@/lib/kpi"

export const dynamic = "force-dynamic"

export default async function KpiEditPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()

  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  if (user?.role !== "admin") redirect(`/lhek/kpi/${id}`)

  const data = await getKpiSet(id)
  if (!data) notFound()

  return (
    <>
      <Aurora />
      <Header active="/lhek" />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-5">
          <Link href={`/lhek/kpi/${id}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy hover:shadow-card">← Batal</Link>
        </div>
        <div className="anim-rise">
          <span className="eyebrow bg-primary/10 text-primary">Edit KPI</span>
          <h1 className="h-display mt-3 text-2xl sm:text-3xl">{data.set.judul}</h1>
          <p className="mt-2 text-sm text-slate-500">Koreksi nilai atau tambah/hapus baris, lalu simpan.</p>
        </div>
        <div className="anim-rise-1 mt-7">
          <KpiEditor setId={id} initialItems={data.items} />
        </div>
      </main>
    </>
  )
}
