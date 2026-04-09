export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page title bar */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-72 rounded-md bg-muted/60" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="h-4 w-24 rounded bg-muted/60" />
            <div className="h-8 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Main content block */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="h-5 w-32 rounded bg-muted/60" />
          <div className="flex gap-2">
            <div className="h-8 w-24 rounded-lg bg-muted/60" />
            <div className="h-8 w-20 rounded-lg bg-muted/60" />
          </div>
        </div>
        {/* Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-4 w-4 rounded bg-muted/40 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 rounded bg-muted/60" style={{ width: `${55 + (i % 3) * 15}%` }} />
                <div className="h-3 w-32 rounded bg-muted/40" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted/40" />
              <div className="h-4 w-20 rounded bg-muted/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
