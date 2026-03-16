import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ShieldAlert, ExternalLink , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  { value: 'REVIEWED', label: 'Reviewed', color: 'bg-purple-100 text-purple-700' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-700' },
  { value: 'ARCHIVED', label: 'Archived', color: 'bg-slate-100 text-slate-400' },
];

const RISK_LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-600 text-white',
  HIGH: 'bg-orange-500 text-white',
  MEDIUM: 'bg-yellow-400 text-yellow-900',
  LOW: 'bg-green-100 text-green-700',
};

const RISK_SCORE_COLOR = (score: number) => {
  if (score >= 20) return 'bg-red-100 text-red-700 font-bold';
  if (score >= 12) return 'bg-orange-100 text-orange-700 font-bold';
  if (score >= 6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
};

const ITEM_STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  MITIGATED: 'bg-teal-100 text-teal-700',
  ACCEPTED: 'bg-slate-100 text-slate-600',
  CLOSED: 'bg-green-100 text-green-700',
};

export default async function RiskAssessmentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const ra = await prisma.riskAssessment.findUnique({
    where: { id: params.id },
    include: {
      items: { orderBy: { riskScore: 'desc' } },
    },
  });

  if (!ra || ra.facilityId !== session.user.facilityId) notFound();

  const regulatoryBodies = ra.regulatoryBody as string[] | null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/risk-assessments" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Risk Assessments
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/trackers/risk-assessments/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              {ra.overallRiskLevel && (
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${RISK_LEVEL_COLORS[ra.overallRiskLevel]}`}>
                  {ra.overallRiskLevel} RISK
                </span>
              )}
              <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">{ra.assessmentType.replace(/_/g, ' ')}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{ra.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Conducted: <strong>{formatDate(ra.conductedDate)}</strong>
              {ra.conductedBy && <> &middot; by <strong>{ra.conductedBy}</strong></>}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/risk-assessments/${ra.id}`} currentStatus={ra.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {ra.scope && (
            <Section title="Scope">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ra.scope}</p>
            </Section>
          )}

          {ra.summary && (
            <Section title="Executive Summary">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ra.summary}</p>
            </Section>
          )}

          {/* Risk Items Table */}
          {ra.items.length > 0 && (
            <Section title={`Risk Register (${ra.items.length} items)`}>
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-xs min-w-[640px]">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-slate-100">
                      <th className="pb-2 pr-2">Risk</th>
                      <th className="pb-2 pr-2">Category</th>
                      <th className="pb-2 pr-2 text-center">L</th>
                      <th className="pb-2 pr-2 text-center">S</th>
                      <th className="pb-2 pr-2 text-center">Score</th>
                      <th className="pb-2 pr-2">Level</th>
                      <th className="pb-2 pr-2">Assigned To</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ra.items.map((item) => (
                      <tr key={item.id} className="text-slate-700 hover:bg-slate-50">
                        <td className="py-2 pr-2 max-w-[200px]">
                          <p className="truncate" title={item.riskDescription}>{item.riskDescription}</p>
                          {item.currentControls && <p className="text-xs text-slate-400 truncate">Controls: {item.currentControls}</p>}
                        </td>
                        <td className="py-2 pr-2 text-slate-500">{(item.category ?? '').replace(/_/g, ' ')}</td>
                        <td className="py-2 pr-2 text-center font-medium">{item.likelihood}</td>
                        <td className="py-2 pr-2 text-center font-medium">{item.severity}</td>
                        <td className="py-2 pr-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${RISK_SCORE_COLOR(item.riskScore)}`}>{item.riskScore}</span>
                        </td>
                        <td className="py-2 pr-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${RISK_LEVEL_COLORS[item.riskLevel]}`}>
                            {item.riskLevel}
                          </span>
                        </td>
                        <td className="py-2 pr-2 text-slate-500">{item.assignedTo ?? 'ΓÇö'}</td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs ${ITEM_STATUS_COLOR[item.status]}`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-3">L = Likelihood (1ΓÇô5) &middot; S = Severity (1ΓÇô5) &middot; Score = L &times; S</p>
            </Section>
          )}

          {ra.notes && (
            <Section title="Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ra.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Assessment Details">
            <dl className="space-y-2">
              <Row label="Type" value={ra.assessmentType.replace(/_/g, ' ')} />
              <Row label="Conducted Date" value={formatDate(ra.conductedDate)} />
              {ra.conductedBy && <Row label="Conducted By" value={ra.conductedBy} />}
              {ra.reviewedBy && <Row label="Reviewed By" value={ra.reviewedBy} />}
              {ra.approvedBy && <Row label="Approved By" value={ra.approvedBy} />}
              {ra.nextReviewDate && <Row label="Next Review" value={formatDate(ra.nextReviewDate)} />}
              {ra.standardRef && <Row label="Standard Ref" value={ra.standardRef} />}
            </dl>
          </Section>

          {ra.overallRiskLevel && (
            <div className={`rounded-xl p-4 text-center ${RISK_LEVEL_COLORS[ra.overallRiskLevel]}`}>
              <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Overall Risk Level</p>
              <p className="text-2xl font-bold mt-1">{ra.overallRiskLevel}</p>
            </div>
          )}

          {ra.items.length > 0 && (
            <Section title="Risk Summary">
              <dl className="space-y-2">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(level => {
                  const count = ra.items.filter(i => i.riskLevel === level).length;
                  return count > 0 ? <Row key={level} label={level} value={`${count} item${count !== 1 ? 's' : ''}`} highlight={level === 'CRITICAL' && count > 0} /> : null;
                })}
              </dl>
            </Section>
          )}

          {regulatoryBodies && regulatoryBodies.length > 0 && (
            <Section title="Regulatory Bodies">
              <div className="flex flex-wrap gap-1.5">
                {regulatoryBodies.map((b, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">{b.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </Section>
          )}

          {ra.documentUrl && (
            <Section title="Document">
              <a href={ra.documentUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 transition">
                <ExternalLink className="w-4 h-4" />
                View Document
              </a>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
      <dd className={`text-xs font-medium text-right ${highlight ? 'text-red-600 font-bold' : 'text-slate-800'}`}>{value}</dd>
    </div>
  );
}