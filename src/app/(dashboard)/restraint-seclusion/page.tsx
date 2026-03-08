'use client';

import { useState } from 'react';
import { ShieldOff, Clock, AlertTriangle, CheckCircle, Plus, FileText, Users, Activity } from 'lucide-react';

const mockEvents = [
  {
    id: '1', eventNumber: 'RS-2026-001', patientInitials: 'J.D.', unit: 'Acute Adult A', eventDate: '2026-02-18',
    rsType: 'PHYSICAL_RESTRAINT', orderingProvider: 'Dr. Martinez', durationMinutes: 42,
    debrief: true, injuryOccurred: false, deathOccurred: false, status: 'CLOSED',
  },
  {
    id: '2', eventNumber: 'RS-2026-002', patientInitials: 'M.K.', unit: 'Acute Adult B', eventDate: '2026-02-22',
    rsType: 'SECLUSION', orderingProvider: 'Dr. Chen', durationMinutes: 78,
    debrief: true, injuryOccurred: false, deathOccurred: false, status: 'CLOSED',
  },
  {
    id: '3', eventNumber: 'RS-2026-003', patientInitials: 'R.T.', unit: 'Geriatric Psych', eventDate: '2026-03-01',
    rsType: 'PHYSICAL_RESTRAINT', orderingProvider: 'Dr. Williams', durationMinutes: 25,
    debrief: false, injuryOccurred: false, deathOccurred: false, status: 'MONITORING',
  },
  {
    id: '4', eventNumber: 'RS-2026-004', patientInitials: 'A.B.', unit: 'Acute Adult A', eventDate: '2026-03-04',
    rsType: 'CHEMICAL_RESTRAINT', orderingProvider: 'Dr. Martinez', durationMinutes: null,
    debrief: false, injuryOccurred: false, deathOccurred: false, status: 'OPEN',
  },
  {
    id: '5', eventNumber: 'RS-2026-005', patientInitials: 'S.L.', unit: 'Geriatric Psych', eventDate: '2026-03-05',
    rsType: 'MECHANICAL_RESTRAINT', orderingProvider: 'Dr. Thompson', durationMinutes: 110,
    debrief: true, injuryOccurred: true, deathOccurred: false, status: 'MONITORING',
  },
];

const typeLabels: Record<string, string> = {
  PHYSICAL_RESTRAINT: 'Physical',
  MECHANICAL_RESTRAINT: 'Mechanical',
  CHEMICAL_RESTRAINT: 'Chemical',
  SECLUSION: 'Seclusion',
  PHYSICAL_HOLD: 'Physical Hold',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  OPEN:      { label: 'Open',       color: 'bg-red-100 text-red-700' },
  MONITORING:{ label: 'Monitoring', color: 'bg-amber-100 text-amber-700' },
  DEBRIEFED: { label: 'Debriefed',  color: 'bg-blue-100 text-blue-700' },
  CLOSED:    { label: 'Closed',     color: 'bg-emerald-100 text-emerald-700' },
  REPORTED:  { label: 'Reported',   color: 'bg-purple-100 text-purple-700' },
};

export default function RestraintSeclusionPage() {
  const [filter, setFilter] = useState('ALL');

  const total = mockEvents.length;
  const open  = mockEvents.filter(e => e.status === 'OPEN' || e.status === 'MONITORING').length;
  const debriefPending = mockEvents.filter(e => !e.debrief && e.status !== 'OPEN').length;
  const injuries = mockEvents.filter(e => e.injuryOccurred).length;

  const filtered = filter === 'ALL' ? mockEvents
    : filter === 'OPEN' ? mockEvents.filter(e => e.status === 'OPEN' || e.status === 'MONITORING')
    : mockEvents.filter(e => e.rsType === filter);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ShieldOff className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-bold text-white">Restraint & Seclusion</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">CMS §482.13</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">JCAHO RC.02</span>
          </div>
          <p className="text-slate-400 text-sm">Track every restraint and seclusion event — orders, monitoring, debriefs, and CMS reporting.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New R&S Event
        </button>
      </div>

      {/* CMS Alert Banner */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-300">CMS Mandatory Reporting</p>
          <p className="text-xs text-red-200/70 mt-0.5">Any death of a patient in restraint, in seclusion, or within 24 hours of removal from restraint/seclusion must be reported to CMS within 24 hours. A follow-up report is due within 5 business days.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'YTD Events', value: total, icon: Activity, color: 'text-blue-400' },
          { label: 'Open / Monitoring', value: open, icon: Clock, color: 'text-amber-400' },
          { label: 'Debrief Pending', value: debriefPending, icon: Users, color: 'text-orange-400' },
          { label: 'Injuries', value: injuries, icon: AlertTriangle, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Compliance Requirements */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">CMS Documentation Requirements Per Event</p>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { req: 'Written physician order', timing: 'Before initiation (except emergency)' },
            { req: 'Physician face-to-face evaluation', timing: 'Within 1 hour of initiation' },
            { req: 'Patient monitoring', timing: 'Every 15 minutes minimum' },
            { req: 'Clinical justification documented', timing: 'At time of order' },
            { req: 'Post-event debrief with patient', timing: 'Within 24 hours of release' },
            { req: 'Death report to CMS', timing: 'Within 24 hours if death occurs' },
          ].map(r => (
            <div key={r.req} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-xs font-medium">{r.req}</p>
                <p className="text-slate-500 text-xs">{r.timing}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'OPEN', 'PHYSICAL_RESTRAINT', 'SECLUSION', 'CHEMICAL_RESTRAINT', 'MECHANICAL_RESTRAINT'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {f === 'ALL' ? 'All Events' : f === 'OPEN' ? 'Open / Monitoring' : typeLabels[f] ?? f}
          </button>
        ))}
      </div>

      {/* Events Table */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 bg-slate-900/40">
            <tr>
              {['Event #', 'Patient', 'Unit', 'Date', 'Type', 'Duration', 'Debrief', 'Injury', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-300">{e.eventNumber}</td>
                <td className="px-4 py-3 font-semibold text-white">{e.patientInitials}</td>
                <td className="px-4 py-3 text-slate-300">{e.unit}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{e.eventDate}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium text-slate-300">{typeLabels[e.rsType] ?? e.rsType}</span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {e.durationMinutes ? `${e.durationMinutes} min` : <span className="text-amber-400">Ongoing</span>}
                </td>
                <td className="px-4 py-3">
                  {e.debrief
                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : <span className="text-xs text-amber-400">Pending</span>
                  }
                </td>
                <td className="px-4 py-3">
                  {e.injuryOccurred
                    ? <span className="text-xs font-semibold text-red-400">Yes</span>
                    : <span className="text-xs text-slate-500">None</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[e.status]?.color ?? 'bg-slate-700 text-slate-300'}`}>
                    {statusConfig[e.status]?.label ?? e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
