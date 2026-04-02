'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CircleAlert, Filter, ChevronDown, Info,
  CheckCircle2, Clock, ShieldOff, Pencil, Plus,
} from 'lucide-react';

interface LigatureItem {
  id: string;
  itemNumber: string;
  location: string;
  unit: string | null;
  itemDescription: string;
  riskLevel: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_MITIGATION' | 'MITIGATED' | 'RESOLVED' | 'ACCEPTED_RISK';
  identifiedDate: string;
  identifiedBy: string;
  mitigationPlan: string | null;
  targetDate: string | null;
  resolvedDate: string | null;
  resolvedBy: string | null;
  verifiedBy: string | null;
  notes: string | null;
}

const riskBadge: Record<string, string> = {
  IMMEDIATE: 'bg-red-950/60 text-red-300 border border-red-600/50',
  HIGH:      'bg-orange-950/60 text-orange-300 border border-orange-600/50',
  MEDIUM:    'bg-amber-950/60 text-amber-300 border border-amber-600/50',
  LOW:       'bg-slate-700/60 text-slate-300 border border-slate-600/50',
};

const statusBadge: Record<string, string> = {
  OPEN:          'bg-red-950/40 text-red-400',
  IN_MITIGATION: 'bg-amber-950/40 text-amber-400',
  MITIGATED:     'bg-sky-950/40 text-sky-400',
  RESOLVED:      'bg-emerald-950/40 text-emerald-400',
  ACCEPTED_RISK: 'bg-slate-700/40 text-muted-foreground/70',
};

const statusIcon: Record<string, React.ElementType> = {
  OPEN:          CircleAlert,
  IN_MITIGATION: Clock,
  MITIGATED:     CheckCircle2,
  RESOLVED:      CheckCircle2,
  ACCEPTED_RISK: ShieldOff,
};

const STATUS_OPTIONS = [
  'OPEN', 'IN_MITIGATION', 'MITIGATED', 'RESOLVED', 'ACCEPTED_RISK',
] as const;

type RiskFilter   = 'ALL' | 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'ALL' | 'OPEN' | 'IN_MITIGATION' | 'MITIGATED' | 'RESOLVED' | 'ACCEPTED_RISK';

