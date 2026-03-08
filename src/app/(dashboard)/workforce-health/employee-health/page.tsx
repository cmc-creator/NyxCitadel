'use client';

import { useState } from 'react';
import { Users2, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

const mockRecords = [
  { id: '1', employeeName: 'Sarah Torres, RN', dept: 'Acute Adult A', hireDate: '2022-03-14', tbTestDate: '2025-11-15', tbTestDue: '2026-11-15', tbStatus: 'CURRENT', fluVaccine: true, fluDeclined: false, fluSeason: '2025-26', hepBComplete: true, respiratorFitTest: '2025-09-01', notes: null },
  { id: '2', employeeName: 'Marcus Davis, MHT', dept: 'Acute Adult B', hireDate: '2023-07-01', tbTestDate: '2025-09-20', tbTestDue: '2026-09-20', tbStatus: 'CURRENT', fluVaccine: true, fluDeclined: false, fluSeason: '2025-26', hepBComplete: false, respiratorFitTest: null, notes: 'Hep B series in progress (dose 2 of 3 pending)' },
  { id: '3', employeeName: 'Karen Park, RN', dept: 'Geriatric Psych', hireDate: '2020-01-15', tbTestDate: '2024-10-05', tbTestDue: '2025-10-05', tbStatus: 'OVERDUE', fluVaccine: false, fluDeclined: true, fluSeason: '2025-26', hepBComplete: true, respiratorFitTest: '2025-09-01', notes: 'TB test overdue — contact employee health.' },
  { id: '4', employeeName: 'James Chen, LPC', dept: 'Therapy Services', hireDate: '2021-05-10', tbTestDate: '2025-12-01', tbTestDue: '2026-12-01', tbStatus: 'CURRENT', fluVaccine: true, fluDeclined: false, fluSeason: '2025-26', hepBComplete: true, respiratorFitTest: null, notes: null },
];

const tbStatusConfig: Record<string, { label: string; color: string }> = {
  CURRENT:      { label: 'Current',   color: 'bg-emerald-100 text-emerald-700' },
  OVERDUE:      { label: 'Overdue',   color: 'bg-red-100 text-red-700' },
  LATENT_LTBI:  { label: 'LTBI/INH',  color: 'bg-amber-100 text-amber-700' },
  WAIVED:       { label: 'Waived',    color: 'bg-slate-100 text-slate-600' },
};

export default function EmployeeHealthPage() {
  const overdueTb = mockRecords.filter(r => r.tbStatus === 'OVERDUE').length;
  const fluCompliant = mockRecords.filter(r => r.fluVaccine || r.fluDeclined).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users2 className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Employee Health Records</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">CDC / CMS CoP</span>
          </div>
          <p className="text-slate-400 text-sm">TB testing, flu vaccination, Hepatitis B series, and respirator fit testing for clinical staff.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Update Record
        </button>
      </div>

      {overdueTb > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{overdueTb} employee(s) have overdue TB screening. Contact employee health immediately — non-compliant staff may not work in patient care areas pending testing.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'TB Tests Current', value: `${mockRecords.filter(r => r.tbStatus === 'CURRENT').length}/${mockRecords.length}`, color: 'text-emerald-400' },
          { label: `Flu Compliant (2025-26)`, value: `${Math.round(fluCompliant / mockRecords.length * 100)}%`, color: 'text-emerald-400' },
          { label: 'Hep B Series Complete', value: `${mockRecords.filter(r => r.hepBComplete).length}/${mockRecords.length}`, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Employee', 'Department', 'TB Status', 'TB Due', 'Flu 2025-26', 'Hep B'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockRecords.map(r => (
              <tr key={r.id} className={`hover:bg-white/5 transition-colors ${r.tbStatus === 'OVERDUE' ? 'bg-red-500/5' : ''}`}>
                <td className="px-4 py-3">
                  <p className="text-white font-medium text-xs">{r.employeeName}</p>
                  {r.notes && <p className="text-xs text-amber-300/80 mt-0.5">{r.notes}</p>}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.dept}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tbStatusConfig[r.tbStatus]?.color}`}>
                    {tbStatusConfig[r.tbStatus]?.label}
                  </span>
                </td>
                <td className={`px-4 py-3 text-xs ${r.tbStatus === 'OVERDUE' ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>{r.tbTestDue}</td>
                <td className="px-4 py-3">
                  {r.fluVaccine ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                    : r.fluDeclined ? <span className="text-xs text-amber-400">Declined</span>
                    : <AlertTriangle className="w-4 h-4 text-red-400" />}
                </td>
                <td className="px-4 py-3">
                  {r.hepBComplete ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-amber-400">In Progress</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
