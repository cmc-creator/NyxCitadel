import { FileText, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; classes: string }> = {
  APPROVED:  { label: 'Approved',  classes: 'bg-emerald-100 text-emerald-700' },
  DRAFT:     { label: 'Draft',     classes: 'bg-blue-100 text-blue-700' },
  UNDER_REVIEW: { label: 'Under Review', classes: 'bg-yellow-100 text-yellow-700' },
  ARCHIVED:  { label: 'Archived',  classes: 'bg-slate-100 text-slate-700' },
};

export default async function GovernanceDocumentsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const in90 = new Date(now); in90.setDate(in90.getDate() + 90);

  const docs = await prisma.governanceDocument.findMany({
    where: { facilityId },
    orderBy: { reviewDate: 'asc' },
  });

  const overdue = docs.filter(d => d.reviewDate && d.reviewDate < now).length;
  const expiringSoon = docs.filter(d => d.reviewDate && d.reviewDate >= now && d.reviewDate <= in90).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Governance Documents</h1>
          </div>
          <p className="text-slate-400 text-sm">Bylaws, board charters, policies, and governance-level approvals.</p>
        </div>
        <a href="/governance/documents/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Document
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: docs.length, color: 'text-blue-400' },
          { label: 'Approved', value: docs.filter(d => d.status === 'APPROVED').length, color: 'text-emerald-400' },
          { label: 'Overdue Review', value: overdue, color: overdue > 0 ? 'text-red-400' : 'text-slate-400' },
          { label: 'Review Due (90d)', value: expiringSoon, color: expiringSoon > 0 ? 'text-amber-400' : 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {overdue > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{overdue} document(s) are overdue for review. Complete before the next board meeting.</p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-xs">
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Version</th>
              <th className="text-left px-4 py-3">Effective</th>
              <th className="text-left px-4 py-3">Review Due</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No governance documents on record.</td></tr>
            ) : docs.map(d => {
              const cfg = statusConfig[d.status] ?? { label: d.status, classes: 'bg-slate-100 text-slate-700' };
              const isOverdue = d.reviewDate && d.reviewDate < now;
              return (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{d.title}</td>
                  <td className="px-4 py-3 text-slate-400">{d.docType}</td>
                  <td className="px-4 py-3 text-slate-400">{d.version ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{d.effectiveDate?.toLocaleDateString() ?? '—'}</td>
                  <td className={`px-4 py-3 ${isOverdue ? 'text-red-400 font-medium' : 'text-slate-300'}`}>{d.reviewDate?.toLocaleDateString() ?? '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>{cfg.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
