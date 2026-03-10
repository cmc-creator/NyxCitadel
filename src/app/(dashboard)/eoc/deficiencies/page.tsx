'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Filter, CheckCircle2, Clock } from 'lucide-react';

const deficiencies = [
  { id: 'DEF-2026-001', location: 'Seclusion Room 1 – Bathroom', unit: 'Acute Adult', category: 'LIGATURE_RISK', severity: 'IMMEDIATE_JEOPARDY', status: 'RESOLVED', desc: 'Shower curtain rod – standard, not breakaway', assignedTo: 'Carlos Vega', dueDate: '2026-01-16', resolvedDate: '2026-01-15', resolvedBy: 'Carlos Vega', roundId: 'EOC-ROUND-2026-LIG-01', notes: 'Rod removed same day. Curtain-less design pending plumber (scheduled 1/20). Room cleared for occupancy after verification.' },
  { id: 'DEF-2026-002', location: 'Main Hallway – North Wing', unit: 'All Units', category: 'LIGATURE_RISK', severity: 'HIGH', status: 'IN_PROGRESS', desc: 'Overhead data conduit accessible from common area ceiling tile', assignedTo: 'Facilities Manager', dueDate: '2026-02-28', resolvedDate: null, resolvedBy: null, roundId: 'EOC-ROUND-2026-LIG-01', notes: 'Chase enclosure in progress. 70% complete as of 3/1/2026.' },
  { id: 'DEF-2026-003', location: 'Janitor Closet – 1st Floor', unit: 'Main Floor', category: 'SECURITY', severity: 'LOW', status: 'RESOLVED', desc: 'Unsecured chemical storage — lock missing', assignedTo: 'Facilities Manager', dueDate: '2026-02-01', resolvedDate: '2026-01-21', resolvedBy: 'Facilities Manager', roundId: 'EOC-ROUND-2026-02', notes: 'Lock installed and keyed to master.' },
  { id: 'DEF-2026-004', location: 'Medication Room', unit: 'Acute Adult', category: 'INFECTION_CONTROL', severity: 'MEDIUM', status: 'OPEN', desc: 'Hand hygiene dispenser empty – bracket corroded and inoperable', assignedTo: 'Maria Santos RN', dueDate: '2026-03-12', resolvedDate: null, resolvedBy: null, roundId: 'EOC-ROUND-2026-03', notes: 'New dispenser ordered. Temporary soap pump placed.' },
  { id: 'DEF-2026-005', location: 'Nurses Station – Wing B', unit: 'Acute Adult', category: 'FIRE_SAFETY', severity: 'MEDIUM', status: 'IN_PROGRESS', desc: 'Fire door closer inoperable – door does not fully latch', assignedTo: 'Facilities Manager', dueDate: '2026-03-21', resolvedDate: null, resolvedBy: null, roundId: 'EOC-ROUND-2026-03', notes: 'Door closer on order. Interim: door wedge removed; staff instructed to manually close.' },
  { id: 'DEF-2026-006', location: 'Seclusion Room 1', unit: 'Acute Adult', category: 'LIGATURE_RISK', severity: 'HIGH', status: 'IN_PROGRESS', desc: 'Emergency ligature cutter not mounted at door', assignedTo: 'Carlos Vega', dueDate: '2026-03-10', resolvedDate: null, resolvedBy: null, roundId: 'EOC-ROUND-2026-03', notes: 'Cutter ordered — standard hook-and-blade mount kit. ETA 3/10.' },
  { id: 'DEF-2026-007', location: 'Room 118 – Bathroom', unit: 'Acute Adult', category: 'LIGATURE_RISK', severity: 'HIGH', status: 'OPEN', desc: 'Door hinge plates non-ligature-resistant (standard exposed knuckle)', assignedTo: 'Facilities Manager', dueDate: '2026-03-20', resolvedDate: null, resolvedBy: null, roundId: 'EOC-ROUND-2026-LIG-01', notes: 'Anti-ligature piano hinge vendor quote requested.' },
  { id: 'DEF-2026-008', location: 'Kitchen Hood – Dietary Dept.', unit: 'Dietary', category: 'FIRE_SAFETY', severity: 'HIGH', status: 'IN_PROGRESS', desc: 'Hood suppression system PM overdue by 3 weeks — inspection tag expired', assignedTo: 'Facilities Manager', dueDate: '2026-03-05', resolvedDate: null, resolvedBy: null, roundId: 'EOC-ROUND-2026-FIRE-01', notes: 'Ansul service scheduled 3/20. Area in use under risk-managed monitoring.' },
];

