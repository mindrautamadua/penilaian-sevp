// Avatar pejabat — foto bila ada, jika tidak inisial nama. Komponen murni
// (tanpa hook) sehingga aman dipakai di Server maupun Client Component.

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  src, name, size = 40, className = "",
}: {
  src: string | null | undefined
  name: string
  size?: number
  className?: string
}) {
  const dim = { width: size, height: size }
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        style={dim}
        className={`shrink-0 rounded-full object-cover ring-1 ring-slate-900/[0.08] ${className}`}
      />
    )
  }
  return (
    <span
      aria-hidden
      style={{ ...dim, fontSize: Math.max(10, Math.round(size * 0.36)) }}
      className={`grid shrink-0 place-items-center rounded-full bg-grad-grape-teal font-bold text-white ring-1 ring-white/10 ${className}`}
    >
      {initials(name)}
    </span>
  )
}
