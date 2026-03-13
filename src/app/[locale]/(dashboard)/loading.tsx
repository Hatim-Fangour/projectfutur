import { SkeletonPageHeader, SkeletonStatCards, SkeletonTable, SkeletonCards } from '@/components/ui/skeleton-luxury'

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-6">
      <SkeletonPageHeader />
      <SkeletonStatCards count={5} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCards count={2} />
      </div>
      <SkeletonTable rows={5} cols={5} />
    </div>
  )
}
