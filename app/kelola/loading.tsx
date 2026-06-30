import { LoadingShell, HeroSkeleton, StatGridSkeleton, RowsSkeleton } from "@/components/Skeleton"

export default function Loading() {
  return (
    <LoadingShell narrow>
      <HeroSkeleton />
      <StatGridSkeleton count={3} />
      <div className="mt-8">
        <RowsSkeleton rows={7} />
      </div>
    </LoadingShell>
  )
}
