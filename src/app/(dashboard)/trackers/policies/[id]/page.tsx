import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { FileText, ArrowLeft, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isPast, differenceInCalendarDays } from 'date-fns';

export const metadata = { title: 'Policy & Procedure' };

const STATUS_COLOR: Record<string, string> = {
  DRAFT:          'bg-slate-100 text-slate-600',
  UNDER_REVIEW:   'bg-yellow-100 text-yellow-700',
  ACTIVE:         'bg-green-100 text-green-700',
  ARCHIVED:       'bg-gray-100 text-gray-500',
  OVERDUE_REVIEW: 'bg-red-100 text-red-700',
};

const CAT_COLOR: Record<string, string> = {
  ADMINISTRATIVE:       'bg-slate-100 text-slate-700',
  CLINICAL:             'bg-blue-100 text-blue-700',
  EMERGENCY_MANAGEMENT: 'bg-orange-100 text-orange-700',
  ENVIRONMENT_OF_CARE:  'bg-teal-100 text-teal-700',
  HUMAN_RESOURCES:      'bg-purple-100 text-purple-700',
  INFECTION_CONTROL:    'bg-red-100 text-red-700',
  MEDICATION_MANAGEMENT:'bg-yellow-100 text-yellow-700',
  PATIENT_RIGHTS:       'bg-indigo-100 text-indigo-700',
  LIFE_SAFETY:          'bg-red-100 text-red-800',
};

export default async function PolicyDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const policy = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
  });
  if (!policy) notFound();

  const reviewOverdue = isPast(policy.nextReviewDate) && !['ARCHIVED'].includes(policy.status);
  const daysUntilReview = differenceInCalendarDays(policy.nextReviewDate, new Date());

  const revisionHistory = Array.isArray(policy.revisionHistory)
    ? (policy.revisionHistory as Array<{ version: string; date: string; changedBy?: string; summary?: string }>)
    : [];

  const regulatoryBodies = Array.isArray(policy.regulatoryBody)
    ? (policy.regulatoryBody as string[])
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/trackers/policies" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Policy Tracker
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500">{policy.policyNumber}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLOR[policy.status] ?? 'bg-slate-100'}`}>
            {policy.status.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${CAT_COLOR[policy.category] ?? 'bg-slate-100 text-slate-600'}`}>
            {policy.category.replace(/_/g, ' ')}
          </span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">v{policy.version}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          {policy.title}
        </h1>
        {policy.owner && <p className="text-sm text-slate-500 mt-0.5">Owner: {policy.owner}</p>}
      </div>

      {/* Review overdue alert */}
      {reviewOverdue && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>This policy is <strong>overdue for review</strong> — next review was due {formatDate(policy.nextReviewDate)}.</span>
        </div>
      )}
      {!reviewOverdue && daysUntilReview >= 0 && daysUntilReview <= 30 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Review due in <strong>{daysUntilReview} days</strong> — {formatDate(policy.nextReviewDate)}.</span>
        </div>
      )}

      {/* Key Info */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Policy Information</h2>
        </div>
        <div className="px-5 py-4">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div><dt className="text-xs text-slate-400">Effective Date</dt><dd className="text-slate-800 font-medium">{formatDate(policy.effectiveDate)}</dd></div>
            <div>
              <dt className="text-xs text-slate-400">Next Review</dt>
              <dd className={`font-medium ${reviewOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                {formatDate(policy.nextReviewDate)}
              </dd>
            </div>
            {policy.lastReviewedDate && (
              <div>
                <dt className="text-xs text-slate-400">Last Reviewed</dt>
                <dd className="text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {formatDate(policy.lastReviewedDate)}
                </dd>
              </div>
            )}
            <div><dt className="text-xs text-slate-400">Review Frequency</dt><dd className="text-slate-800">{policy.reviewFrequency.replace(/_/g, ' ')}</dd></div>
            {policy.standardRef && <div className="col-span-2"><dt className="text-xs text-slate-400">Standard / Reference</dt><dd className="text-slate-800 font-mono text-xs">{policy.standardRef}</dd></div>}
          </dl>
          {regulatoryBodies.length > 0 && (
            <div className="mt-3">
              <dt className="text-xs text-slate-400 mb-1.5">Regulatory Bodies</dt>
              <div className="flex flex-wrap gap-1.5">
                {regulatoryBodies.map(b => (
                  <span key={b} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">{b.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}
          {policy.documentUrl && (
            <div className="mt-3">
              <a href={policy.documentUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline">
                <FileText className="w-3.5 h-3.5" /> View Document
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {policy.summary && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Summary</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{policy.summary}</p>
        </div>
      )}

      {/* Revision History */}
      {revisionHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revision History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-2 text-left text-xs font-medium text-slate-500">Version</th>
                <th className="px-5 py-2 text-left text-xs font-medium text-slate-500">Date</th>
                <th className="px-5 py-2 text-left text-xs font-medium text-slate-500">Changed By</th>
                <th className="px-5 py-2 text-left text-xs font-medium text-slate-500">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {revisionHistory.map((rev, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">{rev.version}</td>
                  <td className="px-5 py-3 text-slate-600">{rev.date ? formatDate(new Date(rev.date)) : '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{rev.changedBy ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{rev.summary ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
