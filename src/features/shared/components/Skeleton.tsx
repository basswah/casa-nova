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
  <div className="space-y-2">
    <div className="flex gap-4 p-3">
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-3 border-t border-brand-border">
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
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
