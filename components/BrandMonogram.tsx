// Monogram brand "RH & SEVP" (dua baris) untuk kotak logo kecil — echo dari
// ikon aplikasi. Ukuran/warna/ring diatur lewat `className` dari pemakai.
export function BrandMonogram({ className = "" }: { className?: string }) {
  return (
    <span className={`grid place-items-center rounded-xl font-extrabold leading-none tracking-tight ${className}`}>
      <span className="flex flex-col items-center gap-[1px] leading-none">
        <span className="text-[7px]">RH &amp;</span>
        <span className="text-[10px]">SEVP</span>
      </span>
    </span>
  )
}
