import type { LhekRef } from "@/lib/lhek"

// Tautan cepat membuka dokumen LHEK (signed URL via /api/lhek/:id) di tab baru.
export function LhekLink({ lhek }: { lhek: LhekRef | null }) {
  if (!lhek) return null
  return (
    <a
      href={`/api/lhek/${lhek.id}`}
      target="_blank"
      rel="noopener noreferrer"
      title={lhek.judul}
      className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20 no-print"
    >
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
      Evident LHEK {lhek.tahun}
    </a>
  )
}
