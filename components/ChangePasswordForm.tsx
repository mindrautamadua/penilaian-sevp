"use client"

import { useActionState, useEffect, useRef } from "react"
import { changePassword } from "@/app/actions"
import type { EditState } from "@/app/actions"

const initial: EditState = { ok: false }

const field =
  "mt-1 min-h-[46px] w-full rounded-xl bg-white px-3.5 text-sm text-ink shadow-soft outline-none ring-1 ring-slate-900/[0.08] transition-all duration-300 focus:ring-2 focus:ring-steel"

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initial)
  const formRef = useRef<HTMLFormElement>(null)

  // kosongkan kolom setelah berhasil
  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state])

  return (
    <section className="rounded-3xl bg-white/90 p-5 shadow-card ring-1 ring-slate-900/[0.05] backdrop-blur-sm sm:p-6">
      <span className="eyebrow bg-primary/10 text-primary">Keamanan</span>
      <h2 className="mt-2 text-lg font-bold tracking-tight text-navy">Ganti Password</h2>
      <p className="mt-1 text-sm text-slate-500">Masukkan password lama lalu password baru (minimal 6 karakter).</p>

      <form ref={formRef} action={formAction} className="mt-5 max-w-sm">
        <label htmlFor="current" className="mb-1 block text-sm font-medium text-slate-700">Password lama</label>
        <input id="current" name="current" type="password" required autoComplete="current-password" placeholder="••••••••" className={`mb-4 ${field}`} />

        <label htmlFor="next" className="mb-1 block text-sm font-medium text-slate-700">Password baru</label>
        <input id="next" name="next" type="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" className={`mb-4 ${field}`} />

        <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-slate-700">Konfirmasi password baru</label>
        <input id="confirm" name="confirm" type="password" required minLength={6} autoComplete="new-password" placeholder="••••••••" className={`mb-2 ${field}`} />

        {state.error && (
          <p role="alert" className="mb-2 mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
        )}
        {state.ok && (
          <p role="status" className="mb-2 mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-navy px-6 text-sm font-bold tracking-tight text-white shadow-soft transition-all hover:bg-primary hover:shadow-card active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-steel focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? "Menyimpan…" : "Simpan password baru"}
        </button>
      </form>
    </section>
  )
}
