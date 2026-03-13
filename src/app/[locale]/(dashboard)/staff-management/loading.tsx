import { SkeletonPageHeader, SkeletonStatCards, SkeletonCards } from '@/components/ui/skeleton-luxury'

export default function StaffManagementLoading() {
  return (
    <div className="space-y-6 pb-6">
      <SkeletonPageHeader />
      <SkeletonStatCards count={3} />
      <SkeletonCards count={6} />
    </div>
  )
}
