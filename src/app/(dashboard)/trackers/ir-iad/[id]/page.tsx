import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, FileWarning, AlertTriangle, Brain } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-700' },
  { value: 'INVESTIGATING', label: 'Investigating', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'PENDING_REVIEW', label: 'Pending Review', color: 'bg-orange-100 text-orange-700' },
  { value: 'REPORTED_TO_STATE', label: 'Reported to State', color: 'bg-purple-100 text-purple-700' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-slate-100 text-slate-500' },
  { value: 'REOPENED', label: 'Reopened', color: 'bg-red-100 text-red-700' },
];

const SEVERITY_COLOR: Record<string, string> = {
  NEAR_MISS: 'bg-slate-100 text-slate-600',
  MINOR: 'bg-green-100 text-green-700',
  MODERATE: 'bg-yellow-100 text-yellow-700',
  SERIOUS: 'bg-orange-100 text-orange-700',
  SENTINEL: 'bg-red-600 text-white',
};

export default async function IrIadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const ir = await prisma.incidentReport.findUnique({ where: { id: params.id } });
  if (!ir || ir.facilityId !== session.user.facilityId) notFound();

  const aiTags = ir.aiTriageTags as string[] | null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/ir-iad" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to IR / IAD Reports
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <FileWarning className="w-5 h-5 text-red-500" />
              <span className="text-xs font-mono text-slate-400">{ir.irNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_COLOR[ir.severity]}`}>
                {ir.severity.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{ir.incidentType.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Incident date: <strong>{formatDate(ir.incidentDate)}</strong>
              {ir.location && <> &middot; <strong>{ir.location}</strong></>}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/incident-reports/${ir.id}`} currentStatus={ir.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {/* Regulatory Alert Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ReportingBadge label="ADHS" reportable={ir.adhsReportable} reported={ir.adhsReported}
          dueDate={ir.adhsReportDue} confirmationNum={ir.adhsConfirmationNumber} />
        <ReportingBadge label="AHCCCS" reportable={ir.ahcccsReportable} reported={ir.ahcccsReported} />
        <ReportingBadge label="Joint Commission" reportable={ir.jcReportable} reported={ir.jcReported} />
      </div>

      {/* IAD Status */}
      {ir.iadRequired && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${ir.iadSubmitted ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${ir.iadSubmitted ? 'text-green-600' : 'text-yellow-600'}`} />
          <div>
            <p className="text-sm font-semibold text-slate-800">IAD Required</p>
            {ir.iadSubmitted
              ? <p className="text-xs text-green-700 mt-0.5">Submitted {ir.iadSubmittedDate ? formatDate(ir.iadSubmittedDate) : ''}{ir.iadPeriod && ` · Period: ${ir.iadPeriod}`}</p>
              : <p className="text-xs text-yellow-700 mt-0.5">IAD has not been submitted yet.{ir.iadPeriod && ` Period: ${ir.iadPeriod}`}</p>
            }
          </div>
        </div>
      )}

      {/* AI Triage */}
      {ir.aiTriageSeverity && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
          <Brain className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-indigo-800">AI Triage &mdash; {ir.aiTriageSeverity}</p>
            {ir.aiTriageReason && <p className="text-xs text-indigo-700 mt-0.5">{ir.aiTriageReason}</p>}
            {aiTags && aiTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {aiTags.map((t, i) => <span key={i} className="text-xs bg-indigo-100 text-indigo-700 rounded px-2 py-0.5">{t}</span>)}
              </div>
            )}
            {ir.aiCascadeTriggered && <p className="text-xs text-red-600 font-semibold mt-1">&#9888; AI Cascade Protocol Triggered</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Incident Description">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{ir.briefDescription}</p>
          </Section>

          {ir.injuryDescription && (
            <Section title="Injury / Harm Description">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ir.injuryDescription}</p>
            </Section>
          )}

          {ir.immediateActions && (
            <Section title="Immediate Actions Taken">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ir.immediateActions}</p>
            </Section>
          )}

          {ir.investigationFindings && (
            <Section title="Investigation Findings">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ir.investigationFindings}</p>
              {ir.rootCauseIdentified && (
                <p className="mt-2 text-xs text-slate-500">Root cause identified: <strong className="text-slate-800">{ir.rootCauseIdentified}</strong></p>
              )}
            </Section>
          )}

          {ir.preventiveActions && (
            <Section title="Preventive Actions">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ir.preventiveActions}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Report Details">
            <dl className="space-y-2">
              <Row label="IR #" value={ir.irNumber} />
              <Row label="Type" value={ir.incidentType.replace(/_/g, ' ')} />
              <Row label="Severity" value={ir.severity.replace(/_/g, ' ')} />
              <Row label="Incident Date" value={formatDate(ir.incidentDate)} />
              {ir.incidentTime && <Row label="Time" value={ir.incidentTime} />}
              <Row label="Reported Date" value={formatDate(ir.reportedDate)} />
              {ir.location && <Row label="Location" value={ir.location} />}
              {ir.unitName && <Row label="Unit" value={ir.unitName} />}
            </dl>
          </Section>

          {(ir.patientName || ir.patientMRN) && (
            <Section title="Patient">
              <dl className="space-y-2">
                {ir.patientName && <Row label="Name" value={ir.patientName} />}
                {ir.patientMRN && <Row label="MRN" value={ir.patientMRN} />}
                {ir.patientDOB && <Row label="DOB" value={formatDate(ir.patientDOB)} />}
              </dl>
            </Section>
          )}

          <Section title="Notifications">
            <dl className="space-y-2">
              <Row label="Physician Notified" value={ir.physicianNotified ? 'Yes' : 'No'} />
              <Row label="Supervisor Notified" value={ir.supervisorNotified ? 'Yes' : 'No'} />
              <Row label="Family Notified" value={ir.familyNotified ? 'Yes' : 'No'} />
              {ir.familyNotifiedDate && <Row label="Family Notified Date" value={formatDate(ir.familyNotifiedDate)} />}
            </dl>
          </Section>

          {(ir.linkedRcaId || ir.linkedCapId) && (
            <Section title="Linked Records">
              {ir.linkedRcaId && <Link href={`/trackers/rca/${ir.linkedRcaId}`} className="block text-xs text-purple-700 hover:underline mb-1">&#x2192; Linked RCA</Link>}
              {ir.linkedCapId && <Link href={`/trackers/caps/${ir.linkedCapId}`} className="block text-xs text-purple-700 hover:underline">&#x2192; Linked CAP</Link>}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function ReportingBadge({ label, reportable, reported, dueDate, confirmationNum }: {
  label: string; reportable: boolean; reported: boolean; dueDate?: Date | null; confirmationNum?: string | null;
}) {
  if (!reportable) {
    return (
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">Not Reportable</p>
      </div>
    );
  }
  return (
    <div className={`rounded-xl border p-3 text-center ${reported ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <p className={`text-xs font-semibold ${reported ? 'text-green-700' : 'text-red-700'}`}>{label}</p>
      <p className={`text-xs mt-0.5 ${reported ? 'text-green-600' : 'text-red-600 font-bold'}`}>
        {reported ? (confirmationNum ? `Reported (${confirmationNum})` : 'Reported') : '⚠ Not Yet Reported'}
      </p>
      {dueDate && !reported && <p className="text-xs text-slate-500 mt-0.5">Due {formatDate(dueDate)}</p>}
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
