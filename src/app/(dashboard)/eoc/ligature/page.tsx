'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleAlert, Filter, ChevronDown, Info, CheckCircle2, Clock, ShieldOff } from 'lucide-react';

const ligatureItems = [
  // IMMEDIATE
  { id: 'LIG-2026-001', location: 'Seclusion Room 1 – Bathroom', unit: 'Acute Adult', item: 'Shower curtain rod – standard (not breakaway)', risk: 'IMMEDIATE', status: 'IN_MITIGATION', identified: '2026-01-15', identifiedBy: 'Maria Santos RN', target: '2026-01-16', mitigation: 'Remove rod; switch to curtain-less design pending plumber', notes: 'Do NOT return to patient use until resolved. Plant Ops notified.' },
  // HIGH
  { id: 'LIG-2026-002', location: 'Room 118 – Bathroom', unit: 'Acute Adult', item: 'Door hinges – standard exposed knuckle can serve as anchor', risk: 'HIGH', status: 'OPEN', identified: '2026-02-20', identifiedBy: 'Compliance Officer', target: '2026-03-20', mitigation: 'Replace with anti-ligature continuous piano hinges', notes: 'Vendor quote requested from Creative Safety Supply' },
  { id: 'LIG-2026-003', location: 'Room 104 – Bathroom', unit: 'Adolescent Unit', item: 'Towel hook – exposed J-hook style', risk: 'HIGH', status: 'OPEN', identified: '2026-02-20', identifiedBy: 'Compliance Officer', target: '2026-03-20', mitigation: 'Replace with anti-ligature concealed towel bar', notes: '' },
  { id: 'LIG-2026-004', location: 'Main Hallway – North Wing', unit: 'All Units', item: 'Overhead data conduit – accessible from common area ceiling tile', risk: 'HIGH', status: 'IN_MITIGATION', identified: '2026-01-28', identifiedBy: 'Carlos Vega EOC Chair', target: '2026-02-28', mitigation: 'Enclose in locked chase; in progress by maintenance', notes: '' },
  // MEDIUM
  { id: 'LIG-2026-005', location: 'Room 201 – Closet', unit: 'Step-Down Unit', item: 'Closet rod – standard aluminum slider', risk: 'MEDIUM', status: 'MITIGATED', identified: '2026-01-08', identifiedBy: 'Carlos Vega EOC Chair', target: '2026-01-22', mitigation: 'Rod removed; clothing hooks installed at non-ligature-safe position accepted per policy for Step-Down level', resolvedDate: '2026-01-21', resolvedBy: 'Facilities Manager', notes: '' },
  { id: 'LIG-2026-006', location: 'Group Therapy Room A', unit: 'Acute Adult', item: 'Ceiling sprinkler head – unguarded', risk: 'MEDIUM', status: 'OPEN', identified: '2026-02-25', identifiedBy: 'Maria Santos RN', target: '2026-03-25', mitigation: 'Install anti-ligature sprinkler guards', notes: 'Order placed; 3-week lead time per vendor' },
  { id: 'LIG-2026-007', location: 'Room 115 – Bedroom', unit: 'Acute Adult', item: 'Window blinds cord – looped pull cord exposed', risk: 'MEDIUM', status: 'OPEN', identified: '2026-02-25', identifiedBy: 'Maria Santos RN', target: '2026-03-10', mitigation: 'Replace all corded blinds with cordless roller shades', notes: '' },
  { id: 'LIG-2026-008', location: 'Staff Nursing Station – Wing B', unit: 'Acute Adult', item: 'Computer monitor cables accessible over counter top', risk: 'MEDIUM', status: 'MITIGATED', identified: '2025-11-12', identifiedBy: 'Survey Prep Team', target: '2025-12-01', mitigation: 'Cable trays mounted; all cords routed below counter; reviewed in survey prep', resolvedDate: '2025-11-29', resolvedBy: 'IT Dept', notes: 'Satisfactory – confirmed by ADHS survey Jan 2026' },
  // LOW
  { id: 'LIG-2026-009', location: 'Dining Room', unit: 'Common Area', item: 'Overhead light fixture – exposed junction box cover screws', risk: 'LOW', status: 'ACCEPTED_RISK', identified: '2026-01-08', identifiedBy: 'Carlos Vega EOC Chair', target: '2026-06-30', mitigation: 'Screws replaced with tamper-resistant type; document as accepted risk per AABB analysis', notes: 'Risk analysis completed; accepted per Medical Director sign-off 2/1/2026' },
  { id: 'LIG-2026-010', location: 'Family Visitation Room', unit: 'Main Floor', item: 'Picture frame wire – hanging artwork in visitation', risk: 'LOW', status: 'RESOLVED', identified: '2025-10-05', identifiedBy: 'Survey Prep Team', target: '2025-10-20', mitigation: 'All artwork removed from visitation room; replaced with anti-ligature mounted prints', resolvedDate: '2025-10-18', resolvedBy: 'Facilities', notes: '' },
];

const riskBadge: Record<string, string> = {
  IMMEDIATE: 'bg-red-950/60 text-red-300 border border-red-600/50',
  HIGH: 'bg-orange-950/60 text-orange-300 border border-orange-600/50',
  MEDIUM: 'bg-amber-950/60 text-amber-300 border border-amber-600/50',
  LOW: 'bg-slate-700/60 text-slate-300 border border-slate-600/50',
};

const statusBadge: Record<string, string> = {
  OPEN: 'bg-red-950/40 text-red-400',
  IN_MITIGATION: 'bg-amber-950/40 text-amber-400',
  MITIGATED: 'bg-sky-950/40 text-sky-400',
  RESOLVED: 'bg-emerald-950/40 text-emerald-400',
  ACCEPTED_RISK: 'bg-slate-700/40 text-slate-400',
};

