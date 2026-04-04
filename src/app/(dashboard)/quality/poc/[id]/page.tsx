import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardCheck,
  ChevronLeft,
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Pencil,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `POC ${params.id.slice(0, 8).toUpperCase()}` };
}

const POC_STATUS_STYLES: Record<string, string> = {
  DRAFT:             'bg-slate-100 text-foreground/80',
  UNDER_REVIEW:      'bg-yellow-100 text-yellow-800',
  SUBMITTED:         'bg-blue-100 text-blue-800',
  ACCEPTED:          'bg-emerald-100 text-emerald-800',
  REJECTED:          'bg-red-100 text-red-800',
  RESUBMIT_REQUIRED: 'bg-orange-100 text-orange-800',
  CLOSED:            'bg-slate-100 text-slate-500',
};

const FINDING_STATUS_STYLES: Record<string, { badge: string; icon: React.ReactNode }> = {
  OPEN:        { badge: 'bg-red-100 text-red-700',     icon: <Circle className="w-3.5 h-3.5 text-red-500" /> },
  IN_PROGRESS: { badge: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3.5 h-3.5 text-yellow-500" /> },
  COMPLETED:   { badge: 'bg-blue-100 text-blue-700',   icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> },
  VERIFIED:    { badge: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> },
};

export default async function PocDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const poc = await prisma.planOfCorrection.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
    include: { findings: { orderBy: { findingNumber: 'asc' } } },
  });
  if (!poc) notFound();

  const openFindings      = poc.findings.filter((f) => f.status === 'OPEN').length;
  const completedFindings = poc.findings.filter((f) => ['COMPLETED', 'VERIFIED'].includes(f.status)).length;
  const isOverdue = poc.responseDeadline &&
                    poc.status !== 'SUBMITTED' &&
                    poc.status !== 'ACCEPTED' &&
                    poc.status !== 'CLOSED' &&
                    new Date() > poc.responseDeadline;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/quality/poc" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600">
        <ChevronLeft className="w-4 h-4" /> Back to Plans of Correction
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-purple-600" />
            {poc.pocNumber}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{poc.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/quality/poc/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-foreground/80">
            {poc.regulatoryBody.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${POC_STATUS_STYLES[poc.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {poc.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {isOverdue && (
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <strong>Overdue:</strong> Response deadline was {formatDate(poc.responseDeadline!)}. Submit promptly to avoid further deficiencies.
          </p>
        </div>
      )}

      {/* Progress summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{poc.findings.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total Findings</p>
        </div>
        <div className="bg-red-950/20 rounded-xl border border-red-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{openFindings}</p>
          <p className="text-xs text-red-600 mt-0.5">Open</p>
        </div>
        <div className="bg-emerald-950/20 rounded-xl border border-emerald-200 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{completedFindings}</p>
          <p className="text-xs text-emerald-600 mt-0.5">Completed / Verified</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Meta */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground/70" /> Timeline
            </h2>
            <dl className="space-y-3">
              {poc.surveyDate && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Survey Date</dt>
                  <dd className="text-sm text-foreground">{formatDate(poc.surveyDate)}</dd>
                </div>
              )}
              {poc.responseDeadline && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Response Deadline</dt>
                  <dd className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-foreground'}`}>
                    {formatDate(poc.responseDeadline)}
                  </dd>
                </div>
              )}
              {poc.submittedDate && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Submitted</dt>
                  <dd className="text-sm text-emerald-700 font-medium">{formatDate(poc.submittedDate)}</dd>
                </div>
              )}
              {poc.submittedBy && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Submitted By</dt>
                  <dd className="text-sm text-foreground">{poc.submittedBy}</dd>
                </div>
              )}
              {poc.approvedBy && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Approved By</dt>
                  <dd className="text-sm text-foreground">{poc.approvedBy}</dd>
                </div>
              )}
            </dl>
          </div>

          {poc.notes && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Notes</h2>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{poc.notes}</p>
            </div>
          )}

          <Link
            href={`/quality/responses/new?templateId=&sourceType=POC&sourceId=${poc.id}&sourceRef=${poc.pocNumber}`}
            className="flex items-center justify-center gap-1.5 text-xs font-medium bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors"
          >
            + Generate POC Cover Letter
          </Link>
        </div>

        {/* Right: Findings */}
        <div className="lg:col-span-2 space-y-4">
          {poc.coverLetter && (
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Cover Letter</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{poc.coverLetter}</p>
            </div>
          )}

          <div className="bg-card rounded-xl border border-border">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-foreground">
                Survey Findings &amp; Corrections ({poc.findings.length})
              </h3>
            </div>
            {poc.findings.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground/70">No findings added yet.</div>
            ) : (
              <div className="divide-y divide-border/30">
                {poc.findings.map((finding) => {
                  const style = FINDING_STATUS_STYLES[finding.status] ?? FINDING_STATUS_STYLES.OPEN;
                  return (
                    <div key={finding.id} className="px-5 py-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-foreground">{finding.findingNumber}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{finding.findingDescription}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${style.badge}`}>
                          {style.icon} {finding.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Finding detail (expandable-ish) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                        {finding.howCorrected && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">How Corrected</p>
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap">{finding.howCorrected}</p>
                          </div>
                        )}
                        {finding.howPrevented && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">How Prevented</p>
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap">{finding.howPrevented}</p>
                          </div>
                        )}
                        {finding.howMonitored && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Monitoring Plan</p>
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap">{finding.howMonitored}</p>
                          </div>
                        )}
                        {finding.evidenceOfCorrection && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Evidence</p>
                            <p className="text-xs text-foreground/80 whitespace-pre-wrap">{finding.evidenceOfCorrection}</p>
                          </div>
                        )}
                      </div>
                      {(finding.responsibleParty || finding.targetDate || finding.completedDate) && (
                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 pl-2">
                          {finding.responsibleParty && <span>Responsible: <strong className="text-foreground/80">{finding.responsibleParty}</strong></span>}
                          {finding.targetDate && <span>Target: <strong className="text-foreground/80">{formatDate(finding.targetDate)}</strong></span>}
                          {finding.completedDate && (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Completed {formatDate(finding.completedDate)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {poc.certificationStatement && (
            <div className="bg-slate-50 rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Certification Statement</h3>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed italic">{poc.certificationStatement}</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl border border-border px-5 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Created {formatDate(poc.createdAt)}</span>
            <span>Last updated {formatDate(poc.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
