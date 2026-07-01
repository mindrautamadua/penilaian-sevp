"use client"

import { useLinkStatus } from "next/link"

// Spinner mungil yang tampil selama navigasi <Link> pembungkusnya sedang berjalan
// (mis. menunggu shell modal detail). Memberi umpan balik instan saat diklik.
export function LinkPending() {
  const { pending } = useLinkStatus()
  if (!pending) return null
  return (
    <span
      className="ml-1 inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-[1.5px] border-slate-300 border-t-primary align-[-1px]"
      aria-label="Memuat…"
      role="status"
    />
  )
}
