import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, BookOpen, AlertTriangle, ExternalLink , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-slate-100 text-slate-600' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'ACTIVE', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'ARCHIVED', label: 'Archived', color: 'bg-slate-100 text-slate-400' },
  { value: 'OVERDUE_REVIEW', label: 'Overdue Review', color: 'bg-red-100 text-red-700' },
];

interface RevisionEntry { version: string; date: string; changedBy: string; summary: string }

export default async function PolicyDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const policy = await prisma.policy.findUnique({ where: { id: params.id } });
  if (!policy || policy.facilityId !== session.user.facilityId) notFound();

  const now = new Date();
  const reviewOverdue = policy.nextReviewDate && policy.nextReviewDate < now && policy.status !== 'ARCHIVED';
  const daysToReview = policy.nextReviewDate ? Math.ceil((policy.nextReviewDate.getTime() - now.getTime()) / 86400000) : null;
  const revisions = policy.revisionHistory as RevisionEntry[] | null;
  const regulatoryBodies = policy.regulatoryBody as string[] | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/policies" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Policies
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/trackers/policies/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-mono text-slate-400">{policy.policyNumber}</span>
              <span className="text-xs text-slate-400">v{policy.version}</span>
              {policy.category && (
                <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5">{policy.category.replace(/_/g, ' ')}</span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{policy.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Effective: <strong>{formatDate(policy.effectiveDate)}</strong>
              {policy.owner && <> &middot; Owner: <strong>{policy.owner}</strong></>}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/policy-docs/${policy.id}`} currentStatus={policy.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {reviewOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            <strong>Review Overdue</strong> &mdash; this policy was due for review on {formatDate(policy.nextReviewDate!)}. {Math.abs(daysToReview!)} days overdue.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          {policy.summary && (
            <Section title="Summary">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{policy.summary}</p>
            </Section>
          )}

          {policy.documentUrl && (
            <Section title="Policy Document">
              <a href={policy.documentUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 transition">
                <ExternalLink className="w-4 h-4" />
                View / Download Policy Document
              </a>
            </Section>
          )}

          {revisions && revisions.length > 0 && (
            <Section title="Revision History">
              <div className="space-y-3">
                {[...revisions].reverse().map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                      {i < revisions.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">v{r.version}</span>
                        <span className="text-xs text-slate-400">{r.date}</span>
                        <span className="text-xs text-slate-500">&mdash; {r.changedBy}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{r.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Policy Details">
            <dl className="space-y-2">
              <Row label="Policy #" value={policy.policyNumber} />
              <Row label="Version" value={`v${policy.version}`} />
              <Row label="Effective Date" value={formatDate(policy.effectiveDate)} />
              {policy.lastReviewedDate && <Row label="Last Reviewed" value={formatDate(policy.lastReviewedDate)} />}
              {policy.nextReviewDate && (
                <Row label="Next Review" value={formatDate(policy.nextReviewDate)}
                  highlight={!!reviewOverdue} />
              )}
              {policy.reviewFrequency && <Row label="Review Frequency" value={policy.reviewFrequency.replace(/_/g, ' ')} />}
              {policy.owner && <Row label="Owner" value={policy.owner} />}
              {policy.standardRef && <Row label="Standard Ref" value={policy.standardRef} />}
            </dl>
          </Section>

          {regulatoryBodies && regulatoryBodies.length > 0 && (
            <Section title="Regulatory Bodies">
              <div className="flex flex-wrap gap-1.5">
                {regulatoryBodies.map((b, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">{b.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </Section>
          )}

          {daysToReview !== null && !reviewOverdue && (
            <Section title="Review Countdown">
              <p className="text-2xl font-bold text-slate-800 text-center">{daysToReview}</p>
              <p className="text-xs text-slate-400 text-center mt-0.5">days until next review</p>
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
