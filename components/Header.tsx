import Link from "next/link"
import { cookies } from "next/headers"
import { logout } from "@/app/actions"
import { findUser } from "@/lib/auth"

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/kertas-kerja", label: "Kertas Kerja" },
  { href: "/lhek", label: "LHEK" },
  { href: "/laporan", label: "Laporan PDF" },
]

// Header aplikasi — dipakai di semua halaman.
export async function Header({ active }: { active?: string }) {
  const user = await findUser((await cookies()).get("sevp_auth")?.value)
  const items = user?.role === "admin"
    ? [...nav, { href: "/kelola", label: "Kelola Pejabat" }, { href: "/kategori", label: "Kategori Skor" }, { href: "/kpi-realisasi", label: "Realisasi KPI" }]
    : nav
  return (
    <header className="sticky top-0 z-20 border-b border-slate-900/[0.06] bg-paper/80 backdrop-blur-xl no-print">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-[11px] font-bold tracking-tight text-white shadow-soft ring-1 ring-white/10">
            SEVP
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight text-navy">Penilaian SEVP</span>
            <span className="block truncate text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              PTPN Group · Tahun Kinerja 2025
            </span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-1.5">
          {items.map((item) => {
            const on = item.href === active
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  on
                    ? "rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white shadow-soft"
                    : "rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all duration-300 hover:text-navy hover:shadow-card"
                }
              >
                {item.label}
              </Link>
            )
          })}

          {user && (
            <div className="ml-1.5 flex items-center gap-2 border-l border-slate-900/[0.08] pl-2.5">
              <Link
                href="/akun"
                title="Pengaturan akun"
                className={`hidden rounded-lg px-2 py-1 text-right transition-colors hover:bg-slate-900/[0.04] sm:block ${active === "/akun" ? "bg-slate-900/[0.04]" : ""}`}
              >
                <span className="block text-xs font-semibold leading-tight text-navy">{user.name}</span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400">{user.role}</span>
              </Link>
              <form action={logout}>
                <button className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full bg-white px-3.5 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all duration-300 hover:text-navy hover:shadow-card active:scale-[0.98]" aria-label="Keluar">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Keluar
                </button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

// Aurora gradient backdrop + MagicUI Particles (tidak ikut tercetak).
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
      <div className="drift-a absolute -left-28 -top-28 h-[520px] w-[520px] rounded-full bg-primary/[0.30] blur-[120px]" />
      <div className="drift-b absolute right-[-6%] top-[4%] h-[460px] w-[460px] rounded-full bg-steel/25 blur-[120px]" />
      <div className="drift-c absolute bottom-[-12%] left-[22%] h-[540px] w-[540px] rounded-full bg-violet-400/25 blur-[140px]" />
      <div className="drift-a absolute bottom-[12%] right-[4%] h-[420px] w-[420px] rounded-full bg-mint/25 blur-[120px]" />
    </div>
  )
}
