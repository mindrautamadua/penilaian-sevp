import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Header, Aurora } from "@/components/Header"
import { PejabatKelola } from "@/components/PejabatKelola"
import { findUser } from "@/lib/auth"
import { getPejabatKelola } from "@/lib/data"

export const dynamic = "force-dynamic"

export default async function KelolaPage() {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  if (!user || user.role !== "admin") redirect("/")

  const rows = await getPejabatKelola()
  const excludedCount = rows.filter((r) => r.excluded).length

  return (
    <>
      <Aurora />
      <Header active="/kelola" />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="anim-rise">
          <span className="eyebrow bg-grad-teal text-white shadow-soft">Admin</span>
          <h1 className="h-display mt-3 text-3xl sm:text-4xl">Kelola Pejabat</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Kecualikan pejabat dari penilaian. Yang dikecualikan tidak tampil di Dashboard, Kertas Kerja, Laporan,
            dan tidak dihitung pada ringkasan — namun datanya tetap tersimpan dan bisa dipulihkan kapan saja.
          </p>
        </div>

        <div className="anim-rise-1 mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Total Pejabat</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-navy">{rows.length}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Dinilai</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-emerald-600">{rows.length - excludedCount}</p>
          </div>
          <div className="rounded-2xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Dikecualikan</p>
            <p className="data mt-2 text-3xl font-extrabold tracking-tightest text-rose-600">{excludedCount}</p>
          </div>
        </div>

        <div className="anim-rise-2 mt-8">
          <PejabatKelola rows={rows} />
        </div>
      </main>
    </>
  )
}
