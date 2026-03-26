import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, ClipboardList, AlertTriangle , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';
import AttachmentPanel from '@/components/ui/AttachmentPanel';
import AttachmentComposer from '@/components/ui/AttachmentComposer';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'VERIFIED', label: 'Verified', color: 'bg-teal-100 text-teal-800' },
  { value: 'OVERDUE', label: 'Overdue', color: 'bg-red-100 text-red-800' },
  { value: 'EXTENDED', label: 'Extended', color: 'bg-orange-100 text-orange-800' },
];

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-slate-100 text-slate-600',
};

export default async function CapDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const [cap, attachments] = await Promise.all([
    prisma.correctiveActionPlan.findUnique({
      where: { id: params.id },
      include: {
        assignee: { select: { name: true, email: true, title: true } },
        incidents: { select: { id: true, incidentNumber: true, incidentType: true, dateOccurred: true } },
      },
    }),
    prisma.attachment.findMany({
      where: {
        facilityId: session.user.facilityId,
        sourceType: 'CORRECTIVE_ACTION_PLAN',
        sourceId: params.id,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!cap || cap.facilityId !== session.user.facilityId) notFound();

  const isOverdue = new Date() > cap.targetDate && !['COMPLETED', 'VERIFIED'].includes(cap.status);
  const vigilanceActive = cap.vigilanceEndDate && new Date() <= cap.vigilanceEndDate;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/caps" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to CAPs
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/trackers/caps/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/caps/${params.id}`} redirectPath="/trackers/caps" label="CAP" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <ClipboardList className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-mono text-slate-400">{cap.capNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_COLOR[cap.priority]}`}>
                {cap.priority}
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">
                {cap.source.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{cap.title}</h1>
            {cap.sourceRef && <p className="text-xs text-slate-500 mt-0.5">Ref: {cap.sourceRef}</p>}
          </div>
          <StatusUpdater apiPath={`/api/caps/${cap.id}`} currentStatus={cap.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Overdue</strong> &mdash; target date was {formatDate(cap.targetDate)}.</p>
        </div>
      )}

      {vigilanceActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Vigilance Monitoring Active</strong> &mdash; ends {formatDate(cap.vigilanceEndDate!)}.
            Breaches: <strong>{cap.vigilanceBreaches ?? 0}</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Problem Description">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.description}</p>
          </Section>

          {cap.rootCause && (
            <Section title="Root Cause">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.rootCause}</p>
            </Section>
          )}

          <Section title="Correction Plan">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.correctionPlan}</p>
          </Section>

          {cap.measureOfSuccess && (
            <Section title="Measure of Success">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.measureOfSuccess}</p>
            </Section>
          )}

          {cap.isPdsa && (
            <Section title="PDSA Cycle">
              <div className="space-y-3">
                {cap.pdsaPlan && <PdsaBlock label="PLAN" color="blue" content={cap.pdsaPlan} />}
                {cap.pdsaDo && <PdsaBlock label="DO" content={cap.pdsaDo} color="purple" />}
                {cap.pdsaStudy && <PdsaBlock label="STUDY" content={cap.pdsaStudy} color="orange" />}
                {cap.pdsaAct && <PdsaBlock label="ACT" content={cap.pdsaAct} color="green" />}
              </div>
            </Section>
          )}

          {cap.followUpNotes && (
            <Section title="Follow-Up Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{cap.followUpNotes}</p>
            </Section>
          )}

          <AttachmentPanel
            title="CAP Evidence & Deliverables"
            attachments={attachments}
            emptyLabel="No supporting evidence, validation artifacts, or deliverables have been attached yet."
          />

          <AttachmentComposer
            sourceType="CORRECTIVE_ACTION_PLAN"
            sourceId={cap.id}
            sourceLabel={cap.capNumber}
            title="Add CAP Evidence"
          />
        </div>

        <div className="space-y-5">
          <Section title="CAP Details">
            <dl className="space-y-2">
              <Row label="CAP #" value={cap.capNumber} />
              <Row label="Source" value={cap.source.replace(/_/g, ' ')} />
              <Row label="Priority" value={cap.priority} />
              <Row label="Target Date" value={formatDate(cap.targetDate)} highlight={isOverdue} />
              {cap.completedDate && <Row label="Completed" value={formatDate(cap.completedDate)} />}
              {cap.followUpDate && <Row label="Follow-Up Date" value={formatDate(cap.followUpDate)} />}
              {cap.regulatoryBody && <Row label="Regulatory Body" value={cap.regulatoryBody.replace(/_/g, ' ')} />}
              <Row label="PDSA Cycle" value={cap.isPdsa ? 'Yes' : 'No'} />
              {cap.vigilanceDays && <Row label="Vigilance Period" value={`${cap.vigilanceDays} days`} />}
            </dl>
          </Section>

          {cap.assignee && (
            <Section title="Assignee">
              <div className="text-sm">
                <p className="font-medium text-slate-800">{cap.assignee.name}</p>
                {cap.assignee.title && <p className="text-xs text-slate-500">{cap.assignee.title}</p>}
                <p className="text-xs text-slate-400 mt-0.5">{cap.assignee.email}</p>
              </div>
            </Section>
          )}

          {cap.incidents.length > 0 && (
            <Section title="Linked Incidents">
              <ul className="space-y-2">
                {cap.incidents.map(i => (
                  <li key={i.id}>
                    <Link href={`/trackers/incidents/${i.id}`} className="text-xs text-purple-700 hover:underline font-medium">
                      {i.incidentNumber}
                    </Link>
                    <p className="text-xs text-slate-500">{i.incidentType.replace(/_/g, ' ')} &middot; {formatDate(i.dateOccurred)}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function PdsaBlock({ label, color, content }: { label: string; color: string; content: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };
  return (
    <div className={`rounded-lg border p-3 ${colors[color]}`}>
      <p className="text-xs font-bold uppercase mb-1">{label}</p>
      <p className="text-xs whitespace-pre-wrap leading-relaxed">{content}</p>
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
    <>
      <dt className="text-xs text-slate-500 shrink-0">{label}</dt>
      <dd className={`text-xs font-medium text-right mb-2 ${highlight ? 'text-red-600 font-bold' : 'text-slate-800'}`}>{value}</dd>
    </>
  );
}
