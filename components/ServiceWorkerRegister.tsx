"use client"

import { useEffect } from "react"

// Daftarkan service worker untuk PWA (offline + installable). Tanpa UI.
// PENTING: di localhost/dev SW TIDAK didaftarkan (dan yang lama dibersihkan),
// karena cache SW sering menyajikan CSS/JS basi saat pengembangan.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return

    const isLocal =
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1" ||
      location.hostname === "[::1]"

    if (isLocal) {
      // Dev: hapus SW & cache lama agar edit langsung terlihat, jangan daftar ulang.
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister())).catch(() => {})
      if ("caches" in window) caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
      return
    }

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* abaikan: PWA gagal daftar tidak memengaruhi fungsi app */
      })
    }
    if (document.readyState === "complete") onLoad()
    else window.addEventListener("load", onLoad, { once: true })
  }, [])
  return null
}
