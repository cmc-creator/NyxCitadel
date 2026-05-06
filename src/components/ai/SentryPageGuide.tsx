'use client';

import { useState, useEffect } from 'react';
import { Bot, X, ChevronDown, ChevronUp } from 'lucide-react';

interface SentryPageGuideProps {
  pageKey: string;
  title: string;
  body: string;
  tips?: string[];
}

const MAX_AUTO_SHOWS = 5;

export function SentryPageGuide({ pageKey, title, body, tips }: SentryPageGuideProps) {
  const storageKey = `sentry_seen_${pageKey}`;
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === 'dismissed') return;
      const count = raw ? parseInt(raw, 10) : 0;
      if (count < MAX_AUTO_SHOWS) {
        setVisible(true);
        localStorage.setItem(storageKey, String(count + 1));
      }
    } catch {
      // localStorage unavailable (SSR guard, private browsing, etc.)
      setVisible(true);
    }
  }, [storageKey]);

  function dismiss() {
    try { localStorage.setItem(storageKey, 'dismissed'); } catch { /* ignore */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-5 rounded-xl border border-teal-800/40 bg-teal-950/25 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-teal-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-teal-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-teal-200">{title}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setCollapsed(c => !c)}
                className="p-1 rounded hover:bg-teal-800/40 text-teal-400 hover:text-teal-200 transition-colors"
                aria-label={collapsed ? 'Expand' : 'Collapse'}
              >
                {collapsed
                  ? <ChevronDown className="w-3.5 h-3.5" />
                  : <ChevronUp className="w-3.5 h-3.5" />
                }
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="p-1 rounded hover:bg-teal-800/40 text-teal-400 hover:text-teal-200 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className="mt-1.5">
              <p className="text-sm text-teal-100/80 leading-relaxed">{body}</p>
              {tips && tips.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-teal-200/70">
                      <span className="text-teal-500 mt-0.5 flex-shrink-0">&#x2022;</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                onClick={dismiss}
                className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition-colors underline underline-offset-2"
              >
                Got it, don&#39;t show again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