const categoryBadge: Record<string, string> = {
  LIFE_SAFETY: 'bg-sky-950/50 text-sky-300 border border-sky-700/40',
  LIGATURE_RISK: 'bg-amber-950/50 text-amber-300 border border-amber-700/40',
  FIRE_SAFETY: 'bg-red-950/50 text-red-300 border border-red-700/40',
  INFECTION_CONTROL: 'bg-teal-950/50 text-teal-300 border border-teal-700/40',
  SECURITY: 'bg-purple-950/50 text-purple-300 border border-purple-700/40',
  UTILITIES: 'bg-orange-950/50 text-orange-300 border border-orange-700/40',
  EQUIPMENT_FAILURE: 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
  CLEANLINESS: 'bg-green-950/50 text-green-300 border border-green-700/40',
  PATIENT_SAFETY: 'bg-rose-950/50 text-rose-300 border border-rose-700/40',
  STRUCTURAL: 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/40',
  OTHER: 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
};

const severityBadge: Record<string, string> = {
  IMMEDIATE_JEOPARDY: 'bg-red-950/60 text-red-300 border border-red-600/50 font-semibold',
  HIGH: 'bg-orange-950/60 text-orange-300 border border-orange-600/50',
  MEDIUM: 'bg-amber-950/60 text-amber-300 border border-amber-600/50',
  LOW: 'bg-slate-700/60 text-slate-300 border border-slate-600/50',
  OBSERVATION: 'bg-slate-800/60 text-slate-400 border border-slate-600/50',
};

const statusBadge: Record<string, string> = {
  OPEN: 'bg-red-950/40 text-red-400',
  IN_PROGRESS: 'bg-amber-950/40 text-amber-400',
  RESOLVED: 'bg-emerald-950/40 text-emerald-400',
  VERIFIED: 'bg-sky-950/40 text-sky-400',
  ACCEPTED: 'bg-slate-700/40 text-slate-400',
};

const daysPastDue = (dueDate: string, resolvedDate: string | null) => {
  if (resolvedDate) return null;
  const due = new Date(dueDate);
  const now = new Date('2026-03-07');
  const diff = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
};

type CategoryFilter = 'ALL' | string;
type StatusFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';

export default function DeficienciesPage() {
  const [catFilter, setCatFilter] = useState<CategoryFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const categories = ['ALL', ...Array.from(new Set(deficiencies.map(d => d.category)))];

  const filtered = deficiencies.filter(d => {
    if (catFilter !== 'ALL' && d.category !== catFilter) return false;
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    return true;
  });

  const openCount = deficiencies.filter(d => d.status === 'OPEN').length;
  const inProgressCount = deficiencies.filter(d => d.status === 'IN_PROGRESS').length;
  const resolvedCount = deficiencies.filter(d => d.status === 'RESOLVED').length;
  const overdueCount = deficiencies.filter(d => daysPastDue(d.dueDate, d.resolvedDate) !== null).length;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-slate-400 hover:text-slate-300">Environment of Care</Link>
            <span className="text-slate-600">›</span>
            <span className="text-sm text-foreground font-medium">Deficiencies</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Deficiency Tracker</h1>
          <p className="text-sm text-slate-400 mt-0.5">All environment-of-care findings from rounds, surveys, and ad-hoc observations</p>
        </div>
        <a href="/eoc/deficiencies/new" className="px-3 py-1.5 text-sm rounded-md bg-red-700 hover:bg-red-600 text-white font-medium transition-colors">
          + Log Deficiency
        </a>
      </div>

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
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${catFilter === c ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {c === 'ALL' ? 'All' : c.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap ml-2">
          {(['ALL','OPEN','IN_PROGRESS','RESOLVED'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} deficiencies</span>
      </div>

      {/* Deficiency table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map(d => {
                const overdue = daysPastDue(d.dueDate, d.resolvedDate);
                return (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-slate-400">{d.id}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{d.unit}</p>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-foreground leading-snug">{d.desc}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{d.location}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${categoryBadge[d.category] ?? 'bg-slate-800 text-slate-400'}`}>
                        {d.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${severityBadge[d.severity]}`}>
                        {d.severity === 'IMMEDIATE_JEOPARDY' ? 'IMM. JEOPARDY' : d.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{d.assignedTo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs font-medium ${overdue ? 'text-red-400' : 'text-slate-300'}`}>
                        {d.resolvedDate ?? d.dueDate}
                      </p>
                      {overdue && (
                        <p className="text-xs text-red-500 mt-0.5">{overdue}d overdue</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusBadge[d.status]}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                        {d.notes && (
                          <p className="text-xs text-slate-600 leading-tight max-w-48 truncate">{d.notes}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
