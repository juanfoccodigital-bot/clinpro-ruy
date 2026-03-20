function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-64 space-y-3 border-r p-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="flex flex-1 flex-col p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="ml-auto h-16 w-2/3" />
          <Skeleton className="h-16 w-3/4" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
