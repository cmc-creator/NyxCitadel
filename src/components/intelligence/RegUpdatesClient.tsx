'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Radio, ExternalLink, CheckCheck, RefreshCw, Filter,
  AlertTriangle, Info, ChevronDown, ChevronUp, Trash2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegUpdate {
  id: string;
  source: string;
  sourceId: string;
  title: string;
  summary: string | null;
  url: string;
  publishedAt: string;
  agency: string;
  docType: string | null;
  impactLevel: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  updates: RegUpdate[];
  unreadCount: number;
  userRole: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IMPACT_META: Record<string, { label: string; color: string; dot: string }> = {
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-800 border border-red-200',    dot: 'bg-red-500' },
  HIGH:     { label: 'High',     color: 'bg-orange-100 text-orange-800 border border-orange-200', dot: 'bg-orange-500' },
  MEDIUM:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', dot: 'bg-yellow-500' },
  LOW:      { label: 'Low',      color: 'bg-blue-100 text-blue-800 border border-blue-200', dot: 'bg-blue-400' },
  INFO:     { label: 'Info',     color: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400' },
};

const AGENCY_LABELS: Record<string, string> = {
  CMS: 'CMS',
  OSHA: 'OSHA',
  DEA: 'DEA',
  HHS_OCR: 'HHS / OCR',
  HRSA: 'HRSA',
  SAMHSA: 'SAMHSA',
  AZ_ADHS: 'AZ ADHS',
  JC: 'Joint Commission',
};

const AGENCIES = Object.keys(AGENCY_LABELS);
const IMPACTS  = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RegUpdatesClient({ updates: initial, unreadCount: initUnread, userRole }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [updates, setUpdates]       = useState<RegUpdate[]>(initial);
  const [unread, setUnread]         = useState(initUnread);
  const [filterAgency, setAgency]   = useState('');
  const [filterImpact, setImpact]   = useState('');
  const [filterUnread, setUnreadF]  = useState(false);
  const [expanded, setExpanded]     = useState<Set<string>>(new Set());
  const [scraping, setScraping]     = useState(false);
  const [scrapeMsg, setScrapeMsg]   = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const canAdmin = ['ADMIN', 'COMPLIANCE_OFFICER'].includes(userRole);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = updates.filter(u => {
    if (filterAgency && u.agency !== filterAgency) return false;
    if (filterImpact && u.impactLevel !== filterImpact) return false;
    if (filterUnread && u.isRead) return false;
    return true;
  });

  // ── Toggle expand ──────────────────────────────────────────────────────────
  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ── Mark single read ───────────────────────────────────────────────────────
  const markRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/reg-updates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead }),
    });
    setUpdates(prev => prev.map(u => u.id === id ? { ...u, isRead } : u));
    setUnread(prev => isRead ? Math.max(0, prev - 1) : prev + 1);
  };

  // ── Mark all read ──────────────────────────────────────────────────────────
  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch('/api/reg-updates', { method: 'POST' });
      setUpdates(prev => prev.map(u => ({ ...u, isRead: true })));
      setUnread(0);
    } finally {
      setMarkingAll(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteUpdate = async (id: string) => {
    if (!confirm('Remove this update from the feed?')) return;
    await fetch(`/api/reg-updates/${id}`, { method: 'DELETE' });
    setUpdates(prev => prev.filter(u => u.id !== id));
  };

  // ── Trigger scrape ─────────────────────────────────────────────────────────
  const triggerScrape = async () => {
    setScraping(true);
    setScrapeMsg(null);
    try {
      const res = await fetch('/api/reg-scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 90 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Scrape failed');
      setScrapeMsg(
        `Scrape complete — ${data.totalFetched} fetched from ${data.sources?.length ?? 0} sources in ${(data.durationMs / 1000).toFixed(1)}s.`,
      );
      // Refresh to show new items
      startTransition(() => router.refresh());
    } catch (err) {
      setScrapeMsg(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setScraping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="w-6 h-6 text-rose-400" />
            Regulatory Intelligence Feed
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Live updates from CMS, OSHA, DEA, HHS/OCR, AZ ADHS, and The Joint Commission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
                         bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-60"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          {canAdmin && (
            <button
              onClick={triggerScrape}
              disabled={scraping}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg
                         bg-rose-600 hover:bg-rose-700 text-white font-medium transition disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${scraping ? 'animate-spin' : ''}`} />
              {scraping ? 'Scraping…' : 'Run scrape now'}
            </button>
          )}
        </div>
      </div>

      {/* ── Scrape result message ────────────────────────────────────────────── */}
      {scrapeMsg && (
        <div className={`text-sm rounded-lg px-4 py-2.5 ${scrapeMsg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {scrapeMsg}
        </div>
      )}

      {/* ── Stat row ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map(lvl => {
          const count = updates.filter(u => u.impactLevel === lvl).length;
          const meta  = IMPACT_META[lvl];
          return (
            <div key={lvl}
              className="bg-white rounded-xl border border-slate-200 px-4 py-3 cursor-pointer
                         hover:shadow-sm transition"
              onClick={() => setImpact(filterImpact === lvl ? '' : lvl)}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                <span className="text-xs text-slate-500 font-medium">{meta.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{count}</p>
            </div>
          );
        })}
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
        <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />

        <select
          value={filterAgency}
          onChange={e => setAgency(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Agencies</option>
          {AGENCIES.map(a => (
            <option key={a} value={a}>{AGENCY_LABELS[a]}</option>
          ))}
        </select>

        <select
          value={filterImpact}
          onChange={e => setImpact(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Levels</option>
          {IMPACTS.map(i => (
            <option key={i} value={i}>{IMPACT_META[i].label}</option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filterUnread}
            onChange={e => setUnreadF(e.target.checked)}
            className="rounded border-slate-300"
          />
          Unread only
        </label>

        {(filterAgency || filterImpact || filterUnread) && (
          <button
            onClick={() => { setAgency(''); setImpact(''); setUnreadF(false); }}
            className="text-xs text-blue-600 hover:underline ml-auto"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400">{filtered.length} items</span>
      </div>

      {/* ── Feed list ────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Info className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">No updates found</p>
          <p className="text-sm mt-1">
            {canAdmin
              ? 'Click "Run scrape now" to fetch the latest regulatory updates.'
              : 'No updates match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(update => {
            const meta      = IMPACT_META[update.impactLevel] ?? IMPACT_META.INFO;
            const isExpanded = expanded.has(update.id);
            const date       = new Date(update.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            });

            return (
              <div
                key={update.id}
                className={`bg-white border rounded-xl transition
                  ${update.isRead ? 'border-slate-200' : 'border-blue-300 shadow-sm shadow-blue-50'}
                  ${update.impactLevel === 'CRITICAL' ? 'border-l-4 border-l-red-500' : ''}
                  ${update.impactLevel === 'HIGH' ? 'border-l-4 border-l-orange-500' : ''}
                `}
              >
                {/* Row header */}
                <div className="flex items-start gap-3 px-4 py-3">
                  {/* Unread dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    {!update.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                    )}
                    {update.isRead && (
                      <span className="w-2 h-2 rounded-full bg-transparent block" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {AGENCY_LABELS[update.agency] ?? update.agency}
                      </span>
                      {update.docType && (
                        <span className="text-xs text-slate-400">{update.docType}</span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">{date}</span>
                    </div>

                    <p className={`text-sm font-semibold leading-snug ${update.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                      {update.title}
                    </p>

                    {isExpanded && update.summary && (
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        {update.summary}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <a
                      href={update.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Open source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => markRead(update.id, !update.isRead)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      title={update.isRead ? 'Mark unread' : 'Mark read'}
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>

                    {update.summary && (
                      <button
                        onClick={() => toggleExpand(update.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {canAdmin && (
                      <button
                        onClick={() => deleteUpdate(update.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
