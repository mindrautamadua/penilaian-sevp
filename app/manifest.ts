import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Penilaian SEVP — Tahun Kinerja 2025",
    short_name: "SEVP 2025",
    description: "Penilaian Region Head & SEVP PTPN Group — Tahun Kinerja 2025",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F7F9",
    theme_color: "#2A1A47",
    lang: "id",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
