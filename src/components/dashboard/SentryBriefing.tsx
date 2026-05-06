'use client';

import { useEffect, useState } from 'react';
import { Bot, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const DISMISS_KEY = 'sentry_briefing_dismissed';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function SentryBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [allClear, setAllClear] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(DISMISS_KEY);
      if (stored === getTodayKey()) {
        setDismissed(true);
        setLoading(false);
        return;
      }
    } catch { /* sessionStorage not available */ }

    fetch('/api/ai-chat/briefing')
      .then(r => r.json())
      .then(data => {
        if (data.reason === 'no_api_key') {
          setLoading(false);
          return;
        }
        if (data.error) {
          setError(data.error);
        } else {
          setBriefing(data.briefing);
          setAllClear(!!data.allClear);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISS_KEY, getTodayKey()); } catch { /* ignore */ }
  }

  if (loading || dismissed || (!briefing && !error)) return null;

  const tealStyle   = 'bg-teal-950/20 border-teal-700/40';
  const greenStyle  = 'bg-emerald-950/20 border-emerald-700/40';
  const containerCls = `rounded-xl border p-4 flex items-start gap-3 ${allClear ? greenStyle : tealStyle}`;
  const iconBg   = allClear ? 'bg-emerald-900/40' : 'bg-teal-900/40';
  const iconCls  = allClear ? 'text-emerald-400' : 'text-teal-400';
  const labelCls = allClear ? 'text-emerald-400' : 'text-teal-400';
  const linkCls  = allClear ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-400 hover:text-teal-300';

  return (
    <div className={containerCls}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Bot className={`w-4 h-4 ${iconCls}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${labelCls}`}>
          Sentry &mdash; Daily Briefing
        </p>
        {error ? (
          <p className="text-xs text-red-400">Could not generate briefing. Try refreshing.</p>
        ) : (
          <p className="text-sm text-foreground/80 leading-relaxed">{briefing}</p>
        )}
        <Link
          href="/assistant"
          className={`inline-flex items-center gap-0.5 text-xs mt-2 font-medium transition-colors ${linkCls}`}
        >
          Ask Sentry a question <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <button
        onClick={dismiss}
        className="p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0 mt-0.5"
        title="Dismiss for today"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground/50" />
      </button>
    </div>
  );
}
