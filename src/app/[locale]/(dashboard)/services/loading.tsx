import { SkeletonLuxury, SkeletonPageHeader, SkeletonCards } from '@/components/ui/skeleton-luxury'

export default function ServicesLoading() {
  return (
    <div className="space-y-6 pb-6">
      <SkeletonPageHeader />

      {/* Tabs */}
      <div className="flex gap-2">
        <SkeletonLuxury className="h-9 w-28" />
        <SkeletonLuxury className="h-9 w-28" />
        <SkeletonLuxury className="h-9 w-28" />
      </div>

      <SkeletonCards count={6} />
    </div>
  )
}
