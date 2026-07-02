import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister"

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" })
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-mono", display: "swap" })

export const metadata: Metadata = {
  title: "Penilaian Direktur, RH & SEVP — Tahun Kinerja 2025",
  description: "Penilaian Direktur, Region Head & SEVP PTPN Group — Tahun Kinerja 2025",
  applicationName: "Penilaian Direktur, RH & SEVP 2025",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RH & SEVP", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#2A1A47",
}

export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="id" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        {children}
        {modal}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
