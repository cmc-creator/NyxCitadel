import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, MessageSquareWarning, Clock, AlertTriangle } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', color: 'bg-red-100 text-red-700' },
  { value: 'UNDER_REVIEW', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'ACKNOWLEDGMENT_SENT', label: 'Acknowledgment Sent', color: 'bg-blue-100 text-blue-700' },
  { value: 'PENDING_RESOLUTION', label: 'Pending Resolution', color: 'bg-orange-100 text-orange-700' },
  { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-700' },
  { value: 'ESCALATED', label: 'Escalated', color: 'bg-red-200 text-red-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-slate-100 text-slate-500' },
];

const SEVERITY_COLOR: Record<string, string> = {
  STANDARD: 'bg-slate-100 text-slate-600',
  EXPEDITED: 'bg-orange-100 text-orange-700',
  REGULATORY: 'bg-red-100 text-red-700',
  SENTINEL: 'bg-red-200 text-red-800',
};

export default async function GrievanceDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const g = await prisma.grievanceRecord.findUnique({ where: { id: params.id } });
  if (!g || g.facilityId !== session.user.facilityId) notFound();

  const now = new Date();
  const ackOverdue = !g.acknowledgmentDate && g.acknowledgmentDueDate < now;
  const resOverdue = !g.resolutionDate && g.resolutionDueDate < now;
  function daysLeft(d: Date) { return Math.ceil((d.getTime() - now.getTime()) / 86400000); }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/grievances" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Grievances
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <MessageSquareWarning className="w-5 h-5 text-orange-500" />
              <span className="text-xs font-mono text-slate-400">{g.grievanceNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_COLOR[g.severity]}`}>
                {g.severity}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{g.category.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Received: <strong>{formatDate(g.dateReceived)}</strong>
              {g.assignedTo && <> &middot; Assigned to: <strong>{g.assignedTo}</strong></>}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/grievances/${g.id}`} currentStatus={g.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DeadlineCard title="Acknowledgment" subtitle="CMS 482.13(e) — 7 calendar days"
          dueDate={g.acknowledgmentDueDate} completedDate={g.acknowledgmentDate}
          completedBy={g.acknowledgmentSentBy} daysLeft={daysLeft(g.acknowledgmentDueDate)} overdue={ackOverdue} />
        <DeadlineCard title="Resolution" subtitle="CMS 482.13(e) — 30 calendar days"
          dueDate={g.resolutionDueDate} completedDate={g.resolutionDate}
          completedBy={g.resolutionSentBy} daysLeft={daysLeft(g.resolutionDueDate)} overdue={resOverdue} />
      </div>

      {g.reportableToAdhs && !g.reportedToAdhs && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>ADHS Report Required</strong> &mdash; this grievance has not been reported to ADHS.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Grievance Summary">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{g.summary}</p>
          </Section>
          {g.resolution && (
            <Section title="Resolution">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{g.resolution}</p>
              {g.outcomeCategory && <p className="mt-2 text-xs text-slate-500">Outcome: <span className="font-medium text-slate-800">{g.outcomeCategory}</span></p>}
            </Section>
          )}
          {g.notes && (
            <Section title="Internal Notes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{g.notes}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Complainant">
            <dl className="space-y-2">
              <Row label="Name" value={g.complainantName} />
              <Row label="Type" value={g.complainantType.replace(/_/g, ' ')} />
              {g.complainantPhone && <Row label="Phone" value={g.complainantPhone} />}
              {g.complainantEmail && <Row label="Email" value={g.complainantEmail} />}
            </dl>
          </Section>

          {g.patientName && (
            <Section title="Patient Info">
              <dl className="space-y-2">
                <Row label="Patient Name" value={g.patientName} />
                {g.patientMRN && <Row label="MRN" value={g.patientMRN} />}
                {g.patientDOB && <Row label="DOB" value={formatDate(g.patientDOB)} />}
                {g.admissionDate && <Row label="Admitted" value={formatDate(g.admissionDate)} />}
                {g.dischargeDate && <Row label="Discharged" value={formatDate(g.dischargeDate)} />}
              </dl>
            </Section>
          )}

          <Section title="Regulatory">
            <dl className="space-y-2">
              <Row label="Reportable to ADHS" value={g.reportableToAdhs ? 'Yes' : 'No'} />
              {g.reportableToAdhs && (
                <Row label="ADHS Reported"
                  value={g.reportedToAdhs ? (g.adshReportDate ? formatDate(g.adshReportDate) : 'Yes') : '⚠ Pending'}
                  highlight={!g.reportedToAdhs} />
              )}
            </dl>
          </Section>

          {(g.linkedIncidentId || g.linkedCapId) && (
            <Section title="Linked Records">
              {g.linkedIncidentId && <Link href={`/trackers/incidents/${g.linkedIncidentId}`} className="block text-xs text-purple-700 hover:underline mb-1">&#x2192; Linked Incident</Link>}
              {g.linkedCapId && <Link href={`/trackers/caps/${g.linkedCapId}`} className="block text-xs text-purple-700 hover:underline">&#x2192; Linked CAP</Link>}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function DeadlineCard({ title, subtitle, dueDate, completedDate, completedBy, daysLeft, overdue }: {
  title: string; subtitle: string; dueDate: Date; completedDate: Date | null;
  completedBy: string | null; daysLeft: number; overdue: boolean;
}) {
  const done = !!completedDate;
  return (
    <div className={`rounded-xl border p-4 ${done ? 'bg-green-50 border-green-200' : overdue ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {done ? (
          <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">&#x2713; Done</span>
        ) : (
          <span className={`inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 font-medium ${overdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
            <Clock className="w-3 h-3" />
            {overdue ? `OVERDUE ${Math.abs(daysLeft)}d` : `${daysLeft}d left`}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-600">Due: <strong>{formatDate(dueDate)}</strong></p>
      {done && <p className="mt-1 text-xs text-green-700">Sent: <strong>{formatDate(completedDate!)}</strong>{completedBy && <> by {completedBy}</>}</p>}
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
