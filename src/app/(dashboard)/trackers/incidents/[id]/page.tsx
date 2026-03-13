import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, AlertTriangle, ClipboardList , Pencil } from 'lucide-react';
import StatusUpdater from '@/components/trackers/StatusUpdater';
import PrintButton from '@/components/ui/PrintButton';
import { DeleteButton } from '@/components/ui/DeleteButton';

export const dynamic = 'force-dynamic';

const SEVERITY_COLOR: Record<string, string> = {
  MINOR: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  MAJOR: 'bg-orange-100 text-orange-800',
  CATASTROPHIC: 'bg-red-100 text-red-800',
  SENTINEL: 'bg-red-600 text-white',
};

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'UNDER_INVESTIGATION', label: 'Under Investigation', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'RCA_IN_PROGRESS', label: 'RCA In Progress', color: 'bg-orange-100 text-orange-800' },
  { value: 'CAP_IN_PROGRESS', label: 'CAP In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'REPORTABLE_PENDING', label: 'Reportable Pending', color: 'bg-red-100 text-red-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-gray-100 text-gray-600' },
];

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const incident = await prisma.incident.findUnique({
    where: { id: params.id },
    include: { cap: { select: { id: true, capNumber: true, status: true, title: true } } },
  });

  if (!incident || incident.facilityId !== session.user.facilityId) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/trackers/incidents" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Incidents
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/trackers/incidents/${params.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>
          <DeleteButton apiPath={`/api/incidents/${params.id}`} redirectPath="/trackers/incidents" label="incident" />
          <PrintButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-mono text-slate-400">{incident.incidentNumber}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${SEVERITY_COLOR[incident.severity] ?? 'bg-slate-100 text-slate-600'}`}>
                {incident.severity}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{incident.incidentType.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Occurred: <strong>{formatDate(incident.dateOccurred)}</strong>
              {incident.location && <> &middot; <strong>{incident.location}</strong></>}
            </p>
          </div>
          <StatusUpdater apiPath={`/api/incidents/${incident.id}`} currentStatus={incident.status} options={STATUS_OPTIONS} />
        </div>
      </div>

      {incident.reportableToState && !incident.reportedToState && (
        <AlertBanner color="red" title="State Report Required" body="This incident has been flagged as reportable to the state but has not been reported." />
      )}
      {incident.reportableToJC && !incident.jcReportDate && (
        <AlertBanner color="orange" title="Joint Commission Report Required" body="This incident is reportable to The Joint Commission." />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Section title="Description">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{incident.description}</p>
          </Section>
          {incident.immediateActions && (
            <Section title="Immediate Actions Taken">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{incident.immediateActions}</p>
            </Section>
          )}
          {incident.rootCauseAnalysis && (
            <Section title="Root Cause Analysis Summary">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{incident.rootCauseAnalysis}</p>
            </Section>
          )}
        </div>

        <div className="space-y-5">
          <Section title="Incident Details">
            <dl className="space-y-2">
              <Row label="Type" value={incident.incidentType.replace(/_/g, ' ')} />
              <Row label="Severity" value={incident.severity} />
              <Row label="Date Occurred" value={formatDate(incident.dateOccurred)} />
              <Row label="Date Reported" value={formatDate(incident.dateReported)} />
              {incident.location && <Row label="Location" value={incident.location} />}
              <Row label="Patient Involved" value={incident.patientInvolved ? 'Yes' : 'No'} />
              <Row label="Staff Involved" value={incident.staffInvolved ? 'Yes' : 'No'} />
              <Row label="Correction Required" value={incident.correctionRequired ? 'Yes' : 'No'} />
              {incident.closedDate && <Row label="Closed Date" value={formatDate(incident.closedDate)} />}
            </dl>
          </Section>

          <Section title="Regulatory Reporting">
            <dl className="space-y-2">
              <Row label="Reportable to State" value={incident.reportableToState ? 'Yes' : 'No'} />
              {incident.reportableToState && (
                <Row label="State Reported"
                  value={incident.reportedToState ? (incident.stateReportDate ? formatDate(incident.stateReportDate) : 'Yes') : '⚠ Pending'}
                  highlight={!incident.reportedToState} />
              )}
              <Row label="Reportable to JC" value={incident.reportableToJC ? 'Yes' : 'No'} />
              {incident.reportableToJC && incident.jcReportDate && <Row label="JC Report Date" value={formatDate(incident.jcReportDate)} />}
            </dl>
          </Section>

          {incident.cap && (
            <Section title="Linked CAP">
              <Link href={`/trackers/caps/${incident.cap.id}`} className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 transition">
                <ClipboardList className="w-4 h-4 shrink-0" />
                <div>
                  <div className="font-medium">{incident.cap.capNumber}</div>
                  <div className="text-xs text-slate-500">{incident.cap.title}</div>
                </div>
              </Link>
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

function AlertBanner({ color, title, body }: { color: 'red' | 'orange'; title: string; body: string }) {
  const c = color === 'red' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200';
  const t = color === 'red' ? 'text-red-800' : 'text-orange-800';
  return (
    <div className={`${c} border rounded-xl p-4 flex items-start gap-3`}>
      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${t}`} />
      <div className={t}>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs mt-0.5 opacity-80">{body}</p>
      </div>
    </div>
  );
}
