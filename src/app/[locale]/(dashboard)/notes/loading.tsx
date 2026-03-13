import { SkeletonPageHeader, SkeletonStatCards, SkeletonCards } from '@/components/ui/skeleton-luxury'

export default function NotesLoading() {
  return (
    <div className="space-y-6 pb-6">
      <SkeletonPageHeader />
      <SkeletonStatCards count={2} />
      <SkeletonCards count={6} />
    </div>
  )
}
