'use client';

import { useState } from 'react';
import { Search, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const mockPdmp = [
  { id: '1', checkDate: '2026-03-06', patientInitials: 'J.D.', medication: 'Lorazepam 1mg', prescriber: 'Dr. Martinez', prescriberId: 'AZ123456', historyReviewed: true, concernsFound: false, actionTaken: null, status: 'COMPLIANT' },
  { id: '2', checkDate: '2026-03-06', patientInitials: 'A.B.', medication: 'Alprazolam 0.5mg', prescriber: 'Dr. Williams', prescriberId: 'AZ789012', historyReviewed: true, concernsFound: true, actionTaken: 'Consulted with prescriber — patient disclosed prior prescriptions. Tapering plan initiated.', status: 'ACTION_TAKEN' },
  { id: '3', checkDate: '2026-03-05', patientInitials: 'T.J.', medication: 'Oxycodone 5mg (pain)', prescriber: 'Dr. Kim', prescriberId: 'AZ345678', historyReviewed: true, concernsFound: false, actionTaken: null, status: 'COMPLIANT' },
  { id: '4', checkDate: '2026-03-04', patientInitials: 'S.P.', medication: 'Clonazepam 1mg', prescriber: 'Dr. Martinez', prescriberId: 'AZ123456', historyReviewed: false, concernsFound: false, actionTaken: null, status: 'PENDING' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  COMPLIANT:      { label: 'Compliant',    color: 'bg-emerald-100 text-emerald-700' },
  ACTION_TAKEN:   { label: 'Action Taken', color: 'bg-blue-100 text-blue-700' },
  PENDING:        { label: 'Pending',      color: 'bg-amber-100 text-amber-700' },
  CONCERNS_OPEN:  { label: 'Open Concern', color: 'bg-red-100 text-red-700' },
};

export default function PdmpPage() {
  const pending = mockPdmp.filter(p => p.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Search className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">PDMP Check Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">ARS §36-2606</span>
          </div>
          <p className="text-slate-400 text-sm">Arizona Prescription Drug Monitoring Program — mandatory check log for controlled substance prescribing.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log PDMP Check
        </button>
      </div>

      {pending > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{pending} controlled substance prescription(s) with PDMP check not yet documented. ARS §36-2606 requires check prior to dispensing Schedule II medications.</p>
        </div>
      )}

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Date', 'Patient', 'Medication', 'Prescriber', 'NPI/ID', 'History Reviewed', 'Concerns', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockPdmp.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-slate-400 text-xs">{p.checkDate}</td>
                <td className="px-4 py-3 font-bold text-white">{p.patientInitials}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{p.medication}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{p.prescriber}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{p.prescriberId}</td>
                <td className="px-4 py-3">
                  {p.historyReviewed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                </td>
                <td className="px-4 py-3">
                  {p.concernsFound ? <span className="text-xs text-amber-300">Yes — actioned</span> : <span className="text-xs text-slate-500">None</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[p.status]?.color}`}>
                    {statusConfig[p.status]?.label}
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
