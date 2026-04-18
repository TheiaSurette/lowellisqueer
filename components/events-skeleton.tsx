export function EventsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-[1100px] px-8 pb-24">
      <div className="mb-10 h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-[2fr_1fr] gap-8 max-md:grid-cols-1">
        <div className="animate-pulse border-l-[3px] border-muted p-8">
          <div className="mb-3 h-8 w-64 rounded bg-muted" />
          <div className="mb-2 h-4 w-full rounded bg-muted" />
          <div className="mb-5 h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-48 rounded bg-muted" />
        </div>
        <div className="flex flex-col gap-8">
          {Array.from({ length: Math.min(count - 1, 2) }).map((_, i) => (
            <div key={i} className="animate-pulse border-l-[3px] border-muted p-8">
              <div className="mb-3 h-6 w-48 rounded bg-muted" />
              <div className="mb-5 h-4 w-full rounded bg-muted" />
              <div className="h-3 w-40 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UpcomingRowsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="bg-secondary py-20">
      <div className="mx-auto max-w-[1100px] px-8">
        <div className="mb-10 h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="flex flex-col">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="grid animate-pulse grid-cols-[80px_1fr_auto] items-center gap-8 border-b border-border py-6"
            >
              <div className="text-center">
                <div className="mx-auto mb-1 h-3 w-8 rounded bg-muted" />
                <div className="mx-auto h-7 w-6 rounded bg-muted" />
              </div>
              <div>
                <div className="mb-1 h-5 w-48 rounded bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
              <div className="h-4 w-36 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScheduleSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse border-b border-border pb-4">
          <div className="mb-1 h-4 w-28 rounded bg-muted" />
          <div className="h-5 w-64 rounded bg-muted" />
          <div className="mt-1 h-4 w-44 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
