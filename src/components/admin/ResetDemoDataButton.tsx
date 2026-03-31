'use client';

import { useState } from 'react';
import { RefreshCw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type ResetResult = {
  incidentsCreated: number;
  trainingsCreated: number;
  drillsCreated: number;
  templates: {
    calendarEventsCreated: number;
    policiesCreated: number;
    capsCreated: number;
  };
};

export function ResetDemoDataButton() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runReset() {
    const confirmed = window.confirm('This will reset demo operational data for your facility (incidents, CAPs, policies, drills, notifications) and repopulate a clean demo set. Continue?');
    if (!confirmed) return;

    setRunning(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/demo/reset', { method: 'POST' });
      const data = (await res.json()) as ResetResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to reset demo data');

      const summary = `Templates ${data.templates.calendarEventsCreated + data.templates.policiesCreated + data.templates.capsCreated} · Incidents ${data.incidentsCreated} · Training ${data.trainingsCreated} · Drills ${data.drillsCreated}`;
      setMessage(summary);
      toast({ title: 'Demo Data Reset Complete', description: summary });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to reset demo data';
      setError(msg);
      toast({ title: 'Demo Data Reset Failed', description: msg, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={runReset}
        disabled={running}
        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
      >
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        {running ? 'Resetting Demo Data…' : 'Reset Demo Data'}
      </button>
      {message && (
        <p className="text-xs text-emerald-400 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {message}
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
