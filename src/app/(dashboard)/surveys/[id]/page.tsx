import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ClipboardList, ArrowLeft, AlertTriangle, CheckCircle2, Clock, ShieldCheck, Pencil } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DeleteButton } from '@/components/ui/DeleteButton';
import AttachmentPanel from '@/components/ui/AttachmentPanel';
import AttachmentComposer from '@/components/ui/AttachmentComposer';
import { SurveyFindingsPanel } from '@/components/surveys/SurveyFindingsPanel';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Survey & Inspection' };

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:          'bg-blue-100 text-blue-700',
  IN_PROGRESS:        'bg-yellow-100 text-yellow-700',
  COMPLETED:          'bg-green-100 text-green-700',
  RESPONSE_DUE:       'bg-orange-100 text-orange-700',
  RESPONSE_SUBMITTED: 'bg-purple-100 text-purple-700',
  CLOSED:             'bg-muted/30 text-muted-foreground',
};

const SURVEY_TYPE_LABELS: Record<string, string> = {
  ACCREDITATION:   'Accreditation Survey',
  VALIDATION:      'Validation Survey',
  COMPLAINT:       'Complaint Investigation',
  LICENSURE:       'Licensure Survey',
  CERTIFICATION:   'Certification Survey',
  FOLLOW_UP:       'Follow-Up Survey',
  SELF_ASSESSMENT: 'Self-Assessment',
  MOCK:            'Mock Survey',
};

