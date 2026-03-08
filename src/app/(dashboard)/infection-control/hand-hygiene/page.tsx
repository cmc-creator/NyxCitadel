'use client';

import { useState } from 'react';
import { Droplets, Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const mockAudits = [
  { id: '1', auditDate: '2026-03-05', unit: 'Acute Adult A', auditor: 'J. Rivera, RN', opportunities: 24, compliant: 22, complianceRate: 91.7, staffType: 'RN' },
  { id: '2', auditDate: '2026-03-05', unit: 'Acute Adult B', auditor: 'J. Rivera, RN', opportunities: 20, compliant: 17, complianceRate: 85.0, staffType: 'RN' },
  { id: '3', auditDate: '2026-03-05', unit: 'Geriatric Psych', auditor: 'J. Rivera, RN', opportunities: 18, compliant: 16, complianceRate: 88.9, staffType: 'All Staff' },
  { id: '4', auditDate: '2026-02-19', unit: 'Acute Adult A', auditor: 'J. Rivera, RN', opportunities: 22, compliant: 18, complianceRate: 81.8, staffType: 'MD/APRN' },
  { id: '5', auditDate: '2026-02-19', unit: 'Acute Adult B', auditor: 'J. Rivera, RN', opportunities: 19, compliant: 15, complianceRate: 78.9, staffType: 'MD/APRN' },
  { id: '6', auditDate: '2026-02-19', unit: 'Geriatric Psych', auditor: 'T. Smith, RN', opportunities: 22, compliant: 20, complianceRate: 90.9, staffType: 'CNA/Tech' },
];

const unitTrend = [
  { unit: 'Acute Adult A', jan: 84, feb: 81, mar: 92 },
  { unit: 'Acute Adult B', jan: 79, feb: 79, mar: 85 },
  { unit: 'Geriatric Psych', jan: 87, feb: 91, mar: 89 },
];

export default function HandHygienePage() {
  const [unit, setUnit] = useState('ALL');
  const units = ['ALL', ...Array.from(new Set(mockAudits.map(a => a.unit)))];
  const filtered = unit === 'ALL' ? mockAudits : mockAudits.filter(a => a.unit === unit);
  const avgRate = filtered.reduce((sum, a) => sum + a.complianceRate, 0) / filtered.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Droplets className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Hand Hygiene Audits</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">JCAHO NPSG 07.01</span>
          </div>
          <p className="text-slate-400 text-sm">Unit-level direct observation audits — compliance rate vs. 90% facility goal.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Enter Audit
        </button>
      </div>

      {avgRate < 90 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Overall compliance ({avgRate.toFixed(1)}%) is below the 90% facility goal</p>
            <p className="text-xs text-amber-200/70 mt-0.5">Focus on MD/APRN staff category — Acute Adult units B and A are below goal for provider compliance. Consider targeted education and direct observation coaching.</p>
          </div>
        </div>
      )}

      {/* Unit Trend */}
      <div className="grid md:grid-cols-3 gap-4">
        {unitTrend.map(u => {
          const latestRate = u.mar;
          const prevRate = u.feb;
          const up = latestRate >= prevRate;
          return (
            <div key={u.unit} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
              <p className="font-semibold text-white text-sm mb-1">{u.unit}</p>
              <div className="flex items-end gap-2 mb-2">
                <p className={`text-3xl font-bold ${latestRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{latestRate}%</p>
                <div className="flex items-center gap-1 mb-1">
                  {up ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  <span className={`text-xs font-semibold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                    {up ? '+' : ''}{latestRate - prevRate}%
                  </span>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Jan: {u.jan}%</span>
                <span>Feb: {u.feb}%</span>
                <span className="font-semibold text-slate-300">Mar: {u.mar}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {units.map(u => (
          <button key={u} onClick={() => setUnit(u)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${unit === u ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
            {u === 'ALL' ? 'All Units' : u}
          </button>
        ))}
      </div>

      {/* Audit Table */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Date', 'Unit', 'Staff Type', 'Auditor', 'Opportunities', 'Compliant', 'Rate'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(a => {
              const below = a.complianceRate < 90;
              return (
                <tr key={a.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-400 text-xs">{a.auditDate}</td>
                  <td className="px-4 py-3 font-semibold text-white text-xs">{a.unit}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{a.staffType}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{a.auditor}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{a.opportunities}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{a.compliant}</td>
                  <td className={`px-4 py-3 font-bold text-sm ${below ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {a.complianceRate.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
