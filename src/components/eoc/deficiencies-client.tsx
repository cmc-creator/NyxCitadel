'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Filter } from 'lucide-react';

const categoryBadge: Record<string, string> = {
  LIFE_SAFETY:      'bg-sky-950/50 text-sky-300 border border-sky-700/40',
  LIGATURE_RISK:    'bg-amber-950/50 text-amber-300 border border-amber-700/40',
  FIRE_SAFETY:      'bg-red-950/50 text-red-300 border border-red-700/40',
  INFECTION_CONTROL:'bg-teal-950/50 text-teal-300 border border-teal-700/40',
  SECURITY:         'bg-teal-950/50 text-teal-300 border border-teal-700/40',
  UTILITIES:        'bg-orange-950/50 text-orange-300 border border-orange-700/40',
  EQUIPMENT_FAILURE:'bg-slate-700/50 text-slate-300 border border-slate-600/40',
  CLEANLINESS:      'bg-green-950/50 text-green-300 border border-green-700/40',
  PATIENT_SAFETY:   'bg-rose-950/50 text-rose-300 border border-rose-700/40',
  STRUCTURAL:       'bg-zinc-700/50 text-zinc-300 border border-zinc-600/40',
  OTHER:            'bg-slate-700/50 text-slate-300 border border-slate-600/40',
};

const severityBadge: Record<string, string> = {
  IMMEDIATE_JEOPARDY: 'bg-red-950/60 text-red-300 border border-red-600/50 font-semibold',
  HIGH:               'bg-orange-950/60 text-orange-300 border border-orange-600/50',
  MEDIUM:             'bg-amber-950/60 text-amber-300 border border-amber-600/50',
  LOW:                'bg-slate-700/60 text-slate-300 border border-slate-600/50',
  OBSERVATION:        'bg-slate-800/60 text-muted-foreground/70 border border-slate-600/50',
};

const statusBadge: Record<string, string> = {
  OPEN:        'bg-red-950/40 text-red-400',
  IN_PROGRESS: 'bg-amber-950/40 text-amber-400',
  RESOLVED:    'bg-emerald-950/40 text-emerald-400',
  VERIFIED:    'bg-sky-950/40 text-sky-400',
  ACCEPTED:    'bg-slate-700/40 text-muted-foreground/70',
};

export interface DeficiencyItem {
  id: string;
  defNumber: string;
  location: string;
  unit: string | null;
  description: string;
  category: string;
  severity: string;
  status: string;
  assignedTo: string | null;
  dueDate: string | null;
  resolvedDate: string | null;
  resolvedBy: string | null;
  notes: string | null;
}

function daysPastDue(dueDate: string | null, resolvedDate: string | null) {
  if (!dueDate || resolvedDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
}

type CategoryFilter = string;
type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';

export function DeficienciesClient({ items }: { items: DeficiencyItem[] }) {
  const [catFilter, setCatFilter] = useState<CategoryFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const categories = ['ALL', ...Array.from(new Set(items.map(d => d.category)))];

  const filtered = items.filter(d => {
    if (catFilter !== 'ALL' && d.category !== catFilter) return false;
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    return true;
  });

  const openCount       = items.filter(d => d.status === 'OPEN').length;
  const inProgressCount = items.filter(d => d.status === 'IN_PROGRESS').length;
  const resolvedCount   = items.filter(d => d.status === 'RESOLVED').length;
  const overdueCount    = items.filter(d => daysPastDue(d.dueDate, d.resolvedDate) !== null).length;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-700/40 text-center">
          <p className="text-2xl font-bold text-red-400">{openCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Open</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/40 text-center">
          <p className="text-2xl font-bold text-amber-400">{inProgressCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">In Progress</p>
        </div>
        <div className="p-3 rounded-lg bg-orange-950/30 border border-orange-700/40 text-center">
          <p className="text-2xl font-bold text-orange-400">{overdueCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Past Due Date</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-center">
          <p className="text-2xl font-bold text-emerald-400">{resolvedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${catFilter === c ? 'bg-sky-600 text-white' : 'bg-slate-800 text-muted-foreground/70 hover:bg-slate-700'}`}
            >
              {c === 'ALL' ? 'All' : c.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap ml-2">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-teal-600 text-white' : 'bg-slate-800 text-muted-foreground/70 hover:bg-slate-700'}`}
            >
              {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} deficiencies</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No deficiencies match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Description</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Severity</th>
                  <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                  <th className="text-left px-4 py-3 font-medium">Due Date</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map(d => {
                  const overdue = daysPastDue(d.dueDate, d.resolvedDate);
                  return (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-mono text-muted-foreground/70">{d.defNumber}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{d.unit}</p>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-foreground leading-snug">{d.description}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{d.location}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${categoryBadge[d.category] ?? 'bg-slate-800 text-muted-foreground/70'}`}>
                          {d.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${severityBadge[d.severity] ?? ''}`}>
                          {d.severity === 'IMMEDIATE_JEOPARDY' ? 'IMM. JEOPARDY' : d.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground/70">{d.assignedTo ?? '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className={`text-xs font-medium ${overdue ? 'text-red-400' : 'text-slate-300'}`}>
                          {d.resolvedDate ?? d.dueDate ?? '-'}
                        </p>
                        {overdue && (
                          <p className="text-xs text-red-500 mt-0.5 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" /> {overdue}d overdue
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusBadge[d.status] ?? ''}`}>
                            {d.status.replace(/_/g, ' ')}
                          </span>
                          {d.notes && (
                            <p className="text-xs text-slate-600 leading-tight max-w-48 truncate">{d.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/eoc/deficiencies/${d.id}/edit`} className="text-xs text-slate-600 hover:text-teal-400">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
