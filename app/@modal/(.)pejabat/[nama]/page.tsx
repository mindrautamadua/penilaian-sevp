import { Suspense } from "react"
import { Modal } from "@/components/Modal"
import { PejabatDetailView } from "@/components/PejabatDetailView"
import { PejabatDetailSkeleton } from "@/components/PejabatDetailSkeleton"

export const dynamic = "force-dynamic"

// Intercepting route: klik /pejabat/[nama] dari dalam app → tampil sebagai modal
// di atas halaman asal (dashboard tetap ter-mount → scroll & filter utuh).
// Cangkang modal tampil SEKETIKA (animasi masuk); isi detail di-stream lewat
// Suspense dengan skeleton, jadi user langsung sadar ada proses berjalan.
// Buka langsung / refresh → jatuh ke halaman penuh app/pejabat/[nama]/page.tsx.
export default async function PejabatModal({ params }: { params: Promise<{ nama: string }> }) {
  const { nama } = await params
  const decoded = decodeURIComponent(nama)
  return (
    <Modal nama={decoded}>
      <Suspense fallback={<PejabatDetailSkeleton />}>
        <PejabatDetailView nama={decoded} />
      </Suspense>
    </Modal>
  )
}
