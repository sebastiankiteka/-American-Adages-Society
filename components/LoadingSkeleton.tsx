export function AdageCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border-medium bg-card-bg p-6 shadow-sm">
      <div className="mb-4 h-6 w-3/4 rounded bg-card-bg-muted"></div>
      <div className="mb-2 h-4 w-full rounded bg-card-bg-muted"></div>
      <div className="mb-4 h-4 w-5/6 rounded bg-card-bg-muted"></div>
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded bg-card-bg-muted"></div>
        <div className="h-6 w-20 rounded bg-card-bg-muted"></div>
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-border-medium bg-card-bg p-6 shadow-sm">
      <div className="mb-4 h-6 w-2/3 rounded bg-card-bg-muted"></div>
      <div className="mb-2 h-4 w-full rounded bg-card-bg-muted"></div>
      <div className="mb-4 h-4 w-4/5 rounded bg-card-bg-muted"></div>
      <div className="h-4 w-24 rounded bg-card-bg-muted"></div>
    </div>
  )
}

export function SearchResultSkeleton() {
  return (
    <div className="mb-4 animate-pulse rounded-lg border border-border-medium bg-card-bg p-4">
      <div className="mb-3 h-5 w-1/3 rounded bg-card-bg-muted"></div>
      <div className="mb-2 h-4 w-full rounded bg-card-bg-muted"></div>
      <div className="h-4 w-2/3 rounded bg-card-bg-muted"></div>
    </div>
  )
}














