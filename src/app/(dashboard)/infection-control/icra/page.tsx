import { ClipboardList, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ratingColor: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  LOW: 'bg-emerald-100 text-emerald-700',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT:      { label: 'Draft',      color: 'bg-muted/30 text-muted-foreground' },
  IN_REVIEW:  { label: 'In Review',  color: 'bg-amber-100 text-amber-700' },
  APPROVED:   { label: 'Approved',   color: 'bg-emerald-100 text-emerald-700' },
  SUPERSEDED: { label: 'Superseded', color: 'bg-muted/30 text-muted-foreground' },
};

export default async function IcraPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const assessments = await prisma.icRiskAssessment.findMany({
    where: { facilityId },
    orderBy: { assessmentYear: 'desc' },
  });

  const current = assessments.find(a => a.status === 'APPROVED') ?? assessments[0] ?? null;
  const riskAreas = Array.isArray(current?.riskAreas)
    ? (current.riskAreas as Array<{ area: string; risk: string; rating: string; mitigationGoal: string; owner?: string }>)
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">IC Risk Assessment (ICRA)</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">CMS §482.42</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Annual infection control risk assessment - identifies risks, assigns ratings, sets mitigation goals.</p>
        </div>
        <Link href="/infection-control/icra/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Assessment
        </Link>
      </div>

      {current ? (
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${current.status === 'APPROVED' ? 'border-teal-500/30 bg-teal-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
          {current.status === 'APPROVED'
            ? <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
            : <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          }
          <div>
            <p className={`text-sm font-semibold ${current.status === 'APPROVED' ? 'text-teal-300' : 'text-amber-300'}`}>
              {current.assessmentYear} ICRA - {statusConfig[current.status]?.label ?? current.status}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Conducted: {new Date(current.conductedDate).toLocaleDateString()}
              {current.approvedBy ? ` · Approved by: ${current.approvedBy}` : ''}
              {current.reviewedBy ? ` · Reviewed by: ${current.reviewedBy}` : ''}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">No active ICRA found. An annual IC Risk Assessment is required per CMS §482.42.</p>
        </div>
      )}

      {riskAreas.length > 0 && (
        <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-x-auto">
          <div className="px-5 py-3 border-b border-white/10">
            <p className="font-semibold text-white text-sm">{current?.assessmentYear} Risk Areas ({riskAreas.length} identified)</p>
          </div>
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-900/40">
              <tr>
                {['Risk Area', 'Risk Description', 'Rating', 'Mitigation Goal', 'Owner'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground/70 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {riskAreas.map((r, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white text-xs">{r.area}</td>
                  <td className="px-4 py-3 text-muted-foreground/70 text-xs max-w-xs">{r.risk}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ratingColor[r.rating] ?? 'bg-muted/30 text-muted-foreground'}`}>{r.rating}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 text-xs max-w-sm">{r.mitigationGoal}</td>
                  <td className="px-4 py-3 text-muted-foreground/70 text-xs">{r.owner ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assessments.length > 1 && (
        <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-x-auto">
          <div className="px-5 py-3 border-b border-white/10">
            <p className="font-semibold text-white text-sm">Assessment History</p>
          </div>
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-900/40">
              <tr>
                {['Year', 'Conducted', 'Conducted By', 'Status', 'Approved By'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground/70 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {assessments.map(a => (
                <tr key={a.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white text-xs">{a.assessmentYear}</td>
                  <td className="px-4 py-3 text-muted-foreground/70 text-xs">{new Date(a.conductedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{a.conductedBy}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[a.status]?.color ?? 'bg-muted/30 text-muted-foreground'}`}>
                      {statusConfig[a.status]?.label ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground/70 text-xs">{a.approvedBy ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assessments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No IC risk assessments on record.</p>
        </div>
      )}
    </div>
  );
}
