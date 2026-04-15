function SkeletonBox({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-2xl ${className}`} />
  );
}

function PetCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <SkeletonBox className="w-16 h-16 rounded-full" />
        <div className="flex-1 flex flex-col gap-2">
          <SkeletonBox className="h-5 w-32" />
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-3 w-20" />
        </div>
      </div>
      <SkeletonBox className="h-8 w-full" />
      <div className="flex gap-2">
        <SkeletonBox className="h-9 flex-1" />
        <SkeletonBox className="h-9 w-20" />
        <SkeletonBox className="h-9 w-16" />
      </div>
    </div>
  );
}

function RecordCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <SkeletonBox className="h-5 w-32" />
        <SkeletonBox className="h-6 w-24 rounded-full" />
      </div>
      <SkeletonBox className="h-4 w-40" />
      <SkeletonBox className="h-4 w-36" />
      <div className="flex gap-2 mt-1">
        <SkeletonBox className="h-9 flex-1" />
        <SkeletonBox className="h-9 w-16" />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <SkeletonBox className="h-7 w-40" />
        <SkeletonBox className="h-10 w-32" />
      </div>
      <SkeletonBox className="h-12 w-full mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <PetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export { SkeletonBox, PetCardSkeleton, RecordCardSkeleton, PageSkeleton };