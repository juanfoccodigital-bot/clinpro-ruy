function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="w-full space-y-6 p-6">
      {/* Banner */}
      <Skeleton className="h-28 w-full rounded-2xl" />

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>

      {/* Chart */}
      <Skeleton className="h-[380px] rounded-2xl" />

      {/* Table */}
      <Skeleton className="h-[400px] rounded-2xl" />
    </div>
  );
}
