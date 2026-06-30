"use client"

import { useEffect } from "react"

// Daftarkan service worker untuk PWA (offline + installable). Tanpa UI.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return
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
