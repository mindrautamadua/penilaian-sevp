"use client"

import { useRouter } from "next/navigation"

// Tombol kembali yang memakai navigasi MUNDUR (bukan Link ke "/") agar
// App Router memulihkan halaman sebelumnya apa adanya — posisi scroll &
// state filter dashboard tetap seperti saat pengguna meninggalkannya.
// Bila tak ada riwayat (mis. halaman dibuka langsung), fallback ke dashboard.
export function BackButton({ className, label = "← Kembali", fallback = "/" }: { className?: string; label?: string; fallback?: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back()
        else router.push(fallback)
      }}
      className={className}
    >
      {label}
    </button>
  )
}
