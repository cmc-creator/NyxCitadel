import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  ShieldAlert, ArrowLeft, Calendar, User, AlertTriangle,
  CheckCircle2, ClipboardCheck, FileText, ExternalLink,
} from 'lucide-react';
import { isPast, isWithinInterval, addDays } from 'date-fns';

export const metadata = { title: 'Risk Assessment Detail' };

const TYPE_LABELS: Record<string, string> = {
  ANNUAL_PROACTIVE:     'Annual Proactive (LD.04.04.01)',
  INFECTION_CONTROL:    'Infection Control (ICRA)',
  SECURITY:             'Security Risk Assessment',
  MEDICATION:           'Medication Management',
  CLINICAL_PROCESS:     'Clinical Process (FMEA)',
  EMERGENCY_MANAGEMENT: 'Emergency Management',
  IT_SECURITY:          'IT / HIPAA Security',
  ENVIRONMENT_OF_CARE:  'Environment of Care',
  CONSTRUCTION:         'Construction ICRA',
  OTHER:                'Other',
};

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH:     'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW:      'bg-green-100 text-green-700 border-green-200',
};

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED:   'bg-green-50 text-green-700',
  REVIEWED:    'bg-purple-50 text-purple-700',
  APPROVED:    'bg-emerald-50 text-emerald-700',
  ARCHIVED:    'bg-slate-100 text-slate-500',
};

const ITEM_STATUS_COLORS: Record<string, string> = {
  OPEN:        'bg-red-50 text-red-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  RESOLVED:    'bg-green-50 text-green-700',
  ACCEPTED:    'bg-slate-100 text-slate-500',
  MONITORING:  'bg-purple-50 text-purple-700',
};

export default async function RiskAssessmentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const a = await prisma.riskAssessment.findFirst({
    where: { id: params.id, facilityId },
    include: { items: { orderBy: { riskScore: 'desc' } } },
  });
  if (!a) notFound();

  const now = new Date();
  const reviewOverdue = a.nextReviewDate && !['ARCHIVED'].includes(a.status) && isPast(a.nextReviewDate);
  const reviewSoon = a.nextReviewDate && !reviewOverdue && isWithinInterval(a.nextReviewDate, { start: now, end: addDays(now, 30) });

  const criticalItems = a.items.filter(i => i.riskLevel === 'CRITICAL' && (i.status === 'OPEN' || i.status === 'IN_PROGRESS'));
  const highItems     = a.items.filter(i => i.riskLevel === 'HIGH'     && (i.status === 'OPEN' || i.status === 'IN_PROGRESS'));

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div>
        <Link href="/trackers/risk-assessments" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Risk Assessments
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <ShieldAlert className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-slate-900">{a.title}</h1>
            {a.overallRiskLevel && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${LEVEL_COLORS[a.overallRiskLevel] ?? ''}`}>
                {a.overallRiskLevel} RISK
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {a.status.replace(/_/g, ' ')}
            </span>
          </div>
          {a.documentUrl && (
            <a href={a.documentUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              <ExternalLink className="w-3.5 h-3.5" /> View Document
            </a>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1 ml-9">
          {TYPE_LABELS[a.assessmentType] ?? a.assessmentType}
          {a.scope && ` · ${a.scope}`}
        </p>
      </div>

      {/* Alerts */}
      {reviewOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">Review overdue — was due {formatDate(a.nextReviewDate!)}.</p>
        </div>
      )}
      {reviewSoon && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">Review due soon — {formatDate(a.nextReviewDate!)}.</p>
        </div>
      )}
      {criticalItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {criticalItems.length} critical-risk item{criticalItems.length > 1 ? 's' : ''} require immediate action.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: info */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Assessment Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Conducted</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{a.conductedDate ? formatDate(a.conductedDate) : '—'}</dd>
              </div>
              {a.conductedBy && (
                <div>
                  <dt className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> Conducted By</dt>
                  <dd className="text-slate-800 mt-0.5">{a.conductedBy}</dd>
                </div>
              )}
              {a.reviewedBy && (
                <div>
                  <dt className="text-xs text-slate-500">Reviewed By</dt>
                  <dd className="text-slate-800 mt-0.5">{a.reviewedBy}</dd>
                </div>
              )}
              {a.approvedBy && (
                <div>
                  <dt className="text-xs text-slate-500">Approved By</dt>
                  <dd className="text-slate-800 mt-0.5">{a.approvedBy}</dd>
                </div>
              )}
              {a.nextReviewDate && (
                <div>
                  <dt className="text-xs text-slate-500">Next Review</dt>
                  <dd className={`font-medium mt-0.5 ${reviewOverdue ? 'text-red-600' : reviewSoon ? 'text-amber-600' : 'text-slate-800'}`}>
                    {formatDate(a.nextReviewDate)}
                  </dd>
                </div>
              )}
              {a.regulatoryBody && (
                <div>
                  <dt className="text-xs text-slate-500">Regulatory Body</dt>
                  <dd className="text-slate-700 text-xs bg-blue-50 border border-blue-100 px-2 py-0.5 rounded inline-block mt-0.5">
                    {a.regulatoryBody.replace(/_/g, ' ')}
                  </dd>
                </div>
              )}
              {a.standardRef && (
                <div>
                  <dt className="text-xs text-slate-500">Standard</dt>
                  <dd className="text-slate-700 font-mono text-xs mt-0.5">{a.standardRef}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Risk Summary */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Risk Summary</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(level => {
                const count = a.items.filter(i => i.riskLevel === level).length;
                return (
                  <div key={level} className={`rounded-lg border p-2 text-center ${LEVEL_COLORS[level]}`}>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs font-medium">{level}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: summary + items */}
        <div className="lg:col-span-2 space-y-5">
          {a.summary && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-slate-400" /> Summary
              </h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.summary}</p>
            </div>
          )}

          {a.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Notes</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{a.notes}</p>
            </div>
          )}

          {/* Risk Items Table */}
          {a.items.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700">Risk Items ({a.items.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Risk</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Category</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600">L</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600">S</th>
                      <th className="text-center px-3 py-3 text-xs font-semibold text-slate-600">Score</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Level</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Assigned</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {a.items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-800 max-w-xs">{item.riskDescription}</p>
                          {item.currentControls && (
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">Controls: {item.currentControls}</p>
                          )}
                          {item.recommendedActions && (
                            <p className="text-xs text-blue-500 mt-0.5 line-clamp-1">→ {item.recommendedActions}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{item.category ?? '—'}</td>
                        <td className="px-3 py-3 text-center text-xs font-mono font-semibold text-slate-700">{item.likelihood}</td>
                        <td className="px-3 py-3 text-center text-xs font-mono font-semibold text-slate-700">{item.severity}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LEVEL_COLORS[item.riskLevel] ?? ''}`}>
                            {item.riskScore}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${LEVEL_COLORS[item.riskLevel] ?? ''}`}>
                            {item.riskLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          <div>{item.assignedTo ?? '—'}</div>
                          {item.targetDate && (
                            <div className={`text-xs ${isPast(item.targetDate) && (item.status === 'OPEN' || item.status === 'IN_PROGRESS') ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                              {formatDate(item.targetDate)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ITEM_STATUS_COLORS[item.status] ?? 'bg-slate-100 text-slate-600'}`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
