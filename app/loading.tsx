import { LoadingShell, HeroSkeleton, StatGridSkeleton, TableSkeleton } from "@/components/Skeleton"

export default function Loading() {
  return (
    <LoadingShell>
      <HeroSkeleton />
      <StatGridSkeleton count={4} />
      <div className="mt-8">
        <TableSkeleton rows={8} />
      </div>
    </LoadingShell>
  )
}
