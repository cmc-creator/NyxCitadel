'use client';

import { useState } from 'react';
import { ClipboardList, CheckCircle, AlertTriangle, Plus } from 'lucide-react';

const riskAreas = [
  { area: 'Hand Hygiene Compliance', risk: 'Transmission of pathogens due to non-compliance', rating: 'HIGH', goal: 'Achieve ≥90% compliance by Q3 2026', owner: 'IC Nurse' },
  { area: 'Environmental Cleaning', risk: 'Insufficient terminal cleaning of patient rooms', rating: 'MEDIUM', goal: '100% checklist completion on all discharges', owner: 'EVS Supervisor' },
  { area: 'Multi-Drug Resistant Organisms', risk: 'MRSA/ESBL colonization spread to other patients', rating: 'HIGH', goal: 'Zero MRSA BSI; contact precaution compliance >95%', owner: 'IC Nurse' },
  { area: 'Respiratory Infections (Influenza)', risk: 'Facility-wide influenza outbreak during flu season', rating: 'MEDIUM', goal: '≥90% staff flu vaccination rate annually', owner: 'Employee Health' },
  { area: 'C. difficile', risk: 'CDI rates above NHSN benchmark', rating: 'MEDIUM', goal: 'SIR <1.0; antibiotic stewardship adherence ≥85%', owner: 'Pharmacy / IC' },
  { area: 'Sharps / Needlestick Injuries', risk: 'Bloodborne pathogen exposure to staff', rating: 'LOW', goal: 'Zero needlestick injuries; safety device compliance 100%', owner: 'Employee Health' },
  { area: 'Surgical / Procedure Site Infections', risk: 'SSI from bedside procedures', rating: 'LOW', goal: 'Sterile technique audit ≥95% compliance', owner: 'CNO' },
  { area: 'Construction / Renovation (ICRA)', risk: 'Aspergillus / fungal exposure during construction', rating: 'MEDIUM', goal: 'ICRA permit required for all projects > 8 sq ft', owner: 'Facilities / IC' },
];

const ratingColor: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-emerald-100 text-emerald-700',
};

export default function IcraPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">IC Risk Assessment (ICRA)</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">CMS §482.42</span>
          </div>
          <p className="text-slate-400 text-sm">Annual infection control risk assessment — identifies risks, assigns ratings, sets mitigation goals.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Assessment
        </button>
      </div>

      {/* Current Assessment Banner */}
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-teal-300">2026 ICRA — APPROVED</p>
          <p className="text-xs text-teal-200/70 mt-0.5">Conducted: January 15, 2026 · Approved by: Chief Nursing Officer · Next due: January 2027</p>
        </div>
      </div>

      {/* Risk Areas Table */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <p className="font-semibold text-white text-sm">2026 Risk Areas ({riskAreas.length} identified)</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40">
            <tr>
              {['Risk Area', 'Risk Description', 'Rating', 'Mitigation Goal', 'Owner'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {riskAreas.map((r, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-semibold text-white text-xs">{r.area}</td>
                <td className="px-4 py-3 text-slate-400 text-xs max-w-xs">{r.risk}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ratingColor[r.rating]}`}>{r.rating}</span>
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs max-w-sm">{r.goal}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
