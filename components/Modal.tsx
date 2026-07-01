"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Pembungkus modal untuk intercepting route detail pejabat. Tutup → router.back()
// sehingga kembali ke dashboard PERSIS seperti sebelumnya (scroll & filter utuh).
export function Modal({ nama, children }: { nama: string; children: React.ReactNode }) {
  const router = useRouter()
  const close = () => router.back()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden" // cegah dashboard di belakang ikut ter-scroll
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="modal-backdrop-in fixed inset-0 z-50 overflow-y-auto bg-navy/40 backdrop-blur-sm no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-panel-in mx-auto my-6 w-full max-w-4xl px-4 sm:my-10">
        {/* Toolbar modal */}
        <div className="mb-3 flex items-center justify-end gap-2">
          <a
            href={`/pejabat/${encodeURIComponent(nama)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-sm font-medium text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy hover:shadow-card"
            title="Buka halaman penuh (untuk unduh PDF)"
          >
            Halaman penuh ↗
          </a>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-600 shadow-soft ring-1 ring-slate-900/[0.06] transition-all hover:text-navy hover:shadow-card"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
