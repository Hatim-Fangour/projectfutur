import { SkeletonLuxury, SkeletonPageHeader } from '@/components/ui/skeleton-luxury'

export default function CalendarLoading() {
  return (
    <div className="space-y-6 pb-6">
      <SkeletonPageHeader />

      {/* Calendar toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SkeletonLuxury className="h-10 w-10" />
          <SkeletonLuxury className="h-10 w-10" />
          <SkeletonLuxury className="h-6 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonLuxury className="h-9 w-20" />
          <SkeletonLuxury className="h-9 w-20" />
          <SkeletonLuxury className="h-9 w-20" />
        </div>
      </div>

      {/* Calendar grid */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gold/10">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonLuxury key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <SkeletonLuxury key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
