"use client"

// Tombol "Unduh PDF" — memanggil dialog cetak browser (Save as PDF).
// Memanfaatkan aturan @media print di globals.css.
export function PrintButton({ label = "Unduh PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="group inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full bg-navy px-4 text-sm font-bold tracking-tight text-white shadow-soft transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-primary hover:shadow-card active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-steel"
    >
      <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
    </button>
  )
}
