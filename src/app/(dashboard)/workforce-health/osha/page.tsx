'use client';

import { useState } from 'react';
import { Users2, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

const mockOsha = [
  { id: '1', incidentDate: '2026-02-14', employeeName: 'S. Torres (RN)', dept: 'Acute Adult A', injuryType: 'NEEDLESTICK', bodyPart: 'Right index finger', daysAway: 0, daysRestricted: 3, recordable: true, outcome: 'RESTRICTED_DUTY', postExposureCompleted: true },
  { id: '2', incidentDate: '2026-01-28', employeeName: 'M. Davis (MHT)', dept: 'Acute Adult B', injuryType: 'PATIENT_ASSAULT', bodyPart: 'Left forearm', daysAway: 2, daysRestricted: 5, recordable: true, outcome: 'DAYS_AWAY', postExposureCompleted: null },
  { id: '3', incidentDate: '2026-01-10', employeeName: 'K. Park (RN)', dept: 'Geriatric Psych', injuryType: 'MUSCULOSKELETAL', bodyPart: 'Lower back', daysAway: 0, daysRestricted: 7, recordable: true, outcome: 'RESTRICTED_DUTY', postExposureCompleted: null },
  { id: '4', incidentDate: '2025-12-05', employeeName: 'R. James (RN)', dept: 'Child/Adolescent', injuryType: 'SLIP_FALL', bodyPart: 'Wrist', daysAway: 1, daysRestricted: 0, recordable: false, outcome: 'FIRST_AID_ONLY', postExposureCompleted: null },
];

const injuryLabels: Record<string, string> = {
  NEEDLESTICK:      'Needlestick / Sharps',
  PATIENT_ASSAULT:  'Patient Assault',
  MUSCULOSKELETAL:  'Musculoskeletal',
  SLIP_FALL:        'Slip / Trip / Fall',
  EXPOSURE:         'Chemical Exposure',
  OTHER:            'Other',
};

const outcomeConfig: Record<string, { label: string; color: string }> = {
  DAYS_AWAY:        { label: 'Days Away',      color: 'bg-red-100 text-red-700' },
  RESTRICTED_DUTY:  { label: 'Restricted',     color: 'bg-amber-100 text-amber-700' },
  TRANSFER:         { label: 'Job Transfer',   color: 'bg-orange-100 text-orange-700' },
  FIRST_AID_ONLY:   { label: 'First Aid Only', color: 'bg-blue-100 text-blue-700' },
  FATALITY:         { label: 'Fatality',       color: 'bg-red-900 text-red-100' },
};

export default function OshaLogPage() {
  const recordable = mockOsha.filter(o => o.recordable).length;
  const daysAway = mockOsha.reduce((sum, o) => sum + o.daysAway, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users2 className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">OSHA 300 Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">29 CFR 1904</span>
          </div>
          <p className="text-slate-400 text-sm">Recordable workplace injuries and illnesses — days away, restricted duty, and illness tracking for OSHA 300 annual reporting.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log Incident
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Recordable Events YTD', value: recordable, color: 'text-amber-400' },
          { label: 'Days Away From Work', value: daysAway, color: 'text-red-400' },
          { label: 'Patient Assaults YTD', value: mockOsha.filter(o => o.injuryType === 'PATIENT_ASSAULT').length, color: 'text-orange-400' },
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
              {['Date', 'Employee', 'Dept', 'Injury Type', 'Body Part', 'Days Away', 'Days Restricted', 'Recordable', 'Outcome'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockOsha.map(o => (
              <tr key={o.id} className={`hover:bg-white/5 transition-colors ${o.recordable ? '' : 'opacity-60'}`}>
                <td className="px-3 py-3 text-slate-400 text-xs">{o.incidentDate}</td>
                <td className="px-3 py-3 text-slate-300 text-xs font-semibold">{o.employeeName}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{o.dept}</td>
                <td className="px-3 py-3 text-slate-300 text-xs">{injuryLabels[o.injuryType] ?? o.injuryType}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{o.bodyPart}</td>
                <td className={`px-3 py-3 font-bold text-xs ${o.daysAway > 0 ? 'text-red-400' : 'text-slate-500'}`}>{o.daysAway}</td>
                <td className={`px-3 py-3 font-bold text-xs ${o.daysRestricted > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{o.daysRestricted}</td>
                <td className="px-3 py-3">
                  {o.recordable
                    ? <span className="text-xs font-semibold text-red-400">Recordable</span>
                    : <span className="text-xs text-slate-500">No</span>}
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${outcomeConfig[o.outcome]?.color}`}>
                    {outcomeConfig[o.outcome]?.label}
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
