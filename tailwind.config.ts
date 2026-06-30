import type { Config } from "tailwindcss"
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // skema ungu gelap × teal/mint — token semantik di-remap ke palet ini
        primary: "#6D45B8",    // ungu aksen (links/primary)
        steel:   "#3FB8A8",    // teal (aksen sekunder)
        gold:    "#3FB8A8",    // di-pensiunkan → teal (kompat lama)
        navy:    "#2A1A47",    // ungu gelap (headings/hero)
        ink:     "#0B1220",    // near-black
        paper:   "#F6F7F9",    // soft neutral page bg

        // — palet eksplisit ungu gelap × teal/mint —
        grape:   "#2A1A47",    // ungu gelap (anchor gradient)
        plum:    "#4A2C7A",    // ungu medium (gradient end)
        violet:  "#6D45B8",    // ungu aksen lebih terang
        teal:    "#3FB8A8",    // teal energik (aksen utama)
        mint:    "#5EEAD4",    // mint terang (highlight/hover)
      },
      backgroundImage: {
        // area besar / hero / background
        "grad-grape":  "linear-gradient(135deg, #2A1A47 0%, #4A2C7A 100%)",
        // ungu gelap menyatu ke teal — untuk panel/banner berkarakter
        "grad-grape-teal": "linear-gradient(135deg, #2A1A47 0%, #4A2C7A 55%, #2F6F75 100%)",
        // aksen teal→mint — untuk tombol / chip / indikator
        "grad-teal":   "linear-gradient(135deg, #3FB8A8 0%, #5EEAD4 100%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // bayangan difus & ber-tint (bukan hitam pekat) — kesan "mengambang"
        elev: "0 1px 2px rgba(15,23,42,0.05), 0 20px 50px -22px rgba(15,23,42,0.28)",
        card: "0 1px 2px rgba(15,23,42,0.05), 0 16px 38px -18px rgba(15,23,42,0.22)",
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 8px 22px -12px rgba(15,23,42,0.14)",
      },
      letterSpacing: { tightest: "-0.03em" },
      // MagicUI Shimmer Button
      animation: {
        "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      },
      keyframes: {
        "shimmer-slide": {
          to: { transform: "translate(calc(100cqw - 100%), 0)" },
        },
        "spin-around": {
          "0%": { transform: "translateZ(0) rotate(0)" },
          "15%, 35%": { transform: "translateZ(0) rotate(90deg)" },
          "65%, 85%": { transform: "translateZ(0) rotate(270deg)" },
          "100%": { transform: "translateZ(0) rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
}
export default config
