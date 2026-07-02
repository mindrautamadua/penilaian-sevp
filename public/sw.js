// Service worker Penilaian SEVP — strategi ringan:
// - navigasi (HTML): network-first, fallback ke cache (offline tetap muncul halaman terakhir / shell)
// - aset statis (/icon, /foto, /_next/static): stale-while-revalidate
// Data dinamis (DB/Supabase, /api) TIDAK di-cache agar selalu terbaru.

const VERSION = "sevp-v3"
const STATIC_CACHE = `${VERSION}-static`
const PAGE_CACHE = `${VERSION}-pages`

self.addEventListener("install", (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(STATIC_CACHE).then((c) =>
      c.addAll(["/icon-192.png", "/icon-512.png", "/favicon-48.png"]).catch(() => {})
    )
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // jangan ganggu Supabase/eksternal
  if (url.pathname.startsWith("/api/")) return     // selalu jaringan untuk API

  // Navigasi halaman → network-first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(PAGE_CACHE).then((c) => c.put(request, copy))
          return res
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/")))
    )
    return
  }

  // Aset statis → stale-while-revalidate
  if (/\/(_next\/static|icon|foto|favicon)/.test(url.pathname) || /\.(png|jpg|jpeg|webp|svg|css|js|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone()
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy))
            return res
          })
          .catch(() => cached)
        return cached || network
      })
    )
  }
})
