function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Welcome banner */}
      <Skeleton className="h-20 w-full" />

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card">
        {/* Table header */}
        <div className="flex gap-4 border-b p-4">
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/5" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b p-4 last:border-b-0">
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/5" />
            <Skeleton className="h-4 w-1/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
