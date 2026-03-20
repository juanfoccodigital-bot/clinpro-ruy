function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] gap-0 overflow-hidden rounded-xl border bg-card">
      {/* Left sidebar - Contact list */}
      <div className="w-80 shrink-0 border-r">
        {/* Search */}
        <div className="border-b p-4">
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Contact items */}
        <div className="space-y-1 p-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>

      {/* Right area - Chat */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 p-6">
          {/* Received message */}
          <div className="flex justify-start">
            <Skeleton className="h-12 w-56 rounded-2xl" />
          </div>
          {/* Sent message */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-44 rounded-2xl" />
          </div>
          {/* Received message */}
          <div className="flex justify-start">
            <Skeleton className="h-16 w-64 rounded-2xl" />
          </div>
          {/* Sent message */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-52 rounded-2xl" />
          </div>
          {/* Received message */}
          <div className="flex justify-start">
            <Skeleton className="h-12 w-48 rounded-2xl" />
          </div>
        </div>

        {/* Input area */}
        <div className="flex items-center gap-3 border-t p-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