export default async function SurveyDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const [survey, attachments] = await Promise.all([
    prisma.survey.findFirst({
      where: { id: params.id, facilityId: session!.user.facilityId },
      include: {
        cap: { select: { id: true, capNumber: true, title: true, status: true } },
        plansOfCorrection: {
          select: { id: true, status: true, createdAt: true, findings: { select: { status: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.attachment.findMany({
      where: {
        facilityId: session!.user.facilityId,
        sourceType: 'SURVEY',
        sourceId: params.id,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  if (!survey) notFound();

  const now = new Date();
  const responseOverdue = survey.responseDeadline && survey.responseDeadline < now && !survey.responseSubmitted;
  const daysLeft = survey.responseDeadline
    ? Math.ceil((survey.responseDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
        <Link href="/surveys" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Surveys &amp; Inspections
        </Link>
        <Link href={`/surveys/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </Link>
        <DeleteButton apiPath={`/api/surveys/${params.id}`} redirectPath="/surveys" label="survey record" />
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLOR[survey.status] ?? 'bg-muted/30'}`}>
            {survey.status.replace(/_/g, ' ')}
          </span>
          <span className="text-xs bg-muted/30 text-muted-foreground px-2 py-0.5 rounded">
            {survey.regulatoryBody.replace(/_/g, ' ')}
          </span>
          {survey.immediateJeopardy && (
            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">⚠ Immediate Jeopardy</span>
          )}
          {survey.conditionLevel && (
            <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded border border-orange-200">Condition-Level</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-purple-600" />
          {SURVEY_TYPE_LABELS[survey.surveyType] ?? survey.surveyType.replace(/_/g, ' ')}
        </h1>
        {survey.conductedDate && (
          <p className="text-sm text-muted-foreground mt-0.5">Conducted {formatDate(survey.conductedDate)}{survey.surveyorNames ? ` · ${survey.surveyorNames}` : ''}</p>
        )}
      </div>

      {/* Response alerts */}
      {responseOverdue && (
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span><strong>Response overdue</strong> — deadline was {formatDate(survey.responseDeadline!)}.</span>
        </div>
      )}
      {!responseOverdue && daysLeft !== null && daysLeft >= 0 && daysLeft <= 7 && !survey.responseSubmitted && (
        <div className="flex items-center gap-2 bg-amber-950/20 border border-amber-200 text-amber-700 rounded-lg px-4 py-3 text-sm">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Response due in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong> — {formatDate(survey.responseDeadline!)}.</span>
        </div>
      )}
      {survey.responseSubmitted && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Response submitted {formatDate(survey.responseSubmitted)}.</span>
        </div>
      )}

      {/* Survey Details */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border/30">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Survey Details</h2>
        </div>
        <dl className="px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><dt className="text-xs text-muted-foreground/70">Survey Type</dt><dd className="text-foreground font-medium">{SURVEY_TYPE_LABELS[survey.surveyType] ?? survey.surveyType}</dd></div>
          <div><dt className="text-xs text-muted-foreground/70">Regulatory Body</dt><dd className="text-foreground">{survey.regulatoryBody.replace(/_/g, ' ')}</dd></div>
          {survey.conductedDate && <div><dt className="text-xs text-muted-foreground/70">Date Conducted</dt><dd className="text-foreground">{formatDate(survey.conductedDate)}</dd></div>}
          {survey.surveyorNames && <div><dt className="text-xs text-muted-foreground/70">Surveyors</dt><dd className="text-foreground">{survey.surveyorNames}</dd></div>}
          {survey.findingCount != null && <div><dt className="text-xs text-muted-foreground/70">Findings</dt><dd className={`font-semibold ${survey.findingCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>{survey.findingCount}</dd></div>}
          {survey.responseDeadline && (
            <div>
              <dt className="text-xs text-muted-foreground/70">Response Deadline</dt>
              <dd className={responseOverdue ? 'text-red-600 font-medium' : 'text-foreground'}>{formatDate(survey.responseDeadline)}</dd>
            </div>
          )}
          {survey.outcome && <div className="col-span-2"><dt className="text-xs text-muted-foreground/70">Outcome</dt><dd className="text-foreground">{survey.outcome}</dd></div>}
          {survey.satisfactionScore != null && <div><dt className="text-xs text-muted-foreground/70">Patient Satisfaction</dt><dd className="text-foreground font-semibold">{survey.satisfactionScore}%</dd></div>}
        </dl>
        {survey.reportUrl && (
          <div className="px-5 pb-4">
            <a href={survey.reportUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline">
              <ShieldCheck className="w-3.5 h-3.5" /> View Survey Report
            </a>
          </div>
        )}
      </div>

      {/* Survey Findings */}
      <SurveyFindingsPanel surveyId={params.id} />

      {/* Linked CAP */}
      {survey.cap && (
        <div className="bg-card rounded-xl border border-border px-5 py-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Linked Corrective Action Plan</h2>
          <Link href={`/trackers/caps/${survey.cap.id}`}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:border-purple-300 transition-colors group">
            <div>
              <span className="text-xs font-mono text-muted-foreground mr-2">{survey.cap.capNumber}</span>
              <span className="text-sm font-medium text-foreground group-hover:text-purple-700">{survey.cap.title}</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${ ({OPEN:'bg-blue-100 text-blue-700',IN_PROGRESS:'bg-yellow-100 text-yellow-700',COMPLETED:'bg-green-100 text-green-700',VERIFIED:'bg-teal-100 text-teal-700',OVERDUE:'bg-red-100 text-red-700',EXTENDED:'bg-purple-100 text-purple-700'} as Record<string,string>)[survey.cap.status] ?? 'bg-muted/30 text-muted-foreground'}`}>
              {survey.cap.status.replace(/_/g, ' ')}
            </span>
          </Link>
        </div>
      )}

      {/* Plans of Correction */}
      {survey.plansOfCorrection.length > 0 && (
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border/30">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plans of Correction</h2>
          </div>
          <div className="divide-y divide-border/30">
            {survey.plansOfCorrection.map(poc => (
              <Link key={poc.id} href={`/quality/poc/${poc.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors group">
                <div className="text-sm">
                  <span className="text-foreground/80 group-hover:text-purple-700">Plan of Correction</span>
                  <span className="ml-2 text-xs text-muted-foreground/70">created {formatDate(poc.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {poc.findings.length > 0 && (
                    <span>{poc.findings.filter(f => f.status === 'OPEN').length} open / {poc.findings.length} total findings</span>
                  )}
                  <span className="text-xs text-purple-600 group-hover:underline">View →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {survey.notes && (
        <div className="bg-card rounded-xl border border-border px-5 py-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h2>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{survey.notes}</p>
        </div>
      )}

      <AttachmentPanel
        title="Survey Evidence & Response Materials"
        attachments={attachments}
        emptyLabel="No survey reports, findings packets, response drafts, or evidence files have been attached yet."
      />

      <AttachmentComposer
        sourceType="SURVEY"
        sourceId={survey.id}
        sourceLabel={SURVEY_TYPE_LABELS[survey.surveyType] ?? survey.surveyType.replace(/_/g, ' ')}
        title="Add Survey Evidence"
      />

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        {!survey.cap && !['CLOSED'].includes(survey.status) && (
          <Link href={`/trackers/caps/new?source=SURVEY_FINDING`} className="btn-primary text-sm">
            Create CAP from Survey
          </Link>
        )}
        {survey.plansOfCorrection.length === 0 && survey.findingCount && survey.findingCount > 0 && (
          <Link href="/quality/poc/new" className="btn-secondary text-sm">
            Start Plan of Correction
          </Link>
        )}
      </div>
    </div>
  );
}
