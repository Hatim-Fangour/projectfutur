import { SkeletonLuxury, SkeletonPageHeader, SkeletonStatCards, SkeletonTable } from '@/components/ui/skeleton-luxury'

export default function FinanceManagementLoading() {
  return (
    <div className="space-y-6 pb-6">
      <SkeletonPageHeader />
      <SkeletonStatCards count={3} />

      {/* Tabs */}
      <div className="flex gap-2">
        <SkeletonLuxury className="h-9 w-32" />
        <SkeletonLuxury className="h-9 w-24" />
        <SkeletonLuxury className="h-9 w-28" />
      </div>

      <SkeletonTable rows={8} cols={6} />
    </div>
  )
}
