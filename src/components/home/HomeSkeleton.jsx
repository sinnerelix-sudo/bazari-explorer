import { Skeleton } from "@/components/ui/skeleton";

export default function HomeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      {/* Category Bar Skeleton */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-hidden mb-8 sm:justify-center">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
            <Skeleton className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
        ))}
      </div>

      {/* Hero Banner Skeleton */}
      <Skeleton className="w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-2xl sm:rounded-3xl mb-8" />

      {/* Campaign Banner Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl hidden sm:block" />
      </div>

      {/* Product Grid Skeleton */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="h-6 w-40 rounded" />
          </div>
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-2xl w-full" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
