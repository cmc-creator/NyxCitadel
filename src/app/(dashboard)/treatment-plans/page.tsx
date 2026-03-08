'use client';

import { useState } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';

const mockPlans = [
  {
    id: '1', patientInitials: 'J.D.', unit: 'Acute Adult A', admitDate: '2026-02-28',
    primaryDx: 'Major Depressive Disorder w/ SI', planCreatedDate: '2026-03-01',
    planCreatedHours: 18, patientParticipated: true, reviewCount: 1,
    lastReviewDate: '2026-03-04', status: 'ACTIVE', goalsCount: 3,
  },
  {
    id: '2', patientInitials: 'M.K.', unit: 'Acute Adult B', admitDate: '2026-03-01',
    primaryDx: 'Bipolar I – Manic Episode', planCreatedDate: '2026-03-01',
    planCreatedHours: 20, patientParticipated: true, reviewCount: 1,
    lastReviewDate: '2026-03-05', status: 'ACTIVE', goalsCount: 4,
  },
  {
    id: '3', patientInitials: 'R.T.', unit: 'Geriatric Psych', admitDate: '2026-03-03',
    primaryDx: 'Dementia w/ Behavioral Disturbance', planCreatedDate: '2026-03-04',
    planCreatedHours: 30, patientParticipated: false, reviewCount: 0,
    lastReviewDate: null, status: 'ACTIVE', goalsCount: 2,
  },
  {
    id: '4', patientInitials: 'A.B.', unit: 'Acute Adult A', admitDate: '2026-03-05',
    primaryDx: 'Schizophrenia – Acute Exacerbation', planCreatedDate: '2026-03-06',
    planCreatedHours: 22, patientParticipated: true, reviewCount: 0,
    lastReviewDate: null, status: 'ACTIVE', goalsCount: 3,
  },
  {
    id: '5', patientInitials: 'S.L.', unit: 'Acute Adult B', admitDate: '2026-02-15',
    primaryDx: 'PTSD – Acute', planCreatedDate: '2026-02-16',
    planCreatedHours: 19, patientParticipated: true, reviewCount: 3,
    lastReviewDate: '2026-03-04', status: 'ACTIVE', goalsCount: 4,
  },
  {
    id: '6', patientInitials: 'C.M.', unit: 'Geriatric Psych', admitDate: '2026-02-20',
    primaryDx: 'Major Depressive Disorder – Recurrent', planCreatedDate: '2026-02-21',
    planCreatedHours: 24, patientParticipated: false, reviewCount: 2,
    lastReviewDate: '2026-03-04', status: 'ACTIVE', goalsCount: 3,
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:      { label: 'Active',      color: 'bg-blue-100 text-blue-700' },
  UPDATED:     { label: 'Updated',     color: 'bg-indigo-100 text-indigo-700' },
  DISCHARGED:  { label: 'Discharged',  color: 'bg-emerald-100 text-emerald-700' },
  TRANSFERRED: { label: 'Transferred', color: 'bg-amber-100 text-amber-700' },
};

export default function TreatmentPlansPage() {
  const [unit, setUnit] = useState('ALL');
  const units = ['ALL', ...Array.from(new Set(mockPlans.map(p => p.unit)))];
  const filtered = unit === 'ALL' ? mockPlans : mockPlans.filter(p => p.unit === unit);

  const reviewOverdue = mockPlans.filter(p => {
    if (!p.lastReviewDate) return p.reviewCount === 0 && p.admitDate < '2026-03-01';
    const last = new Date(p.lastReviewDate);
    const now = new Date('2026-03-07');
    return (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24) > 7;
  }).length;

  const noParticipation = mockPlans.filter(p => !p.patientParticipated).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList className="w-6 h-6 text-violet-400" />
            <h1 className="text-2xl font-bold text-white">Treatment Planning</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">TJC PC.01.02.03</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">ADHS R9-10</span>
          </div>
          <p className="text-slate-400 text-sm">Individualized treatment plans — creation within 24h, weekly reviews, patient participation documentation.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {/* Compliance Requirements */}
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
        <p className="text-xs font-semibold text-violet-300 mb-2">Regulatory Requirements (Acute Inpatient Psychiatric)</p>
        <div className="grid md:grid-cols-3 gap-2">
          {[
            { req: 'Treatment plan initiation', timing: 'Within 24 hours of admission', icon: Clock },
            { req: 'Interdisciplinary team review', timing: 'Every 7 days (weekly minimum)', icon: Users },
            { req: 'Patient participation documented', timing: 'At every plan and review', icon: CheckCircle },
          ].map(r => (
            <div key={r.req} className="flex items-start gap-2">
              <r.icon className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">{r.req}</p>
                <p className="text-xs text-violet-200/60">{r.timing}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Plans', value: mockPlans.filter(p => p.status === 'ACTIVE').length, icon: ClipboardList, color: 'text-violet-400' },
          { label: 'Review Overdue (>7 days)', value: reviewOverdue, icon: Clock, color: reviewOverdue > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'No Patient Participation', value: noParticipation, icon: Users, color: noParticipation > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Plans Created <24h', value: mockPlans.filter(p => p.planCreatedHours <= 24).length, icon: CheckCircle, color: 'text-emerald-400' },
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

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {units.map(u => (
          <button key={u} onClick={() => setUnit(u)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${unit === u ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
            {u === 'ALL' ? 'All Units' : u}
          </button>
        ))}
      </div>

      {/* Plans Table */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Patient', 'Unit', 'Admit', 'Primary Dx', 'Plan Created', 'Created Within', 'Last Review', 'Reviews', 'Pt Participated', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(p => {
              const over24h = p.planCreatedHours > 24;
              const noReview = p.reviewCount === 0 && new Date(p.admitDate) < new Date('2026-03-01');
              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-3 font-semibold text-white text-xs">{p.patientInitials}</td>
                  <td className="px-3 py-3 text-slate-300 text-xs">{p.unit}</td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{p.admitDate}</td>
                  <td className="px-3 py-3 text-slate-300 text-xs max-w-xs">{p.primaryDx}</td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{p.planCreatedDate}</td>
                  <td className={`px-3 py-3 text-xs font-semibold ${over24h ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {p.planCreatedHours}h
                  </td>
                  <td className={`px-3 py-3 text-xs ${noReview ? 'text-red-400' : 'text-slate-400'}`}>
                    {p.lastReviewDate ?? <span className="text-amber-400">None</span>}
                  </td>
                  <td className="px-3 py-3 text-slate-300 text-xs">{p.reviewCount}</td>
                  <td className="px-3 py-3">
                    {p.patientParticipated
                      ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                      : <span className="text-xs text-slate-500">No</span>
                    }
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[p.status]?.color}`}>
                      {statusConfig[p.status]?.label ?? p.status}
                    </span>
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
