'use client';

import { useState, useMemo, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegEntry {
  id: string;
  refId: string;
  title: string;
  description: string;
  standardRef: string;
  regulatoryBody: string;
  category: string;
  frequency: string;
  priority: string;
  responsibleRole: string | null;
  months: number[];
  notes: string | null;
  sourceUrl: string | null;
  lastVerified: string | null;   // ISO string from JSON
  isBuiltIn: boolean;
  facilityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LibraryStats {
  total: number;
  critical: number;
  byBody: Record<string, number>;
}

interface Props {
  initialData: RegEntry[];
  stats: LibraryStats;
  userRole: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  CRITICAL: { label: 'Critical', color: 'bg-red-100 text-red-800 border border-red-200' },
  HIGH:     { label: 'High',     color: 'bg-orange-100 text-orange-800 border border-orange-200' },
  MEDIUM:   { label: 'Medium',   color: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  LOW:      { label: 'Low',      color: 'bg-slate-100 text-foreground/80 border border-border' },
};

const BODY_COLORS: Record<string, string> = {
  CMS:      'bg-blue-100 text-blue-700',
  HHS:      'bg-blue-100 text-blue-700',
  DEA:      'bg-rose-100 text-rose-700',
  OSHA:     'bg-amber-100 text-amber-700',
  AZ_ADHS:  'bg-green-100 text-green-700',
  HIPAA:    'bg-teal-100 text-teal-700',
  JC:       'bg-indigo-100 text-indigo-700',
  NFPA:     'bg-orange-100 text-orange-700',
  FEMA:     'bg-teal-100 text-teal-700',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CAN_MANAGE_ROLES = ['ADMIN', 'COMPLIANCE_OFFICER'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: string }) {
  const meta = PRIORITY_META[priority] ?? { label: priority, color: 'bg-slate-100 text-slate-600' };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>
      {meta.label}
    </span>
  );
}

function BodyBadge({ body }: { body: string }) {
  const color = BODY_COLORS[body] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {body.replace('_', ' ')}
    </span>
  );
}

function MonthChips({ months }: { months: number[] }) {
  if (!months.length) return <span className="text-muted-foreground/70 text-xs">-</span>;
  return (
    <div className="flex flex-wrap gap-0.5">
      {months.map(m => (
        <span key={m} className="bg-slate-100 text-slate-600 text-xs rounded px-1">
          {MONTH_NAMES[m - 1]}
        </span>
      ))}
    </div>
  );
}

// ─── Empty: blank form state ──────────────────────────────────────────────────

const BLANK_FORM = {
  title: '',
  description: '',
  standardRef: '',
  regulatoryBody: '',
  category: '',
  frequency: 'ANNUAL',
  priority: 'MEDIUM',
  responsibleRole: '',
  months: [] as number[],
  notes: '',
  sourceUrl: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RegLibraryClient({ initialData, stats, userRole }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Filter state
  const [search, setSearch]           = useState('');
  const [filterBody, setFilterBody]   = useState('');
  const [filterPri, setFilterPri]     = useState('');
  const [filterFreq, setFilterFreq]   = useState('');
  const [filterBuiltin, setFilterBuiltin] = useState<'all' | 'builtin' | 'custom'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [expandedId, setExpandedId]   = useState<string | null>(null);

  // ── Modal state
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'annotate' | null>(null);
  const [editEntry, setEditEntry] = useState<RegEntry | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  const canManage = CAN_MANAGE_ROLES.includes(userRole);

  // ── Unique filter values
  const allBodies = useMemo(
    () => initialData
      .map(e => e.regulatoryBody)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort(),
    [initialData]
  );
  const allFreqs = useMemo(
    () => initialData
      .map(e => e.frequency)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort(),
    [initialData]
  );

  const allCategories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of initialData) {
      const cat = e.category || 'OTHER';
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [initialData]);

  // ── Filtered data
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return initialData.filter(e => {
      if (filterBuiltin === 'builtin' && !e.isBuiltIn) return false;
      if (filterBuiltin === 'custom'  && e.isBuiltIn)  return false;
      if (filterBody    && e.regulatoryBody !== filterBody)   return false;
      if (filterPri     && e.priority !== filterPri)          return false;
      if (filterFreq    && e.frequency !== filterFreq)        return false;
      if (filterCategory && (e.category || 'OTHER') !== filterCategory) return false;
      if (q && ![
        e.title ?? '',
        e.standardRef ?? '',
        e.description ?? '',
        e.notes ?? '',
        e.regulatoryBody ?? '',
        e.category ?? '',
        e.refId ?? '',
        e.responsibleRole ?? '',
      ].some(s => s.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [initialData, search, filterBody, filterPri, filterFreq, filterBuiltin, filterCategory]);

  // ── Export CSV
  const exportCsv = useCallback(() => {
    const headers = ['refId','title','standardRef','regulatoryBody','category','frequency','priority','responsibleRole','months','sourceUrl','notes','isBuiltIn'];
    const rows = filtered.map(e => [
      e.refId, e.title, e.standardRef, e.regulatoryBody, e.category,
      e.frequency, e.priority, e.responsibleRole ?? '',
      e.months.map(m => MONTH_NAMES[m-1]).join(';'),
      e.sourceUrl ?? '', e.notes ?? '', e.isBuiltIn ? 'yes' : 'no',
    ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regulatory-library-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  // ── Open add modal
  const openAdd = () => {
    setEditEntry(null);
    setForm(BLANK_FORM);
    setFormError('');
    setModalMode('add');
  };

  // ── Open edit / annotate modal
  const openEdit = (entry: RegEntry) => {
    setEditEntry(entry);
    setFormError('');
    if (entry.isBuiltIn) {
      // annotation-only
      setForm({ ...BLANK_FORM,
        notes: entry.notes ?? '',
        sourceUrl: entry.sourceUrl ?? '',
        title: entry.title, description: entry.description,
        standardRef: entry.standardRef, regulatoryBody: entry.regulatoryBody,
        category: entry.category, frequency: entry.frequency,
        priority: entry.priority, responsibleRole: entry.responsibleRole ?? '',
        months: entry.months,
      });
      setModalMode('annotate');
    } else {
      setForm({
        title: entry.title, description: entry.description,
        standardRef: entry.standardRef, regulatoryBody: entry.regulatoryBody,
        category: entry.category, frequency: entry.frequency,
        priority: entry.priority, responsibleRole: entry.responsibleRole ?? '',
        months: entry.months, notes: entry.notes ?? '', sourceUrl: entry.sourceUrl ?? '',
      });
      setModalMode('edit');
    }
  };

  // ── Toggle month
  const toggleMonth = (m: number) => {
    setForm(f => ({
      ...f,
      months: f.months.includes(m) ? f.months.filter(x => x !== m) : [...f.months, m].sort((a,b) => a-b),
    }));
  };

  // ── Save
  const handleSave = async () => {
    setFormError('');
    if (!form.title.trim() || !form.standardRef.trim()) {
      setFormError('Title and Standard Reference are required.');
      return;
    }
    setSaving(true);
    try {
      const isEdit = modalMode === 'edit' || modalMode === 'annotate';
      const url  = isEdit ? `/api/regulatory-references/${editEntry!.id}` : '/api/regulatory-references';
      const method = isEdit ? 'PATCH' : 'POST';
      const body = modalMode === 'annotate'
        ? { notes: form.notes, sourceUrl: form.sourceUrl, lastVerified: new Date().toISOString() }
        : {
            title: form.title, description: form.description,
            standardRef: form.standardRef, regulatoryBody: form.regulatoryBody,
            category: form.category, frequency: form.frequency,
            priority: form.priority, responsibleRole: form.responsibleRole || null,
            months: form.months, notes: form.notes || null, sourceUrl: form.sourceUrl || null,
          };
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.error ?? 'Save failed.');
        return;
      }
      setModalMode(null);
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  };

  // ── Delete
  const handleDelete = async (entry: RegEntry) => {
    if (!confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    setDeleting(entry.id);
    try {
      const res = await fetch(`/api/regulatory-references/${entry.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? 'Delete failed.');
        return;
      }
      startTransition(() => router.refresh());
    } finally {
      setDeleting(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total References" value={stats.total} accent="border-blue-400" />
        <StatCard label="Critical Priority" value={stats.critical} accent="border-red-400" />
        {Object.entries(stats.byBody)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([body, cnt]) => (
            <StatCard key={body} label={body.replace('_', ' ')} value={cnt} accent="border-slate-300" />
          ))}
      </div>

      {/* ── Category Cards ────────────────────────────────────────────────── */}
      {allCategories.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">Browse by Category</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('')}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition whitespace-nowrap ${
                !filterCategory
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-950/20'
              }`}
            >
              All
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                !filterCategory ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {initialData.length}
              </span>
            </button>
            {allCategories.map(([cat, count]) => {
              const isActive = filterCategory === cat;
              const colorCls = isActive ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : getCategoryColor(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(isActive ? '' : cat)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition whitespace-nowrap ${colorCls}`}
                >
                  {fmtCategory(cat)}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/5'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-muted-foreground/70"
            placeholder="Search title, standard, description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={filterBody} onChange={setFilterBody} placeholder="All Sources">
            {allBodies.map(b => <option key={b} value={b}>{b.replace('_',' ')}</option>)}
          </Select>
          <Select value={filterPri} onChange={setFilterPri} placeholder="All Priorities">
            {['CRITICAL','HIGH','MEDIUM','LOW'].map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Select value={filterFreq} onChange={setFilterFreq} placeholder="All Frequencies">
            {allFreqs.map(f => <option key={f} value={f}>{f.replace('_',' ')}</option>)}
          </Select>
          <Select value={filterBuiltin} onChange={v => setFilterBuiltin(v as 'all'|'builtin'|'custom')} placeholder="">
            <option value="all">Built-in + Custom</option>
            <option value="builtin">Built-in only</option>
            <option value="custom">Custom only</option>
          </Select>

          {/* Action buttons */}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-card border border-border
                       rounded-lg hover:bg-slate-50 transition text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          {canManage && (
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white
                         rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <span className="text-lg leading-none">+</span>
              Add Custom Entry
            </button>
          )}
        </div>
      </div>

      {/* ── Result count ──────────────────────────────────────────────────── */}
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-foreground/80">{filtered.length}</span> of{' '}
        <span className="font-medium text-foreground/80">{initialData.length}</span> references
        {isPending && <span className="ml-2 text-blue-500 animate-pulse">Refreshing…</span>}
      </p>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-border/30 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Standard Ref</Th>
              <Th>Title</Th>
              <Th>Source</Th>
              <Th>Priority</Th>
              <Th>Frequency</Th>
              <Th>Due Months</Th>
              <Th>Last Verified</Th>
              {canManage && <Th>Actions</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={canManage ? 8 : 7}
                    className="py-12 text-center text-muted-foreground/70">
                  No references match your filters.
                </td>
              </tr>
            )}
            {filtered.map(entry => (
              <>
                <tr
                  key={entry.id}
                  className="hover:bg-slate-50 transition cursor-pointer"
                  onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {entry.isBuiltIn
                        ? <LockIcon />
                        : <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" title="Custom entry" />}
                      {entry.standardRef}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground max-w-xs">
                    <div className="truncate">{entry.title}</div>
                    <div className="text-xs text-muted-foreground/70 font-mono">{entry.refId}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap"><BodyBadge body={entry.regulatoryBody} /></td>
                  <td className="px-4 py-3 whitespace-nowrap"><PriorityBadge priority={entry.priority} /></td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600 text-xs">
                    {entry.frequency.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3"><MonthChips months={entry.months} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground/70 whitespace-nowrap">
                    {entry.lastVerified
                      ? new Date(entry.lastVerified).toLocaleDateString()
                      : '-'}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1
                                     rounded hover:bg-blue-950/20 transition"
                          onClick={() => openEdit(entry)}
                        >
                          {entry.isBuiltIn ? 'Annotate' : 'Edit'}
                        </button>
                        {!entry.isBuiltIn && (
                          <button
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1
                                       rounded hover:bg-red-950/20 transition disabled:opacity-40"
                            disabled={deleting === entry.id}
                            onClick={() => handleDelete(entry)}
                          >
                            {deleting === entry.id ? '…' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>

                {/* ── Expanded detail row */}
                {expandedId === entry.id && (
                  <tr key={`${entry.id}-detail`} className="bg-slate-50">
                    <td colSpan={canManage ? 8 : 7} className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-foreground/80 mb-1">Description</p>
                          <p className="text-slate-600 whitespace-pre-wrap">{entry.description}</p>
                        </div>
                        <div className="space-y-2">
                          {entry.responsibleRole && (
                            <Detail label="Responsible Role" value={entry.responsibleRole} />
                          )}
                          {entry.notes && (
                            <Detail label="Notes / Annotations" value={entry.notes} />
                          )}
                          {entry.sourceUrl && (
                            <div>
                              <span className="font-medium text-slate-500 text-xs uppercase">Source URL</span>
                              <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer"
                                 className="block text-blue-600 hover:underline truncate text-xs mt-0.5">
                                {entry.sourceUrl}
                              </a>
                            </div>
                          )}
                          <Detail label="Category" value={entry.category.replace(/_/g,' ')} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {modalMode && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalMode(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {modalMode === 'add'      ? 'Add Custom Regulatory Entry'  :
                 modalMode === 'annotate' ? 'Annotate Built-in Reference'  :
                                           'Edit Custom Entry'}
              </h2>
              <button onClick={() => setModalMode(null)}
                      className="text-muted-foreground/70 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {modalMode === 'annotate' && (
                <div className="rounded-lg bg-blue-950/20 border border-blue-200 p-3 text-sm text-blue-700">
                  <strong>Built-in reference</strong> - only Notes, Source URL, and Last Verified
                  date can be updated. Core regulation text is managed in the compliance library.
                </div>
              )}

              {/* Title */}
              {modalMode !== 'annotate' && (
                <Field label="Title *">
                  <input className={INPUT_CLS} value={form.title}
                         onChange={e => setForm(f => ({...f, title: e.target.value}))} />
                </Field>
              )}

              {/* Description */}
              {modalMode !== 'annotate' && (
                <Field label="Description">
                  <textarea className={`${INPUT_CLS} h-24 resize-none`} value={form.description}
                            onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Standard Ref */}
                {modalMode !== 'annotate' && (
                  <Field label="Standard Reference *" hint="e.g. 42 CFR 482.13">
                    <input className={INPUT_CLS} value={form.standardRef}
                           onChange={e => setForm(f => ({...f, standardRef: e.target.value}))} />
                  </Field>
                )}

                {/* Regulatory Body */}
                {modalMode !== 'annotate' && (
                  <Field label="Regulatory Body *" hint="e.g. CMS, DEA, AZ_ADHS">
                    <input className={INPUT_CLS} value={form.regulatoryBody}
                           onChange={e => setForm(f => ({...f, regulatoryBody: e.target.value}))} />
                  </Field>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {modalMode !== 'annotate' && (
                  <>
                    <Field label="Category">
                      <input className={INPUT_CLS} value={form.category}
                             onChange={e => setForm(f => ({...f, category: e.target.value}))} />
                    </Field>
                    <Field label="Frequency">
                      <select className={INPUT_CLS} value={form.frequency}
                              onChange={e => setForm(f => ({...f, frequency: e.target.value}))}>
                        {['DAILY','WEEKLY','MONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL','BIENNIAL','AS_NEEDED','ONGOING','EVENT_DRIVEN'].map(v =>
                          <option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
                      </select>
                    </Field>
                    <Field label="Priority">
                      <select className={INPUT_CLS} value={form.priority}
                              onChange={e => setForm(f => ({...f, priority: e.target.value}))}>
                        {['CRITICAL','HIGH','MEDIUM','LOW'].map(v =>
                          <option key={v} value={v}>{v}</option>)}
                      </select>
                    </Field>
                  </>
                )}
              </div>

              {modalMode !== 'annotate' && (
                <>
                  <Field label="Responsible Role">
                    <input className={INPUT_CLS} value={form.responsibleRole}
                           onChange={e => setForm(f => ({...f, responsibleRole: e.target.value}))}
                           placeholder="e.g. Compliance Officer" />
                  </Field>

                  <Field label="Due Months" hint="Click to toggle months when this requirement is typically due">
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {MONTH_NAMES.map((mn, i) => {
                        const m = i + 1;
                        const active = form.months.includes(m);
                        return (
                          <button key={m} type="button"
                                  className={`px-2.5 py-1 text-xs rounded-full border transition font-medium
                                    ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400'}`}
                                  onClick={() => toggleMonth(m)}>
                            {mn}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </>
              )}

              {/* Notes */}
              <Field label="Notes / Annotations" hint="Internal annotations, facility-specific context">
                <textarea className={`${INPUT_CLS} h-20 resize-none`} value={form.notes}
                          onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                          placeholder="Add facility-specific notes, exceptions, reminders…" />
              </Field>

              {/* Source URL */}
              <Field label="Source URL" hint="Link to official regulation text or agency page">
                <input className={INPUT_CLS} type="url" value={form.sourceUrl}
                       onChange={e => setForm(f => ({...f, sourceUrl: e.target.value}))}
                       placeholder="https://www.cms.gov/…" />
              </Field>

              {formError && (
                <p className="text-red-600 text-sm bg-red-950/20 rounded-lg px-3 py-2">{formError}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setModalMode(null)}
                      className="px-4 py-2 text-sm text-slate-600 hover:text-foreground rounded-lg hover:bg-slate-100 transition">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700
                           transition font-medium disabled:opacity-60"
              >
                {saving ? 'Saving…' : modalMode === 'annotate' ? 'Save Annotations' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function fmtCategory(cat: string): string {
  return cat
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function getCategoryColor(cat: string): string {
  if (/^CMS|^CREDENTIALING|^QAPI|^JC_PI|^MEDICAL_STAFF|^BOARD|^BYLAWS/.test(cat))
    return 'bg-blue-950/20 text-blue-700 border-blue-200 hover:bg-blue-100';
  if (/^IC_|^HAND_HYGIENE/.test(cat))
    return 'bg-teal-950/20 text-teal-700 border-teal-200 hover:bg-teal-100';
  if (/^FIRE|^LIFE_|^ELEVATOR|^GENERATOR|^SPRINKLER|^BACKFLOW|^EOC/.test(cat))
    return 'bg-orange-950/20 text-orange-700 border-orange-200 hover:bg-orange-100';
  if (/^EM_|^HVA|^FUNCTIONAL|^TABLETOP|^AFTER_ACTION/.test(cat))
    return 'bg-red-950/20 text-red-700 border-red-200 hover:bg-red-100';
  if (/^PATIENT_RIGHTS|^INFORMED_CONSENT/.test(cat))
    return 'bg-teal-950/20 text-teal-700 border-teal-200 hover:bg-teal-100';
  if (/^MEDIC|^PHARM|^FORMULA|^CONTROLLED/.test(cat))
    return 'bg-amber-950/20 text-amber-700 border-amber-200 hover:bg-amber-100';
  if (/^AZ_|^JC_MOCK|^JC_STANDARDS/.test(cat))
    return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
  if (/^POLICY|^STAFF_TRAIN|^MANDATORY|^COMPETENCY|^ANNUAL_EVAL/.test(cat))
    return 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200';
  return 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100';
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={`bg-white rounded-xl border-l-4 ${accent} border border-border p-4 shadow-sm`}>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {children}
    </th>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-medium text-slate-500 text-xs uppercase">{label}</span>
      <p className="text-foreground/80 text-sm mt-0.5 whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="w-3 h-3 text-muted-foreground/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function Select({
  value, onChange, placeholder, children,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; children: React.ReactNode;
}) {
  return (
    <select
      className="text-sm border border-border rounded-lg px-3 py-2 bg-white focus:outline-none
                 focus:ring-2 focus:ring-blue-500 text-foreground/80 min-w-[130px]"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground/80 mb-1">{label}</label>
      {hint && <p className="text-xs text-muted-foreground/70 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT_CLS = `w-full text-sm border border-border rounded-lg px-3 py-2 bg-white
  focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-muted-foreground/70`;
