export function AdageCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray animate-pulse">
      <div className="h-6 bg-soft-gray rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-soft-gray rounded w-full mb-2"></div>
      <div className="h-4 bg-soft-gray rounded w-5/6 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-soft-gray rounded w-16"></div>
        <div className="h-6 bg-soft-gray rounded w-20"></div>
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-soft-gray animate-pulse">
      <div className="h-6 bg-soft-gray rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-soft-gray rounded w-full mb-2"></div>
      <div className="h-4 bg-soft-gray rounded w-4/5 mb-4"></div>
      <div className="h-4 bg-soft-gray rounded w-24"></div>
    </div>
  )
}

export function SearchResultSkeleton() {
  return (
    <div className="bg-white p-4 rounded-lg border border-soft-gray animate-pulse mb-4">
      <div className="h-5 bg-soft-gray rounded w-1/3 mb-3"></div>
      <div className="h-4 bg-soft-gray rounded w-full mb-2"></div>
      <div className="h-4 bg-soft-gray rounded w-2/3"></div>
    </div>
  )
}














