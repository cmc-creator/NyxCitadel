'use client';

import { useState } from 'react';
import { BellRing, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type RunResult = {
  usersProcessed: number;
  notificationsCreated: number;
  digestsSent: number;
};

export function RunAlertsNowButton() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runNow() {
    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/admin/alerts/run', { method: 'POST' });
      const data = (await res.json()) as {
        usersProcessed: number;
        notificationsCreated: number;
        digestsSent: number;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to run alerts');
      }

      setResult({
        usersProcessed: data.usersProcessed,
        notificationsCreated: data.notificationsCreated,
        digestsSent: data.digestsSent,
      });
      toast({
        title: 'Alert Sweep Completed',
        description: `Processed ${data.usersProcessed} users and created ${data.notificationsCreated} alerts.`,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to run alerts';
      setError(message);
      toast({ title: 'Alert Sweep Failed', description: message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={runNow}
        disabled={running}
        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
      >
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
        {running ? 'Running Alerts…' : 'Run Alerts Now'}
      </button>

      {result && (
        <p className="text-xs text-emerald-400 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Processed {result.usersProcessed} users · {result.notificationsCreated} alerts · {result.digestsSent} digests
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 inline-flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
