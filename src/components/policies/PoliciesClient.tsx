'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText, Search, ArrowUpDown, Download, Plus, Upload,
  Clock, CheckCircle, AlertTriangle, Archive, RotateCcw, ExternalLink, Trash2,
} from 'lucide-react';
import { differenceInCalendarDays, isPast, addYears, addMonths } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface PolicyRow {
  id: string;
  policyNumber: string;
  title: string;
  category: string;
  version: string;
  owner: string | null;
  standardRef: string | null;
  summary: string | null;
  documentUrl: string | null;
  effectiveDate: string;
  nextReviewDate: string;
  lastReviewedDate: string | null;
  reviewFrequency: string;
  status: string;
  regulatoryBody: string[];
}

interface Props {
  initialData: PolicyRow[];
}

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  ADMINISTRATIVE:         'Administrative',
  CLINICAL:               'Clinical',
  EMERGENCY_MANAGEMENT:   'Emergency Management',
  ENVIRONMENT_OF_CARE:    'Environment of Care',
  HUMAN_RESOURCES:        'Human Resources',
  INFECTION_CONTROL:      'Infection Control',
  INFORMATION_MANAGEMENT: 'Information Management',
  LEADERSHIP:             'Leadership',
  LIFE_SAFETY:            'Life Safety',
  MEDICATION_MANAGEMENT:  'Medication Management',
  PATIENT_RIGHTS:         'Patient Rights',
  PERFORMANCE_IMPROVEMENT:'Performance Improvement',
  PRIVACY_SECURITY:       'Privacy & Security',
  OTHER:                  'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  ADMINISTRATIVE:         'bg-slate-100 text-slate-700 border-slate-200',
  CLINICAL:               'bg-blue-100 text-blue-700 border-blue-200',
  EMERGENCY_MANAGEMENT:   'bg-red-100 text-red-700 border-red-200',
  ENVIRONMENT_OF_CARE:    'bg-green-100 text-green-700 border-green-200',
  HUMAN_RESOURCES:        'bg-violet-100 text-violet-700 border-violet-200',
  INFECTION_CONTROL:      'bg-teal-100 text-teal-700 border-teal-200',
  INFORMATION_MANAGEMENT: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  LEADERSHIP:             'bg-indigo-100 text-indigo-700 border-indigo-200',
  LIFE_SAFETY:            'bg-orange-100 text-orange-700 border-orange-200',
  MEDICATION_MANAGEMENT:  'bg-pink-100 text-pink-700 border-pink-200',
  PATIENT_RIGHTS:         'bg-teal-100 text-teal-700 border-teal-200',
  PERFORMANCE_IMPROVEMENT:'bg-yellow-100 text-yellow-700 border-yellow-200',
  PRIVACY_SECURITY:       'bg-rose-100 text-rose-700 border-rose-200',
  OTHER:                  'bg-gray-100 text-gray-600 border-gray-200',
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  DRAFT:          { label: 'Draft',          cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  UNDER_REVIEW:   { label: 'Under Review',   cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  ACTIVE:         { label: 'Active',         cls: 'bg-green-100 text-green-800 border-green-200' },
  ARCHIVED:       { label: 'Archived',       cls: 'bg-gray-100 text-gray-400 border-gray-200' },
  OVERDUE_REVIEW: { label: 'Overdue Review', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const SORT_OPTIONS = [
  { value: 'nextReview_asc',  label: 'Next Review (Soonest)' },
  { value: 'nextReview_desc', label: 'Next Review (Latest)' },
  { value: 'title_asc',       label: 'Title (A → Z)' },
  { value: 'title_desc',      label: 'Title (Z → A)' },
  { value: 'policyNum_asc',   label: 'Policy # (Asc)' },
  { value: 'category_asc',    label: 'Category' },
  { value: 'status_asc',      label: 'Status' },
  { value: 'effective_desc',  label: 'Effective Date (Newest)' },
];

const REVIEW_MONTHS: Record<string, number> = {
  ANNUAL: 12, BIENNIAL: 24, SEMI_ANNUAL: 6, QUARTERLY: 3, AS_NEEDED: 12,
};

function fmt(d: string | null) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ReviewBadge({ dateStr, status }: { dateStr: string | null; status: string }) {
  if (!dateStr || status === 'ARCHIVED') return <span className="text-xs text-slate-400">-</span>;
  const date = new Date(dateStr);
  const days = differenceInCalendarDays(date, new Date());
  const overdue = days < 0;
  const urgent  = days >= 0 && days <= 30;
  const soon    = days > 30 && days <= 90;
  const cls = overdue ? 'bg-red-100 text-red-700 border-red-200'
            : urgent  ? 'bg-amber-100 text-amber-700 border-amber-200'
            : soon    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
            :           'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      <Clock className="w-3 h-3" />
      {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d`}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PoliciesClient({ initialData }: Props) {
  const router = useRouter();

  const [data, setData]               = useState<PolicyRow[]>(initialData);
  const [search, setSearch]           = useState('');
  const [filterCat, setFilterCat]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sort, setSort]               = useState('nextReview_asc');
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [actioning, setActioning]     = useState<string | null>(null);

  // ── Stats
  const stats = useMemo(() => {
    const now = new Date();
    const active   = data.filter(p => p.status === 'ACTIVE').length;
    const overdue  = data.filter(p => p.nextReviewDate && isPast(new Date(p.nextReviewDate)) && p.status !== 'ARCHIVED').length;
    const dueSoon  = data.filter(p => {
      if (!p.nextReviewDate || p.status === 'ARCHIVED') return false;
      const d = differenceInCalendarDays(new Date(p.nextReviewDate), now);
      return d >= 0 && d <= 30;
    }).length;
    return { total: data.length, active, overdue, dueSoon };
  }, [data]);

  // ── Category counts
  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of data) {
      m[p.category] = (m[p.category] ?? 0) + 1;
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [data]);

  // ── Filtered + sorted
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let rows = data.filter(p => {
      if (filterCat    && p.category !== filterCat)    return false;
      if (filterStatus && p.status   !== filterStatus) return false;
      if (q && ![ p.title, p.policyNumber, p.owner ?? '', p.standardRef ?? '', p.summary ?? '',
                  CATEGORY_LABELS[p.category] ?? '' ]
              .some(s => s.toLowerCase().includes(q))) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case 'nextReview_asc':  return new Date(a.nextReviewDate || '9999').getTime() - new Date(b.nextReviewDate || '9999').getTime();
        case 'nextReview_desc': return new Date(b.nextReviewDate || '0').getTime() - new Date(a.nextReviewDate || '0').getTime();
        case 'title_asc':       return a.title.localeCompare(b.title);
        case 'title_desc':      return b.title.localeCompare(a.title);
        case 'policyNum_asc':   return a.policyNumber.localeCompare(b.policyNumber, undefined, { numeric: true });
        case 'category_asc':    return a.category.localeCompare(b.category);
        case 'status_asc':      return a.status.localeCompare(b.status);
        case 'effective_desc':  return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime();
        default: return 0;
      }
    });

    return rows;
  }, [data, search, filterCat, filterStatus, sort]);

  // ── Export CSV
  const exportCsv = useCallback(() => {
    const headers = ['Policy #', 'Title', 'Category', 'Version', 'Owner', 'Standard Ref', 'Effective Date', 'Next Review', 'Review Frequency', 'Status', 'Document URL'];
    const rows = filtered.map(p => [
      p.policyNumber, p.title, CATEGORY_LABELS[p.category] ?? p.category,
      p.version, p.owner ?? '', p.standardRef ?? '',
      fmt(p.effectiveDate), fmt(p.nextReviewDate), p.reviewFrequency,
      p.status, p.documentUrl ?? '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `policies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  // ── Mark as Reviewed
  const markReviewed = useCallback(async (policy: PolicyRow) => {
    setActioning(policy.id);
    try {
      const months      = REVIEW_MONTHS[policy.reviewFrequency] ?? 12;
      const today       = new Date();
      const nextReview  = addMonths(today, months);
      const res = await fetch(`/api/policies/${policy.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status:           'ACTIVE',
          lastReviewedDate: today.toISOString(),
          nextReviewDate:   nextReview.toISOString(),
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setData(d => d.map(p => p.id === updated.id ? {
          ...p,
          status:           updated.status,
          lastReviewedDate: updated.lastReviewedDate,
          nextReviewDate:   updated.nextReviewDate,
        } : p));
      }
    } finally {
      setActioning(null);
    }
  }, []);

  // ── Archive
  const archivePolicy = useCallback(async (id: string) => {
    setActioning(id);
    try {
      const res = await fetch(`/api/policies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ARCHIVED' }),
      });
      if (res.ok) {
        setData(d => d.map(p => p.id === id ? { ...p, status: 'ARCHIVED' } : p));
      }
    } finally {
      setActioning(null);
    }
  }, []);

  // ── Delete
  const deletePolicy = useCallback(async (id: string) => {
    if (!confirm('Delete this policy permanently?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/policies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(d => d.filter(p => p.id !== id));
      }
    } finally {
      setDeleting(null);
    }
  }, []);

  return (
    <div className="space-y-5">

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Policies', value: stats.total,   accent: 'border-teal-400', icon: <FileText className="w-4 h-4 text-teal-500" /> },
          { label: 'Active',         value: stats.active,  accent: 'border-green-400',  icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
          { label: 'Overdue Review', value: stats.overdue, accent: 'border-red-400',    icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
          { label: 'Due in 30d',     value: stats.dueSoon, accent: 'border-amber-400',  icon: <Clock className="w-4 h-4 text-amber-500" /> },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl border-l-4 border border-slate-200 ${s.accent} px-4 py-3 flex items-center gap-3`}>
            {s.icon}
            <div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category Pills ─────────────────────────────────────────────────── */}
      {catCounts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Browse by Category</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCat('')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
                !filterCat ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
              }`}
            >
              All
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${!filterCat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {data.length}
              </span>
            </button>
            {catCounts.map(([cat, count]) => {
              const active = filterCat === cat;
              const colorBase = CATEGORY_COLORS[cat] ?? 'bg-slate-100 text-slate-700 border-slate-200';
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(active ? '' : cat)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
                    active ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : colorBase + ' hover:opacity-80'
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-black/10'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
            placeholder="Search title, policy #, owner, reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_META).map(([v, m]) => (
            <option key={v} value={v}>{m.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-transparent focus:outline-none text-sm"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* ── Action Buttons ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/trackers/policies/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Policy
        </a>
        <a
          href="/trackers/policies/import"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Upload className="w-3.5 h-3.5" /> Bulk Import CSV
        </a>
      </div>

      {/* ── Results count ─────────────────────────────────────────────────── */}
      <p className="text-xs text-slate-500">
        Showing <strong>{filtered.length}</strong> of {data.length} policies
        {search && <> matching &quot;<em>{search}</em>&quot;</>}
      </p>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">POLICY #</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">TITLE</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">CATEGORY</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">VER</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">EFFECTIVE</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">NEXT REVIEW</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">STATUS</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs">DOC</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    {search || filterCat || filterStatus ? (
                      <>No policies match your filters. <button onClick={() => { setSearch(''); setFilterCat(''); setFilterStatus(''); }} className="text-teal-600 hover:underline">Clear filters</button></>
                    ) : (
                      <>No policies yet. <a href="/trackers/policies/new" className="text-teal-600 hover:underline">Add your first policy</a> or <a href="/trackers/policies/import" className="text-teal-600 hover:underline">import from CSV</a>.</>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map(policy => {
                  const isOverdue = policy.nextReviewDate && isPast(new Date(policy.nextReviewDate)) && policy.status !== 'ARCHIVED';
                  const busy = actioning === policy.id || deleting === policy.id;
                  return (
                    <tr key={policy.id} className={`hover:bg-slate-50 transition-colors ${policy.status === 'ARCHIVED' ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        <a href={`/trackers/policies/${policy.id}`} className="hover:text-teal-600 hover:underline">
                          {policy.policyNumber}
                        </a>
                      </td>
                      <td className="px-4 py-3 max-w-[260px]">
                        <a href={`/trackers/policies/${policy.id}`} className="font-medium text-slate-800 hover:text-teal-700 hover:underline block truncate">
                          {policy.title}
                        </a>
                        {policy.owner && <p className="text-xs text-slate-400 truncate">{policy.owner}</p>}
                        {policy.standardRef && <p className="text-[10px] text-slate-400 truncate">{policy.standardRef}</p>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[policy.category] ?? ''}`}>
                          {CATEGORY_LABELS[policy.category] ?? policy.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">v{policy.version}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{fmt(policy.effectiveDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <ReviewBadge dateStr={policy.nextReviewDate} status={policy.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${STATUS_META[policy.status]?.cls ?? ''}`}>
                          {STATUS_META[policy.status]?.label ?? policy.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {policy.documentUrl ? (
                          <a
                            href={policy.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {/* Mark reviewed */}
                          {policy.status !== 'ARCHIVED' && (
                            <button
                              disabled={busy}
                              onClick={() => markReviewed(policy)}
                              title="Mark as reviewed - extends next review date"
                              className="p-1 rounded text-slate-400 hover:text-green-600 hover:bg-green-50 transition disabled:opacity-40"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Edit */}
                          <a
                            href={`/trackers/policies/${policy.id}/edit`}
                            title="Edit policy"
                            className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </a>
                          {/* Archive */}
                          {policy.status !== 'ARCHIVED' && (
                            <button
                              disabled={busy}
                              onClick={() => archivePolicy(policy.id)}
                              title="Archive policy"
                              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition disabled:opacity-40"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            disabled={busy}
                            onClick={() => deletePolicy(policy.id)}
                            title="Delete policy"
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
