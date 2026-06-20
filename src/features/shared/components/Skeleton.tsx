interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-brand-surface-hover rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-brand-dark rounded-xl p-5 border border-brand-border space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-2/3" />
  </div>
);

export const SkeletonTable = ({ rows = 4 }: { rows?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-brand-dark rounded-xl border border-brand-border p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-8 rounded-md" />
          <Skeleton className="h-8 rounded-md" />
          <Skeleton className="h-8 rounded-md" />
          <Skeleton className="h-8 rounded-md" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Skeleton className="h-7 w-14 rounded-md" />
          <Skeleton className="h-7 w-14 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
    ))}
  </div>
);
