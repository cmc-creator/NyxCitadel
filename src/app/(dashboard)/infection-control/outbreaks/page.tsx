'use client';

import { useState } from 'react';
import { Biohazard, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

const mockOutbreaks = [
  {
    id: '1', outbreakNumber: 'OB-2026-001', organism: 'Norovirus', unitAffected: 'Geriatric Psych',
    caseCount: 4, startDate: '2026-01-10', endDate: '2026-01-22', reportedToHealth: true,
    status: 'RESOLVED', containmentActions: ['Enhanced cleaning', 'Cohorting', 'Visitor restrictions'],
  },
  {
    id: '2', outbreakNumber: 'OB-2025-003', organism: 'Influenza A', unitAffected: 'Acute Adult A',
    caseCount: 6, startDate: '2025-12-18', endDate: '2025-12-30', reportedToHealth: false,
    status: 'RESOLVED', containmentActions: ['Antiviral prophylaxis', 'Staff masking', 'No new admissions to unit'],
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:       { label: 'Active',      color: 'bg-red-100 text-red-700' },
  CONTAINED:    { label: 'Contained',   color: 'bg-amber-100 text-amber-700' },
  RESOLVED:     { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700' },
  SURVEILLANCE: { label: 'Surveillance', color: 'bg-blue-100 text-blue-700' },
};

export default function OutbreaksPage() {
  const [showForm, setShowForm] = useState(false);
  const active = mockOutbreaks.filter(o => o.status === 'ACTIVE' || o.status === 'CONTAINED').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Biohazard className="w-5 h-5 text-red-400" />
            <h1 className="text-xl font-bold text-white">Outbreak Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Reportable</span>
          </div>
          <p className="text-slate-400 text-sm">Track active and resolved outbreaks, containment measures, and health department notification.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log Outbreak
        </button>
      </div>

      {/* Status Banner */}
      {active === 0 ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-300">No active outbreaks — facility is clear</p>
        </div>
      ) : (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-300">{active} Active Outbreak{active > 1 ? 's' : ''} — immediate containment required</p>
        </div>
      )}

      {/* Outbreak Records */}
      <div className="space-y-4">
        {mockOutbreaks.map(o => (
          <div key={o.id} className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-slate-400">{o.outbreakNumber}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[o.status]?.color}`}>
                    {statusConfig[o.status]?.label}
                  </span>
                  {o.reportedToHealth && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">DOH Reported</span>
                  )}
                </div>
                <h3 className="text-white font-bold">{o.organism} — {o.unitAffected}</h3>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Start: {o.startDate}</p>
                {o.endDate && <p>End: {o.endDate}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="bg-slate-900/40 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-white">{o.caseCount}</p>
                <p className="text-xs text-slate-400">Total Cases</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5">Containment Actions</p>
              <div className="flex flex-wrap gap-2">
                {o.containmentActions.map(a => (
                  <span key={a} className="text-xs bg-slate-700 text-slate-300 rounded-full px-3 py-1">{a}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
