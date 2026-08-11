import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ClipboardCheck, AlertTriangle, Clock , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';
import AttachmentPanel from '@/components/ui/AttachmentPanel';
import AttachmentComposer from '@/components/ui/AttachmentComposer';
import { QocAiResponseGenerator } from '@/components/trackers/QocAiResponseGenerator';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-700' },
  { value: 'LOI_RECEIVED', label: 'LOI Received', color: 'bg-orange-100 text-orange-700' },
  { value: 'RESPONSE_SUBMITTED', label: 'Response Submitted', color: 'bg-teal-100 text-teal-700' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'FINDINGS_ISSUED', label: 'Findings Issued', color: 'bg-purple-100 text-purple-700' },
  { value: 'SUBSTANTIATED', label: 'Substantiated', color: 'bg-red-100 text-red-700' },
  { value: 'UNSUBSTANTIATED', label: 'Unsubstantiated', color: 'bg-green-100 text-green-700' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-muted/30 text-muted-foreground' },
];

interface Citation { tag: string; description?: string; poC?: string }

export default async function QocDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const [qoc, attachments] = await Promise.all([
    prisma.qocComplaint.findUnique({ where: { id: params.id } }),
    prisma.attachment.findMany({
      where: {
        facilityId: session.user.facilityId,
        sourceType: 'QUALITY_OF_CARE_LOI',
        sourceId: params.id,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!qoc || qoc.facilityId !== session.user.facilityId) notFound();

  const now = new Date();
  const responseOverdue = qoc.responseDueDate && !qoc.responseSubmittedDate && qoc.responseDueDate < now;
  function daysLeft(d: Date) { return Math.ceil((d.getTime() - now.getTime()) / 86400000); }

  const citations = qoc.citationsIssued as Citation[] | null;
  const allegations = qoc.allegationCategories as string[] | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/qoc" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-4 h-4" /> Back to QoC Complaints
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/trackers/qoc/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted/30 hover:bg-slate-200 text-foreground/80 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ClipboardCheck className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-mono text-muted-foreground/70">{qoc.qocNumber}</span>
              {qoc.cmsComplaintNumber && <span className="text-xs text-muted-foreground">CMS: {qoc.cmsComplaintNumber}</span>}
              <span className="text-xs bg-muted/30 text-muted-foreground rounded-full px-2.5 py-0.5">
                {qoc.complainantType.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground line-clamp-2">{qoc.allegationSummary}</h1>
            <p className="text-sm text-muted-foreground mt-1">Received: <strong>{formatDate(qoc.dateReceived)}</strong></p>
          </div>
          <StatusUpdater apiPath={`/api/qoc-complaints/${qoc.id}`} currentStatus={qoc.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {qoc.investigationType === 'IMMEDIATE_JEOPARDY' && (
        <div className="bg-red-950/20 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Immediate Jeopardy Investigation</strong> - this complaint has been classified as an Immediate Jeopardy matter.</p>
        </div>
      )}

      {qoc.loiReceivedDate && qoc.responseDueDate && (
        <div className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${responseOverdue ? 'bg-red-950/20 border-red-200' : qoc.responseSubmittedDate ? 'bg-green-50 border-green-200' : 'bg-orange-950/20 border-orange-200'}`}>
          <div>
            <p className="text-sm font-semibold text-foreground">LOI Response Deadline</p>
            <p className="text-xs text-muted-foreground mt-0.5">LOI received {formatDate(qoc.loiReceivedDate)} &middot; 10 business days to respond</p>
          </div>
          {qoc.responseSubmittedDate ? (
            <span className="text-xs bg-green-100 text-green-700 rounded-full px-2.5 py-1 font-medium whitespace-nowrap">Submitted {formatDate(qoc.responseSubmittedDate)}</span>
          ) : (
            <span className={`inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1 font-medium whitespace-nowrap ${responseOverdue ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
              <Clock className="w-3 h-3" />
              {responseOverdue ? `OVERDUE ${Math.abs(daysLeft(qoc.responseDueDate))}d` : `Due ${formatDate(qoc.responseDueDate)}`}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Allegation Summary">
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">{qoc.allegationSummary}</p>
            {allegations && allegations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {allegations.map((a, i) => (
                  <span key={i} className="text-xs bg-orange-950/20 text-orange-700 rounded px-2 py-0.5">{a}</span>
                ))}
              </div>
            )}
          </Section>

          {qoc.findingsSummary && (
            <Section title="Findings Summary">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{qoc.findingsSummary}</p>
              {qoc.deficienciesFound !== null && (
                <p className="mt-2 text-xs text-muted-foreground">Deficiencies found: <strong className={qoc.deficienciesFound ? 'text-red-600' : 'text-green-600'}>{qoc.deficienciesFound ? 'Yes' : 'No'}</strong></p>
              )}
            </Section>
          )}

          {citations && citations.length > 0 && (
            <Section title="Citations Issued">
              <div className="space-y-2">
                {citations.map((c, i) => (
                  <div key={i} className="rounded-lg bg-red-950/20 border border-red-100 p-3">
                    <p className="text-xs font-bold text-red-700">{c.tag}</p>
                    {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                    {c.poC && <p className="text-xs text-muted-foreground mt-1">PoC: {c.poC}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {qoc.notes && (
            <Section title="Notes">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{qoc.notes}</p>
            </Section>
          )}

          <QocAiResponseGenerator
            qocId={qoc.id}
            qocNumber={qoc.qocNumber}
            allegationSummary={qoc.allegationSummary}
            findingsSummary={qoc.findingsSummary ?? undefined}
          />

          <AttachmentPanel
            title="Investigation Documentation"
            attachments={attachments}
            emptyLabel="No investigation documents or evidence have been attached yet."
          />

          <AttachmentComposer
            sourceType="QUALITY_OF_CARE_LOI"
            sourceId={qoc.id}
            sourceLabel={qoc.qocNumber}
            title="Add Investigation Documents"
          />
        </div>

        <div className="space-y-5">
          <Section title="Complaint Details">
            <dl className="space-y-2">
              <Row label="QoC #" value={qoc.qocNumber} />
              {qoc.cmsComplaintNumber && <Row label="CMS #" value={qoc.cmsComplaintNumber} />}
              {qoc.stateReferenceNumber && <Row label="State Ref #" value={qoc.stateReferenceNumber} />}
              <Row label="Complainant Type" value={qoc.complainantType.replace(/_/g, ' ')} />
              <Row label="Date Received" value={formatDate(qoc.dateReceived)} />
              {qoc.investigationType && <Row label="Investigation Type" value={qoc.investigationType.replace(/_/g, ' ')} />}
              {qoc.investigatorName && <Row label="Investigator" value={qoc.investigatorName} />}
              {qoc.surveyDate && <Row label="Survey Date" value={formatDate(qoc.surveyDate)} />}
              {qoc.closedDate && <Row label="Closed Date" value={formatDate(qoc.closedDate)} />}
            </dl>
          </Section>

          {(qoc.linkedGrievanceId || qoc.linkedPocId || qoc.linkedRcaId) && (
            <Section title="Linked Records">
              {qoc.linkedGrievanceId && <Link href={`/trackers/grievances/${qoc.linkedGrievanceId}`} className="block text-xs text-purple-700 hover:underline mb-1">&#x2192; Linked Grievance</Link>}
              {qoc.linkedRcaId && <Link href={`/trackers/rca/${qoc.linkedRcaId}`} className="block text-xs text-purple-700 hover:underline">&#x2192; Linked RCA</Link>}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-xs text-muted-foreground shrink-0">{label}</dt>
      <dd className={`text-xs font-medium text-right ${highlight ? 'text-red-600 font-bold' : 'text-foreground'}`}>{value}</dd>
    </div>
  );
}
