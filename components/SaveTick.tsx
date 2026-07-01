"use client"

import { useCallback, useRef, useState } from "react"

// Hook flash "tersimpan": panggil flash() setelah simpan berhasil.
// `on` = sedang menampilkan flash; `n` = nonce untuk memicu ulang animasi (key).
export function useSaveFlash() {
  const [n, setN] = useState(0)
  const [on, setOn] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flash = useCallback(() => {
    setN((v) => v + 1)
    setOn(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setOn(false), 1400)
  }, [])

  return { n, on, flash }
}

// Badge centang hijau memantul di pojok sel (posisi absolut).
export function SaveTick() {
  return (
    <span
      aria-label="Tersimpan"
      title="Tersimpan"
      className="saved-pop pointer-events-none absolute -right-2 -top-2 z-10 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white shadow-soft ring-2 ring-white"
    >
      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}
