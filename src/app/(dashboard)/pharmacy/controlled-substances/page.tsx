'use client';

import { useState } from 'react';
import { Clipboard, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const mockLogs = [
  { id: '1', logDate: '2026-03-06', unit: 'Acute Adult A', shift: 'Night', medication: 'Lorazepam 1mg IM', schedule: 'SCHEDULE_IV', amountExpected: 10, amountCounted: 10, countDifference: 0, discrepancyFound: false, countedBy: 'J. Rivera, RN', witnessName: 'T. Smith, RN', status: 'RECONCILED' },
  { id: '2', logDate: '2026-03-06', unit: 'Acute Adult B', shift: 'Night', medication: 'Clonazepam 0.5mg tablets', schedule: 'SCHEDULE_IV', amountExpected: 24, amountCounted: 24, countDifference: 0, discrepancyFound: false, countedBy: 'M. Park, RN', witnessName: 'L. Torres, APRN', status: 'RECONCILED' },
  { id: '3', logDate: '2026-03-06', unit: 'Geriatric Psych', shift: 'Evening', medication: 'Morphine 4mg/mL vials', schedule: 'SCHEDULE_II', amountExpected: 6, amountCounted: 5, countDifference: 1, discrepancyFound: true, countedBy: 'K. Davis, RN', witnessName: 'A. Jones, RN', status: 'DISCREPANCY_OPEN' },
  { id: '4', logDate: '2026-03-05', unit: 'Acute Adult A', shift: 'Day', medication: 'Alprazolam 0.5mg tablets', schedule: 'SCHEDULE_IV', amountExpected: 18, amountCounted: 18, countDifference: 0, discrepancyFound: false, countedBy: 'C. Lee, RN', witnessName: 'B. Chen, RN', status: 'RECONCILED' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  RECONCILED:              { label: 'Reconciled',          color: 'bg-emerald-100 text-emerald-700' },
  DISCREPANCY_OPEN:        { label: 'Discrepancy Open',    color: 'bg-red-100 text-red-700' },
  DISCREPANCY_EXPLAINED:   { label: 'Explained',           color: 'bg-amber-100 text-amber-700' },
  REPORTED_DEA:            { label: 'Reported to DEA',     color: 'bg-purple-100 text-purple-700' },
  INVESTIGATION:           { label: 'Under Investigation', color: 'bg-orange-100 text-orange-700' },
};

export default function ControlledSubstancesPage() {
  const discrepancies = mockLogs.filter(l => l.discrepancyFound && l.status === 'DISCREPANCY_OPEN').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Clipboard className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Controlled Substance Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">DEA Schedule II–V</span>
          </div>
          <p className="text-slate-400 text-sm">Shift count verification, waste reconciliation, and discrepancy tracking for controlled substances.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Enter Count
        </button>
      </div>

      {discrepancies > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">{discrepancies} open discrepancy requiring investigation</p>
            <p className="text-xs text-red-200/70 mt-0.5">Morphine shortage on Geriatric Psych. Notify pharmacy director, review floor access, and complete discrepancy investigation per policy. DEA reporting may be required if theft is suspected.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Logs This Shift', value: 4, color: 'text-emerald-400' },
          { label: 'Open Discrepancies', value: discrepancies, color: discrepancies > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'YTD CS Discrepancies', value: 2, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Date', 'Unit', 'Shift', 'Medication', 'Schedule', 'Expected', 'Counted', 'Difference', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockLogs.map(l => (
              <tr key={l.id} className={`hover:bg-white/5 transition-colors ${l.discrepancyFound ? 'bg-red-500/5' : ''}`}>
                <td className="px-3 py-3 text-slate-400 text-xs">{l.logDate}</td>
                <td className="px-3 py-3 text-slate-300 text-xs">{l.unit}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{l.shift}</td>
                <td className="px-3 py-3 font-semibold text-white text-xs">{l.medication}</td>
                <td className="px-3 py-3 text-xs">
                  <span className="text-xs font-semibold text-red-300 bg-red-900/30 px-2 py-0.5 rounded">
                    {l.schedule.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-300 text-xs">{l.amountExpected}</td>
                <td className="px-3 py-3 text-slate-300 text-xs">{l.amountCounted}</td>
                <td className={`px-3 py-3 font-bold text-xs ${l.countDifference !== 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {l.countDifference !== 0 ? `−${Math.abs(l.countDifference)}` : '0'}
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[l.status]?.color}`}>
                    {statusConfig[l.status]?.label}
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
