function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Banner */}
      <Skeleton className="h-24 w-full rounded-2xl" />

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="rounded-xl border bg-card p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
