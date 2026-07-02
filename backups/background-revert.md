# Backup — Latar (Aurora) sebelum animasi sheen/grain/breathe

Kalau ingin **kembali ke latar gradient polos** (hanya orb aurora yang drift lembut,
TANPA sheen/grain/breathe), ganti fungsi `Aurora()` di
`components/Header.tsx` dengan versi asli di bawah ini.

## 1) Versi ASLI (gradient polos — "keren sekali" versi awal)

```tsx
// Aurora gradient backdrop (tidak ikut tercetak).
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
      <div className="drift-a absolute -left-28 -top-28 h-[520px] w-[520px] rounded-full bg-primary/[0.30] blur-[120px]" />
      <div className="drift-b absolute right-[-6%] top-[4%] h-[460px] w-[460px] rounded-full bg-steel/25 blur-[120px]" />
      <div className="drift-c absolute bottom-[-12%] left-[22%] h-[540px] w-[540px] rounded-full bg-violet-400/25 blur-[140px]" />
      <div className="drift-a absolute bottom-[12%] right-[4%] h-[420px] w-[420px] rounded-full bg-mint/25 blur-[120px]" />
    </div>
  )
}
```

Keyframe `sevp-sweep` & `sevp-breathe` di `app/globals.css` boleh dibiarkan
(tidak dipakai bila kelasnya dihapus) atau ikut dihapus untuk bersih-bersih.

## 2) Versi TENGAH (sheen + grain halus, TANPA breathe — subtle)

Kalau versi animasi sekarang terasa terlalu ramai, ini opsi yang lebih kalem:
container Aurora tanpa kelas `aurora-breathe`, orb opacity 0.30/0.25,
dan sheen `via-white/40 blur-2xl`.

## 3) Versi SEKARANG (aktif)
- Container: `aurora-breathe` (opacity 0.7↔1, 10s).
- Orb opacity dinaikkan (0.38 / 0.35).
- Sheen: `via-white/60 blur-xl w-[44%]`, sapuan 13s.
- Grain: opacity 0.05 `mix-blend-soft-light`.

Semua efek otomatis mati saat `prefers-reduced-motion: reduce` dan tidak ikut cetak/PDF.