const statusIcon: Record<string, React.ElementType> = {
  OPEN: CircleAlert,
  IN_MITIGATION: Clock,
  MITIGATED: CheckCircle2,
  RESOLVED: CheckCircle2,
  ACCEPTED_RISK: ShieldOff,
};

type RiskLevel = 'ALL' | 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'ALL' | 'OPEN' | 'IN_MITIGATION' | 'MITIGATED' | 'RESOLVED' | 'ACCEPTED_RISK';

const summaryStats = [
  { label: 'IMMEDIATE', value: ligatureItems.filter(i => i.risk === 'IMMEDIATE').length, color: 'text-red-400', bg: 'bg-red-950/40 border-red-700/40' },
  { label: 'HIGH', value: ligatureItems.filter(i => i.risk === 'HIGH').length, color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-700/40' },
  { label: 'MEDIUM', value: ligatureItems.filter(i => i.risk === 'MEDIUM').length, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-700/40' },
  { label: 'LOW', value: ligatureItems.filter(i => i.risk === 'LOW').length, color: 'text-slate-400', bg: 'bg-slate-800/60 border-slate-600/40' },
  { label: 'OPEN/ACTIVE', value: ligatureItems.filter(i => ['OPEN','IN_MITIGATION'].includes(i.status)).length, color: 'text-red-400', bg: 'bg-red-950/30 border-red-700/40' },
  { label: 'RESOLVED', value: ligatureItems.filter(i => ['RESOLVED','MITIGATED','ACCEPTED_RISK'].includes(i.status)).length, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-700/40' },
];

export default function LigaturePage() {
  const [riskFilter, setRiskFilter] = useState<RiskLevel>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = ligatureItems.filter(i => {
    if (riskFilter !== 'ALL' && i.risk !== riskFilter) return false;
    if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-slate-400 hover:text-slate-300">Environment of Care</Link>
            <span className="text-slate-600">›</span>
            <span className="text-sm text-foreground font-medium">Ligature Risk</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Ligature Risk Assessment</h1>
          <p className="text-sm text-slate-400 mt-0.5">TJC EC.02.06.01 — Psychiatric Environment Ligature Point Tracking</p>
        </div>
        <button className="px-3 py-1.5 text-sm rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium transition-colors">
          + Add Item
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-950/30 border border-amber-700/40">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-300/90 leading-relaxed">
          <span className="font-semibold">TJC EC.02.06.01</span> requires psychiatric facilities to conduct a comprehensive ligature risk assessment and implement time-limited plans of correction for all identified risks.
          IMMEDIATE risks must be corrected before patient occupancy. HIGH risks require a written mitigation plan within 72 hours and correction within 30–45 days.
          All accepted risks require Medical Director / Administrator sign-off with documented rationale.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {summaryStats.map(s => (
          <div key={s.label} className={`p-3 rounded-lg border text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['ALL','IMMEDIATE','HIGH','MEDIUM','LOW'] as RiskLevel[]).map(r => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${riskFilter === r ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {r === 'ALL' ? 'All Risk Levels' : r}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap ml-2">
          {(['ALL','OPEN','IN_MITIGATION','MITIGATED','RESOLVED','ACCEPTED_RISK'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} items</span>
      </div>

      {/* Item list */}
      <div className="space-y-2">
        {filtered.map(item => {
          const Icon = statusIcon[item.status] ?? CircleAlert;
          const expanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <button
                className="w-full text-left p-4 flex items-start gap-3 hover:bg-white/5 transition-colors"
                onClick={() => setExpandedId(expanded ? null : item.id)}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${item.status === 'RESOLVED' || item.status === 'MITIGATED' ? 'text-emerald-400' : item.status === 'ACCEPTED_RISK' ? 'text-slate-400' : item.risk === 'IMMEDIATE' ? 'text-red-400' : item.risk === 'HIGH' ? 'text-orange-400' : 'text-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-slate-500">{item.id}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${riskBadge[item.risk]}`}>
                      {item.risk}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[item.status]}`}>
                      {item.status.replace(/_/g, ' ')}
                    </span>
                    {item.unit && <span className="text-xs text-slate-600">{item.unit}</span>}
                  </div>
                  <p className="text-sm font-medium text-foreground mt-1">{item.item}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.location}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                  <span className="text-xs text-slate-600">Target: {item.target}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {expanded && (
                <div className="px-4 pb-4 border-t border-border/50 pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Mitigation Plan</p>
                      <p className="text-sm text-slate-300 mt-0.5">{item.mitigation || '—'}</p>
                    </div>
                    {item.notes && (
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Notes</p>
                        <p className="text-sm text-slate-400 mt-0.5">{item.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/30 pb-1">
                      <span className="text-slate-500">Identified</span>
                      <span className="text-slate-300">{item.identified} — {item.identifiedBy}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/30 pb-1">
                      <span className="text-slate-500">Target Resolution</span>
                      <span className="text-slate-300">{item.target}</span>
                    </div>
                    {item.resolvedDate && (
                      <div className="flex justify-between border-b border-border/30 pb-1">
                        <span className="text-slate-500">Resolved</span>
                        <span className="text-emerald-400">{item.resolvedDate} — {item.resolvedBy}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <button className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">Edit</button>
                      {item.status === 'OPEN' && <button className="px-2.5 py-1 rounded bg-amber-800/60 text-amber-300 hover:bg-amber-700/60 transition-colors">Begin Mitigation</button>}
                      {item.status === 'IN_MITIGATION' && <button className="px-2.5 py-1 rounded bg-emerald-800/60 text-emerald-300 hover:bg-emerald-700/60 transition-colors">Mark Resolved</button>}
                    </div>
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
