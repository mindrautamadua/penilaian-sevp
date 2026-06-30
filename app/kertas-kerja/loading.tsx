import { LoadingShell, HeroSkeleton, TableSkeleton } from "@/components/Skeleton"

export default function Loading() {
  return (
    <LoadingShell>
      <HeroSkeleton />
      <div className="mt-7">
        <TableSkeleton rows={10} />
      </div>
    </LoadingShell>
  )
}