export function LigatureClient({ items: initialItems }: { items: LigatureItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<LigatureItem[]>(initialItems);
  const [riskFilter, setRiskFilter]     = useState<RiskFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  const filtered = items.filter(i => {
    if (riskFilter   !== 'ALL' && i.riskLevel !== riskFilter)   return false;
    if (statusFilter !== 'ALL' && i.status    !== statusFilter) return false;
    return true;
  });

  const immediate = items.filter(i => i.riskLevel === 'IMMEDIATE').length;
  const high      = items.filter(i => i.riskLevel === 'HIGH').length;
  const medium    = items.filter(i => i.riskLevel === 'MEDIUM').length;
  const low       = items.filter(i => i.riskLevel === 'LOW').length;
  const active    = items.filter(i => ['OPEN', 'IN_MITIGATION'].includes(i.status)).length;
  const closed    = items.filter(i => ['RESOLVED', 'MITIGATED', 'ACCEPTED_RISK'].includes(i.status)).length;

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    const res = await fetch(`/api/eoc/ligature/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json() as LigatureItem;
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: updated.status } : i));
      startTransition(() => router.refresh());
    }
    setUpdatingId(null);
  }

  function fmt(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-muted-foreground/70 hover:text-slate-300">
              Environment of Care
            </Link>
            <span className="text-slate-600">›</span>
            <span className="text-sm text-foreground font-medium">Ligature Risk</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Ligature Risk Assessment</h1>
          <p className="text-sm text-muted-foreground/70 mt-0.5">
            TJC EC.02.06.01 — Psychiatric Environment Ligature Point Tracking
          </p>
        </div>
        <Link
          href="/eoc/ligature/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </Link>
      </div>

      {/* TJC banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/30 border border-amber-700/40">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/90 leading-relaxed">
          <span className="font-semibold">TJC EC.02.06.01</span> requires psychiatric facilities to conduct a
          comprehensive ligature risk assessment and implement time-limited plans of correction for all identified risks.
          IMMEDIATE risks must be corrected before patient occupancy. HIGH risks require a written mitigation plan within
          72 hours and correction within 30–45 days. All accepted risks require Medical Director / Administrator sign-off
          with documented rationale.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'IMMEDIATE', value: immediate, color: 'text-red-400',    bg: 'bg-red-950/40 border-red-700/40' },
          { label: 'HIGH',      value: high,      color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-700/40' },
          { label: 'MEDIUM',    value: medium,    color: 'text-amber-400',  bg: 'bg-amber-950/40 border-amber-700/40' },
          { label: 'LOW',       value: low,       color: 'text-slate-400',  bg: 'bg-slate-800/60 border-slate-600/40' },
          { label: 'OPEN/ACTIVE', value: active,  color: 'text-red-400',   bg: 'bg-red-950/30 border-red-700/40' },
          { label: 'RESOLVED',  value: closed,    color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-700/40' },
        ].map(s => (
          <div key={s.label} className={`p-3 rounded-lg border text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['ALL', 'IMMEDIATE', 'HIGH', 'MEDIUM', 'LOW'] as RiskFilter[]).map(r => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                riskFilter === r
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-muted-foreground/70 hover:bg-slate-700'
              }`}
            >
              {r === 'ALL' ? 'All Risk Levels' : r}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap ml-2">
          {(['ALL', 'OPEN', 'IN_MITIGATION', 'MITIGATED', 'RESOLVED', 'ACCEPTED_RISK'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-muted-foreground/70 hover:bg-slate-700'
              }`}
            >
              {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} items</span>
      </div>

      {/* Item list */}
      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">
          No ligature risk items match the current filter.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(item => {
          const Icon = statusIcon[item.status] ?? CircleAlert;
          const expanded = expandedId === item.id;

          return (
            <div key={item.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expanded ? null : item.id)}
              >
                <Icon
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    item.status === 'RESOLVED' || item.status === 'MITIGATED'
                      ? 'text-emerald-400'
                      : item.status === 'ACCEPTED_RISK'
                      ? 'text-muted-foreground/70'
                      : item.riskLevel === 'IMMEDIATE'
                      ? 'text-red-400'
                      : item.riskLevel === 'HIGH'
                      ? 'text-orange-400'
                      : 'text-amber-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-500">{item.itemNumber}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${riskBadge[item.riskLevel]}`}>
                      {item.riskLevel}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[item.status]}`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {item.unit && <span className="text-xs text-slate-600">{item.unit}</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">{item.itemDescription}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                  <span className="text-xs text-slate-600">
                    Target: {fmt(item.targetDate)}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4 border-t border-border/50 pt-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {item.mitigationPlan && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Mitigation Plan</p>
                          <p className="text-sm text-slate-300 mt-0.5">{item.mitigationPlan}</p>
                        </div>
                      )}
                      {item.notes && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Notes</p>
                          <p className="text-sm text-muted-foreground/70 mt-0.5">{item.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-border/30 pb-1">
                        <span className="text-slate-500">Identified</span>
                        <span className="text-slate-300">{fmt(item.identifiedDate)} · {item.identifiedBy}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/30 pb-1">
                        <span className="text-slate-500">Target Resolution</span>
                        <span className="text-slate-300">{fmt(item.targetDate)}</span>
                      </div>
                      {item.resolvedDate && (
                        <div className="flex justify-between border-b border-border/30 pb-1">
                          <span className="text-slate-500">Resolved</span>
                          <span className="text-emerald-400">
                            {fmt(item.resolvedDate)}{item.resolvedBy ? ` · ${item.resolvedBy}` : ''}
                          </span>
                        </div>
                      )}
                      {item.verifiedBy && (
                        <div className="flex justify-between border-b border-border/30 pb-1">
                          <span className="text-slate-500">Verified By</span>
                          <span className="text-slate-300">{item.verifiedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-xs text-slate-500 font-medium">Update Status:</span>
                    {STATUS_OPTIONS.filter(s => s !== item.status).map(s => (
                      <button
                        key={s}
                        disabled={updatingId === item.id || isPending}
                        onClick={() => updateStatus(item.id, s)}
                        className="text-xs px-2.5 py-1 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors disabled:opacity-50"
                      >
                        → {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                    <Link
                      href={`/eoc/ligature/${item.id}/edit`}
                      className="ml-auto flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
