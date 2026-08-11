'use client';

import { useState, useEffect } from 'react';
import { Radio, Sparkles, X, ChevronRight, AlertCircle } from 'lucide-react';
import { getFeatureFlags } from '@/lib/feature-flags';

export function RegulatoryTickerBanner() {
  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(getFeatureFlags().regulatoryTicker);
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      if (customEvent.detail?.regulatoryTicker !== undefined) {
        setEnabled(customEvent.detail.regulatoryTicker);
      }
    };
    window.addEventListener('nyx:feature-flags-changed', handler);
    return () => window.removeEventListener('nyx:feature-flags-changed', handler);
  }, []);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisText(
        'Sentry AI Analysis: AZ ADHS R9-10-308 update requires 2 hours of annual de-escalation refresher for all acute psych nurses. Your facility is 94% compliant; 3 RNs require renewal before April 1.'
      );
    }, 1200);
  };

  if (!enabled || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-teal-950 border-b border-purple-500/30 text-purple-200 px-4 py-2 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <Radio className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
        <div>
          <span className="font-bold text-purple-300">2026 Regulatory Update Ticker:</span>{' '}
          <span className="text-slate-300">
            AZ ADHS A.A.C. R9-10-308 Behavioral Health De-escalation & Restraint Training Rule Revision Effective Q2 2026.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {analysisText ? (
          <div className="text-[11px] text-teal-300 font-medium bg-teal-950/60 px-3 py-1 rounded-lg border border-teal-500/30 max-w-md truncate">
            {analysisText}
          </div>
        ) : (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-sm"
          >
            <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing Impact...' : 'Analyze Impact with Sentry AI'}
          </button>
        )}

        <button onClick={() => setDismissed(true)} className="text-purple-400/60 hover:text-purple-200 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
