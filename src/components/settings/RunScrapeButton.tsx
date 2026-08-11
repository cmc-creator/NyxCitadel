'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface RunResult {
  ok: boolean;
  newCount?: number;
  totalFetched?: number;
  durationMs?: number;
  sources?: string[];
  errors?: string[];
  error?: string;
}

export function RunScrapeButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<RunResult | null>(null);

  async function handleRun() {
    setState('running');
    setResult(null);
    try {
      const res = await fetch('/api/admin/scrape', { method: 'POST' });
      const data: RunResult = await res.json();
      setResult(data);
      setState(data.ok ? 'done' : 'error');
    } catch {
      setResult({ ok: false, error: 'Network error - check console' });
      setState('error');
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleRun}
        disabled={state === 'running'}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
      >
        {state === 'running' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {state === 'running' ? 'Running scrape...' : 'Run Now'}
      </button>

      {result && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            result.ok
              ? 'border-teal-500/20 bg-teal-500/5'
              : 'border-red-500/20 bg-red-500/5'
          }`}
        >
          {result.ok ? (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">
                  Scrape complete - {result.newCount ?? 0} new update{result.newCount === 1 ? '' : 's'} saved
                </p>
                <p className="text-xs text-muted-foreground">
                  Fetched {result.totalFetched ?? 0} items from {result.sources?.length ?? 0} source{(result.sources?.length ?? 0) === 1 ? '' : 's'}
                  {result.durationMs ? ` in ${(result.durationMs / 1000).toFixed(1)}s` : ''}.
                </p>
                {(result.errors?.length ?? 0) > 0 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Partial errors: {result.errors!.join('; ')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{result.error ?? 'Unknown error'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
