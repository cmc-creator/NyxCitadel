'use client';

import { useState } from 'react';
import { FileText, Plus, AlertTriangle, CheckCircle, Download } from 'lucide-react';

const mockDocs = [
  { id: '1', title: 'Medical Staff Bylaws', docType: 'BYLAWS', version: '4.2', lastReviewDate: '2024-11-01', nextReviewDate: '2025-11-01', status: 'OVERDUE_REVIEW', approvedBy: 'Board of Directors', notes: null },
  { id: '2', title: 'Governing Board Bylaws', docType: 'BYLAWS', version: '3.1', lastReviewDate: '2025-01-15', nextReviewDate: '2026-01-15', status: 'DUE_SOON', approvedBy: 'Board of Directors', notes: null },
  { id: '3', title: 'Allied Health Professionals Bylaws', docType: 'BYLAWS', version: '2.0', lastReviewDate: '2024-09-10', nextReviewDate: '2025-09-10', status: 'OVERDUE_REVIEW', approvedBy: 'MEC', notes: null },
  { id: '4', title: 'TJC Self-Assessment Checklist 2025', docType: 'SELF_ASSESSMENT', version: '2025', lastReviewDate: '2025-12-01', nextReviewDate: '2026-06-01', status: 'CURRENT', approvedBy: 'Quality Director', notes: null },
  { id: '5', title: 'Organizational Chart — Medical Staff', docType: 'ORG_CHART', version: '1.8', lastReviewDate: '2025-06-01', nextReviewDate: '2026-06-01', status: 'CURRENT', approvedBy: 'CMO', notes: null },
  { id: '6', title: 'Board Resolution — 2025 Budget Approval', docType: 'RESOLUTION', version: null, lastReviewDate: '2025-01-20', nextReviewDate: null, status: 'ARCHIVED', approvedBy: 'Board of Directors', notes: null },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  CURRENT:        { label: 'Current',         color: 'bg-emerald-100 text-emerald-700' },
  DUE_SOON:       { label: 'Review Due Soon', color: 'bg-amber-100 text-amber-700' },
  OVERDUE_REVIEW: { label: 'Overdue Review',  color: 'bg-red-100 text-red-700' },
  DRAFT:          { label: 'In Draft',        color: 'bg-blue-100 text-blue-700' },
  ARCHIVED:       { label: 'Archived',        color: 'bg-slate-100 text-slate-600' },
};

const typeLabels: Record<string, string> = {
  BYLAWS:           'Bylaws',
  SELF_ASSESSMENT:  'Self-Assessment',
  ORG_CHART:        'Org Chart',
  RESOLUTION:       'Board Resolution',
  POLICY:           'Policy',
};

export default function GovernanceDocumentsPage() {
  const overdue = mockDocs.filter(d => d.status === 'OVERDUE_REVIEW').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Governance Documents</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">TJC LD.01.01</span>
          </div>
          <p className="text-slate-400 text-sm">Board bylaws, medical staff bylaws, org charts, resolutions, and TJC self-assessments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Document
        </button>
      </div>

      {overdue > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{overdue} document(s) are overdue for review. TJC requires governance documents — particularly bylaws — to be reviewed at least annually. Initiate review immediately.</p>
        </div>
      )}

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Document', 'Type', 'Version', 'Last Review', 'Next Review', 'Approved By', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockDocs.map(d => (
              <tr key={d.id} className={`hover:bg-white/5 transition-colors ${d.status === 'OVERDUE_REVIEW' ? 'bg-red-500/5' : ''}`}>
                <td className="px-4 py-3">
                  <p className="text-white font-medium text-xs">{d.title}</p>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{typeLabels[d.docType] ?? d.docType}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{d.version ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{d.lastReviewDate}</td>
                <td className={`px-4 py-3 text-xs font-medium ${d.status === 'OVERDUE_REVIEW' ? 'text-red-400' : d.status === 'DUE_SOON' ? 'text-amber-400' : 'text-slate-500'}`}>
                  {d.nextReviewDate ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{d.approvedBy}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[d.status]?.color}`}>
                    {statusConfig[d.status]?.label}
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
