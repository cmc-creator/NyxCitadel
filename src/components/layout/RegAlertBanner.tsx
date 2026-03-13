'use client';

import { useState } from 'react';
import { AlertTriangle, X, ExternalLink, Radio, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export interface AlertItem {
  id: string;
  title: string;
  agency: string;
  docType: string | null;
  impactLevel: string;
  url: string;
  publishedAt: string;
}

interface Props {
  critical: AlertItem[];
  highCount: number;
}

const AGENCY_SHORT: Record<string, string> = {
  CMS: 'CMS', OSHA: 'OSHA', DEA: 'DEA', HHS_OCR: 'HHS/OCR',
  HRSA: 'HRSA', SAMHSA: 'SAMHSA', AZ_ADHS: 'AZ ADHS', JC: 'Joint Commission',
};

export default function RegAlertBannerClient({ critical: initial, highCount }: Props) {
  const [items, setItems] = useState<AlertItem[]>(initial);
  const [expanded, setExpanded] = useState(true);

  const dismiss = async (id: string) => {
    // Optimistically remove from view
    setItems(prev => prev.filter(i => i.id !== id));
    // Mark as read in DB
    await fetch(`/api/reg-updates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: true }),
    });
  };

  const dismissAll = async () => {
    const ids = items.map(i => i.id);
    setItems([]);
    await Promise.all(
      ids.map(id =>
        fetch(`/api/reg-updates/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        }),
      ),
    );
  };

  if (items.length === 0 && highCount === 0) return null;

  const total = items.length + highCount;

  return (
    <div className="border-b border-red-700/40 bg-red-950/30">
      {/* ── Banner header ───────────────────────────────────────────────────── */}
      <div className="px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
            <Radio className="w-3.5 h-3.5 text-red-400" />
          </div>
          <span className="text-sm font-bold text-red-300">
            {total} regulatory alert{total !== 1 ? 's' : ''} require attention
          </span>
          {items.length === 0 && highCount > 0 && (
            <span className="text-xs text-red-400/70">
              — {highCount} high-impact update{highCount !== 1 ? 's' : ''} in feed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/intelligence/updates"
            className="text-xs text-red-300 hover:text-white font-medium underline underline-offset-2 transition"
          >
            View all
          </Link>
          {items.length > 0 && (
            <button
              onClick={dismissAll}
              className="text-xs text-red-400 hover:text-red-200 transition px-2 py-0.5 rounded hover:bg-red-900/40"
            >
              Dismiss all
            </button>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-0.5 rounded text-red-400 hover:text-red-200 hover:bg-red-900/40 transition"
            aria-label={expanded ? 'Collapse alerts' : 'Expand alerts'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Alert cards ─────────────────────────────────────────────────────── */}
      {expanded && items.length > 0 && (
        <div className="px-6 pb-3 space-y-2">
          {items.map(item => {
            const date = new Date(item.publishedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            });
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-red-300 bg-red-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      {item.impactLevel}
                    </span>
                    <span className="text-[10px] text-red-400/80 font-medium">
                      {AGENCY_SHORT[item.agency] ?? item.agency}
                    </span>
                    {item.docType && (
                      <span className="text-[10px] text-red-400/60">{item.docType}</span>
                    )}
                    <span className="text-[10px] text-red-500/60 ml-auto">{date}</span>
                  </div>
                  <p className="text-sm text-red-100 font-medium leading-snug line-clamp-2">
                    {item.title}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded text-red-400 hover:text-red-200 hover:bg-red-900/40 transition"
                    title="Open source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => dismiss(item.id)}
                    className="p-1 rounded text-red-500/60 hover:text-red-200 hover:bg-red-900/40 transition"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {highCount > 0 && items.length > 0 && (
            <p className="text-xs text-red-400/70 pl-1">
              +{highCount} high-priority update{highCount !== 1 ? 's' : ''} in{' '}
              <Link href="/intelligence/updates" className="underline hover:text-red-300 transition">
                the regulatory feed
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
