'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wrench, Flame, Zap, Wind, Lock, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';

const categoryIcon: Record<string, React.ElementType> = {
  FIRE_SUPPRESSION: Flame,
  FIRE_ALARM: Flame,
  EMERGENCY_LIGHTING: Zap,
  GENERATOR: Zap,
  HVAC: Wind,
  MEDICAL_GAS: Wind,
  ELEVATOR: Wrench,
  SECURITY_SYSTEM: Lock,
  PLUMBING: Wrench,
  ELECTRICAL: Zap,
  MEDICAL_EQUIPMENT: Wrench,
  NURSE_CALL: Wrench,
  DOOR_HARDWARE: Lock,
};

const categoryColor: Record<string, string> = {
  FIRE_SUPPRESSION: 'text-red-400',
  FIRE_ALARM: 'text-red-400',
  EMERGENCY_LIGHTING: 'text-amber-400',
  GENERATOR: 'text-orange-400',
  HVAC: 'text-sky-400',
  SECURITY_SYSTEM: 'text-teal-400',
  PLUMBING: 'text-teal-400',
  ELECTRICAL: 'text-yellow-400',
  NURSE_CALL: 'text-blue-400',
  ELEVATOR: 'text-muted-foreground/70',
  MEDICAL_EQUIPMENT: 'text-emerald-400',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OVERDUE:     { label: 'OVERDUE',      color: 'bg-red-950/40 text-red-400 border border-red-700/40',           icon: AlertTriangle },
  DUE_SOON:    { label: 'DUE SOON',     color: 'bg-amber-950/40 text-amber-400 border border-amber-700/40',     icon: Clock },
  UPCOMING:    { label: 'UPCOMING',     color: 'bg-sky-950/40 text-sky-400 border border-sky-700/40',           icon: Clock },
  IN_PROGRESS: { label: 'IN PROGRESS',  color: 'bg-teal-950/40 text-teal-400 border border-teal-700/40',       icon: Wrench },
  COMPLETED:   { label: 'COMPLETED',    color: 'bg-emerald-950/40 text-emerald-400 border border-emerald-700/40', icon: CheckCircle2 },
};

const frequencyLabel: Record<string, string> = {
  WEEKLY: 'Weekly', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly',
  SEMI_ANNUAL: 'Semi-Annual', ANNUAL: 'Annual', AS_NEEDED: 'As Needed',
};

type StatusFilter = 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'UPCOMING' | 'COMPLETED';

export interface EquipmentItem {
  id: string;
  equipmentName: string;
  equipmentId: string | null;
  location: string;
  category: string;
  frequency: string;
  lastServiceDate: string | null;
  nextServiceDate: string;
  vendor: string | null;
  contactPhone: string | null;
  status: string;
  notes: string | null;
}

export function EquipmentClient({ items }: { items: EquipmentItem[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const filtered = items.filter(e => statusFilter === 'ALL' || e.status === statusFilter);
  const countByStatus = (s: string) => items.filter(e => e.status === s).length;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Overdue',     key: 'OVERDUE',      color: 'text-red-400',     bg: 'border-red-700/40 bg-red-950/30' },
          { label: 'Due Soon',    key: 'DUE_SOON',     color: 'text-amber-400',   bg: 'border-amber-700/40 bg-amber-950/30' },
          { label: 'Upcoming',    key: 'UPCOMING',     color: 'text-sky-400',     bg: 'border-sky-700/40 bg-sky-950/30' },
          { label: 'In Progress', key: 'IN_PROGRESS',  color: 'text-teal-400',    bg: 'border-teal-700/40 bg-teal-950/30' },
          { label: 'Completed',   key: 'COMPLETED',    color: 'text-emerald-400', bg: 'border-emerald-700/40 bg-emerald-950/30' },
        ].map(s => (
          <div key={s.key} className={`p-3 rounded-lg border text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{countByStatus(s.key)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground/70" />
        {(['ALL', 'OVERDUE', 'DUE_SOON', 'UPCOMING', 'COMPLETED'] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-teal-600 text-white' : 'bg-slate-800 text-muted-foreground/70 hover:bg-slate-700'}`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500">{filtered.length} items</span>
      </div>

      {/* Equipment list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">No equipment records match this filter.</div>
        )}
        {filtered.map(e => {
          const Icon = categoryIcon[e.category] ?? Wrench;
          const iconColor = categoryColor[e.category] ?? 'text-muted-foreground/70';
          const sc = statusConfig[e.status] ?? statusConfig['UPCOMING'];
          const StatusIcon = sc.icon;
          const isOverdue = e.status === 'OVERDUE';
          return (
            <div key={e.id} className={`p-4 rounded-xl border bg-card transition-colors hover:border-slate-500/50 ${isOverdue ? 'border-red-700/30' : 'border-border'}`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-900/60 shrink-0">
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">{e.equipmentName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {e.location} · <span className="text-slate-600">{e.equipmentId ?? '-'}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-slate-800 text-muted-foreground/70 px-2 py-0.5 rounded-full">
                        {frequencyLabel[e.frequency] ?? e.frequency}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                      <Link href={`/eoc/equipment/${e.id}/edit`} className="text-xs text-slate-600 hover:text-teal-400">
                        Edit
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span>
                      Last service:{' '}
                      <span className={`font-medium ${e.lastServiceDate ? 'text-slate-300' : 'text-red-400'}`}>
                        {e.lastServiceDate ?? 'Never'}
                      </span>
                    </span>
                    <span>
                      Next due:{' '}
                      <span className={`font-medium ${isOverdue ? 'text-red-400' : e.status === 'DUE_SOON' ? 'text-amber-400' : 'text-slate-300'}`}>
                        {e.nextServiceDate}
                      </span>
                    </span>
                    {e.vendor && <span>Vendor: <span className="text-muted-foreground/70">{e.vendor}</span></span>}
                    {e.contactPhone && <span className="text-muted-foreground/70">{e.contactPhone}</span>}
                  </div>
                  {e.notes && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{e.notes}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
