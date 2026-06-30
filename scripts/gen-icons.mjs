// Generate favicon (SVG) + apple/PWA icons (PNG) dari brand mark SEVP. Jalankan: npm run gen:icons
import sharp from "sharp"
import { writeFileSync, mkdirSync } from "node:fs"

const GRAD = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1A47"/><stop offset="1" stop-color="#6D45B8"/></linearGradient></defs>`

// Brand mark SEVP: squircle ungu gelap + cincin teal + teks "SEVP".
// rx=112 (rounded, favicon/PWA) atau rx=0 (full-bleed utk apple & maskable).
function mark(rx) {
  const R = 190
  const C = 2 * Math.PI * R
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${GRAD}
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
  <circle cx="256" cy="256" r="${R}" fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="14"/>
  <circle cx="256" cy="256" r="${R}" fill="none" stroke="#5EEAD4" stroke-width="14" stroke-linecap="round"
    stroke-dasharray="${C}" stroke-dashoffset="${C * 0.28}" transform="rotate(-90 256 256)"/>
  <text x="256" y="298" text-anchor="middle" font-family="'Helvetica Neue',Arial,sans-serif" font-size="116" font-weight="800" letter-spacing="-4" fill="#ffffff">SEVP</text>
  <text x="256" y="356" text-anchor="middle" font-family="'Helvetica Neue',Arial,sans-serif" font-size="34" font-weight="600" letter-spacing="6" fill="#5EEAD4">2025</text>
</svg>`
}

const rounded = mark(112)
const square = mark(0)

mkdirSync("public", { recursive: true })

// Favicon SVG (browser modern) → app/icon.svg (otomatis dipakai Next)
writeFileSync("app/icon.svg", rounded)

const png = (svg, size, file) => sharp(Buffer.from(svg)).resize(size, size).png().toFile(file)

await png(square, 180, "app/apple-icon.png")        // Apple touch icon
await png(rounded, 192, "public/icon-192.png")      // PWA any
await png(rounded, 512, "public/icon-512.png")      // PWA any
await png(square, 512, "public/icon-maskable.png")  // PWA maskable (full-bleed)
await png(rounded, 48, "public/favicon-48.png")     // fallback kecil

console.log("✓ Icon dibuat: app/icon.svg, app/apple-icon.png, public/icon-192|512|maskable.png, favicon-48.png")
