'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Clock3, TriangleAlert } from 'lucide-react';

type StatusRow = {
  facilityId: string;
  facilityName: string;
  usersProcessed: number;
  notificationsCreated: number;
  digestsSent: number;
  failures: number;
  lastRunAt: string;
};

type StatusResponse = {
  lastRuns: StatusRow[];
  history: Array<{
    runType: 'alerts' | 'exports';
    mode: 'daily' | 'weekly' | 'immediate';
    facilityId: string;
    facilityName: string;
    usersProcessed: number;
    notificationsCreated: number;
    digestsSent: number;
    recipients: number;
    sent: number;
    failures: number;
    triggeredBy: 'cron' | 'admin';
    createdAt: string;
  }>;
  totals: {
    usersProcessed: number;
    notificationsCreated: number;
    digestsSent: number;
    failures: number;
  };
  nextRunAt: string;
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export function AutomationStatusCard() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/alerts/status');
        if (!res.ok) return;
        const payload = (await res.json()) as StatusResponse;
        setData(payload);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const hasFailures = useMemo(() => (data?.totals.failures ?? 0) > 0, [data]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-foreground">Automation Status</h3>
      </div>

      {loading && <p className="text-xs text-muted-foreground">Loading latest run status...</p>}

      {!loading && !data && (
        <p className="text-xs text-muted-foreground">No run history yet. Run alerts now to initialize status tracking.</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-muted-foreground">Users</p>
              <p className="text-foreground font-semibold">{data.totals.usersProcessed}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-muted-foreground">Alerts</p>
              <p className="text-foreground font-semibold">{data.totals.notificationsCreated}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-muted-foreground">Digests</p>
              <p className="text-foreground font-semibold">{data.totals.digestsSent}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-2">
              <p className="text-muted-foreground">Failures</p>
              <p className={`font-semibold ${hasFailures ? 'text-red-400' : 'text-emerald-400'}`}>{data.totals.failures}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5" /> Next run: {formatDateTime(data.nextRunAt)}
            </span>
            {hasFailures && (
              <span className="inline-flex items-center gap-1 text-red-400">
                <TriangleAlert className="w-3.5 h-3.5" /> Some facilities reported failures
              </span>
            )}
          </div>

          {data.lastRuns.length > 0 && (
            <div className="pt-1 border-t border-border/40">
              <p className="text-xs text-muted-foreground mb-1.5">Last run by facility</p>
              <div className="space-y-1">
                {data.lastRuns.slice(0, 5).map((r) => (
                  <div key={r.facilityId} className="text-xs text-foreground/80 flex items-center justify-between gap-2">
                    <span className="truncate">{r.facilityName}</span>
                    <span className="text-muted-foreground shrink-0">{formatDateTime(r.lastRunAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.history.length > 0 && (
            <div className="pt-1 border-t border-border/40">
              <p className="text-xs text-muted-foreground mb-1.5">Recent automation activity</p>
              <div className="space-y-2">
                {data.history.slice(0, 6).map((entry, index) => (
                  <div key={`${entry.runType}-${entry.facilityId}-${entry.createdAt}-${index}`} className="rounded-md bg-muted/20 p-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground/90">
                        {entry.facilityName} · {entry.runType === 'alerts' ? 'Alerts' : 'Exports'}
                      </span>
                      <span className="text-muted-foreground">{formatDateTime(entry.createdAt)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
                      <span>{entry.triggeredBy === 'admin' ? 'Manual' : 'Scheduled'}</span>
                      <span>Mode: {entry.mode}</span>
                      {entry.runType === 'alerts' ? (
                        <span>{entry.notificationsCreated} alerts · {entry.digestsSent} digests</span>
                      ) : (
                        <span>{entry.sent} sent · {entry.recipients} recipients</span>
                      )}
                      <span className={entry.failures > 0 ? 'text-red-400' : 'text-emerald-400'}>
                        {entry.failures > 0 ? `${entry.failures} failures` : 'No failures'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
