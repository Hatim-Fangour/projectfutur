import { SkeletonPageHeader, SkeletonStatCards, SkeletonTable } from '@/components/ui/skeleton-luxury'

export default function InventoryLoading() {
  return (
    <div className="space-y-6 pb-6">
      <SkeletonPageHeader />
      <SkeletonStatCards count={4} />
      <SkeletonTable rows={5} cols={7} />
    </div>
  )
}
