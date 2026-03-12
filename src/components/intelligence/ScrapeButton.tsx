'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface ScrapeResult {
  success: boolean;
  newCount: number;
  totalFetched: number;
  sources: string[];
  durationMs: number;
  errors?: string[];
}

interface Props {
  /** Visual style variant */
  variant?: 'primary' | 'secondary';
  /** Callback after a successful scrape */
  onComplete?: (result: ScrapeResult) => void;
  /** Show detailed result inline after completion */
  showResult?: boolean;
}

export default function ScrapeButton({ variant = 'primary', showResult = true, onComplete }: Props) {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [errMsg, setErrMsg] = useState('');

  const run = async () => {
    setState('running');
    setResult(null);
    setErrMsg('');

    try {
      const res = await fetch('/api/reg-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 90 }),
      });
      const data: ScrapeResult = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error ?? 'Scrape failed');

      setResult(data);
      setState('done');
      onComplete?.(data);

      // Auto-reset icon after 8 seconds
      setTimeout(() => setState('idle'), 8000);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
      setTimeout(() => setState('idle'), 8000);
    }
  };

  const isRunning = state === 'running';

  const baseClasses =
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-1';

  const variantClasses =
    variant === 'primary'
      ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus:ring-slate-400';

  return (
    <div className="space-y-2">
      <button
        onClick={run}
        disabled={isRunning}
        className={`${baseClasses} ${variantClasses}`}
      >
        <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
        {isRunning ? 'Scraping regulatory feeds…' : 'Sync Regulatory Updates'}
      </button>

      {showResult && state === 'done' && result && (
        <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>{result.newCount} new update{result.newCount !== 1 ? 's' : ''}</strong> saved
            {' '}({result.totalFetched} fetched from {result.sources?.length ?? 0} sources
            in {(result.durationMs / 1000).toFixed(1)}s).{' '}
            <a href="/intelligence/updates" className="underline font-medium">View feed →</a>
          </span>
        </div>
      )}

      {showResult && state === 'error' && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{errMsg || 'Scrape failed — check your network connection.'}</span>
        </div>
      )}
    </div>
  );
}
