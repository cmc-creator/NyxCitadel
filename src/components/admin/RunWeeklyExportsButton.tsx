'use client';

import { useState } from 'react';
import { FileBarChart2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function RunWeeklyExportsButton() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runNow() {
    setRunning(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/export-summaries/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'weekly' }),
      });
      const data = (await res.json()) as { sent?: number; recipients?: number; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Failed to send weekly exports');
      setMessage(`Sent ${data.sent ?? 0} of ${data.recipients ?? 0} export summaries.`);
      toast({
        title: 'Weekly Exports Sent',
        description: `Delivered ${data.sent ?? 0} summary emails.`,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to send weekly exports';
      setError(message);
      toast({ title: 'Weekly Exports Failed', description: message, variant: 'destructive' });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={runNow}
        disabled={running}
        className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
      >
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileBarChart2 className="w-4 h-4" />}
        {running ? 'Sending Exports…' : 'Send Weekly Exports'}
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
