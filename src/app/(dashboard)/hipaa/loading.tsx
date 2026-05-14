export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-64 rounded-md bg-muted/60" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="h-4 w-20 rounded bg-muted/60" />
            <div className="h-8 w-14 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="h-5 w-32 rounded bg-muted/60" />
          <div className="h-8 w-24 rounded-lg bg-muted/60" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-4 w-4 rounded bg-muted/40 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 rounded bg-muted/60" style={{ width: `${50 + (i % 4) * 12}%` }} />
                <div className="h-3 w-28 rounded bg-muted/40" />
              </div>
              <div className="h-6 w-16 rounded-full bg-muted/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

