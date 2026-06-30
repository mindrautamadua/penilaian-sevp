import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const authed = req.cookies.get("sevp_auth")
  const { pathname } = req.nextUrl

  // /login terbuka; sisanya butuh sesi.
  if (pathname === "/login") {
    if (authed) return NextResponse.redirect(new URL("/", req.url))
    return NextResponse.next()
  }
  if (!authed) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  return NextResponse.next()
}

// Lindungi semua route kecuali aset internal Next, favicon, & berkas PWA
// (manifest, service worker, ikon) yang harus bisa diakses tanpa sesi agar
// aplikasi tetap installable. Foto pejabat (/foto) tetap di belakang login.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icon.svg|apple-icon.png|icon-192.png|icon-512.png|icon-maskable.png|favicon-48.png).*)",
  ],
}
