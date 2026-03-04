import { SkeletonPageHeader, SkeletonStatCards, SkeletonTable } from '@/components/ui/skeleton-luxury'

export default function CustomersLoading() {
  return (
    <div className="space-y-6 pb-6">
      <SkeletonPageHeader />
      <SkeletonStatCards count={3} />
      <SkeletonTable rows={8} cols={5} />
    </div>
  )
}
