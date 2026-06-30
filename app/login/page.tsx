import { login } from "@/app/actions"
import { SubmitButton } from "@/components/SubmitButton"

export const dynamic = "force-dynamic"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams

  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-2">
      {/* Panel brand (desktop) */}
      <aside className="relative hidden overflow-hidden bg-grad-grape-teal p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />

        <div className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[11px] font-bold ring-1 ring-white/15">SEVP</div>
          <div>
            <p className="font-semibold">Penilaian SEVP</p>
            <p className="text-xs text-white/60">PTPN Group · Tahun Kinerja 2025</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-3xl font-extrabold leading-[1.1] tracking-tightest">Penilaian Region Head &amp; SEVP dalam satu dasbor.</h1>
          <p className="mt-3 max-w-sm text-sm text-white/70">Rekapitulasi skor kinerja PTPN Group — terbobot masa jabatan, satu skor per pejabat, siap diekspor PDF.</p>
        </div>

        <p className="relative text-xs text-white/60">© 2025 Penilaian SEVP · PTPN Group.</p>
      </aside>

      {/* Panel form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="anim-rise w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-[11px] font-bold text-white">SEVP</div>
            <div>
              <p className="font-semibold text-navy">Penilaian SEVP</p>
              <p className="text-xs text-slate-500">PTPN Group · 2025</p>
            </div>
          </div>

          <span className="eyebrow bg-primary/[0.08] text-primary">Akses Terbatas</span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tightest text-navy">Masuk ke akun Anda</h2>
          <p className="mt-1 text-sm text-slate-500">Masukkan username dan password Anda.</p>

          <form action={login} className="mt-6">
            {sp.error && (
              <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                Username atau password tidak valid.
              </p>
            )}

            <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input id="username" name="username" type="text" required autoComplete="username" placeholder="username"
              className="mb-4 min-h-[46px] w-full rounded-xl bg-white px-3.5 text-sm text-ink shadow-soft outline-none ring-1 ring-slate-900/[0.08] transition-all duration-300 focus:ring-2 focus:ring-steel" />

            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••"
              className="mb-6 min-h-[46px] w-full rounded-xl bg-white px-3.5 text-sm text-ink shadow-soft outline-none ring-1 ring-slate-900/[0.08] transition-all duration-300 focus:ring-2 focus:ring-steel" />

            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  )
}
