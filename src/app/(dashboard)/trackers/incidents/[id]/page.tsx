import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ChevronLeft,
  Calendar,
  MapPin,
  User,
  FileText,
  ClipboardList,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: `Incident ${params.id.slice(0, 8).toUpperCase()}` };
}

const SEVERITY_STYLES: Record<string, string> = {
  MINOR:        'bg-green-100 text-green-800',
  MODERATE:     'bg-yellow-100 text-yellow-800',
  MAJOR:        'bg-orange-100 text-orange-800',
  CATASTROPHIC: 'bg-red-100 text-red-800',
  SENTINEL:     'bg-red-600 text-white font-bold',
};

const STATUS_STYLES: Record<string, string> = {
  OPEN:                 'bg-blue-100 text-blue-800',
  UNDER_INVESTIGATION:  'bg-yellow-100 text-yellow-800',
  RCA_IN_PROGRESS:      'bg-orange-100 text-orange-800',
  CAP_IN_PROGRESS:      'bg-purple-100 text-purple-800',
  CLOSED:               'bg-slate-100 text-slate-600',
  REPORTABLE_PENDING:   'bg-red-100 text-red-800',
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const incident = await prisma.incident.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
    include: { cap: { select: { id: true, capNumber: true, status: true, title: true } } },
  });
  if (!incident) notFound();

  const isReportable = (incident.reportableToState && !incident.reportedToState) ||
                       (incident.reportableToJC   && !incident.jcReportDate);

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/trackers/incidents" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600">
        <ChevronLeft className="w-4 h-4" /> Back to Incidents
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-purple-600" />
            {incident.incidentNumber}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {incident.incidentType.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${SEVERITY_STYLES[incident.severity] ?? 'bg-slate-100 text-slate-700'}`}>
            {incident.severity}
          </span>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[incident.status] ?? 'bg-slate-100 text-slate-700'}`}>
            {incident.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Reportable alert */}
      {isReportable && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            This incident is <strong>reportable</strong> and has not yet been reported to all required agencies.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Key facts */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Key Details
            </h2>
            <dl className="space-y-3">
              <Field label="Date Occurred"  value={formatDate(incident.dateOccurred)} />
              <Field label="Date Reported"  value={formatDate(incident.dateReported)} />
              <Field label="Location"       value={incident.location} />
              <Field label="Patient Involved" value={incident.patientInvolved ? 'Yes' : 'No'} />
              <Field label="Staff Involved"   value={incident.staffInvolved ? 'Yes' : 'No'} />
              {incident.closedDate && <Field label="Closed" value={formatDate(incident.closedDate)} />}
            </dl>
          </div>

          {/* Regulatory */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400" /> Regulatory Reporting
            </h2>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-slate-500">Reportable to State</dt>
                <dd>
                  {incident.reportableToState
                    ? incident.reportedToState
                      ? <span className="text-xs text-emerald-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Reported {incident.stateReportDate ? formatDate(incident.stateReportDate) : ''}</span>
                      : <span className="text-xs text-red-700 font-medium">Pending</span>
                    : <span className="text-xs text-slate-400">N/A</span>
                  }
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-slate-500">Reportable to JC</dt>
                <dd>
                  {incident.reportableToJC
                    ? incident.jcReportDate
                      ? <span className="text-xs text-emerald-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Reported {formatDate(incident.jcReportDate)}</span>
                      : <span className="text-xs text-red-700 font-medium">Pending</span>
                    : <span className="text-xs text-slate-400">N/A</span>
                  }
                </dd>
              </div>
            </dl>
          </div>

          {/* Linked CAP */}
          {incident.cap && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-slate-400" /> Linked CAP
              </h2>
              <Link
                href={`/trackers/caps?search=${incident.cap.capNumber}`}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {incident.cap.capNumber}
              </Link>
              <p className="text-xs text-slate-500 mt-0.5">{incident.cap.title}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {incident.cap.status.replace(/_/g, ' ')}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-2">
            <h2 className="text-sm font-semibold text-slate-800">Actions</h2>
            {incident.status !== 'CLOSED' && (
              <Link
                href={`/trackers/caps/new?incidentId=${incident.id}`}
                className="block text-center text-xs font-medium bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Create CAP from Incident
              </Link>
            )}
            {(incident.severity === 'SENTINEL' || incident.severity === 'CATASTROPHIC') && (
              <Link
                href={`/trackers/rca/new?fromIr=${incident.id}&type=${encodeURIComponent(incident.incidentType)}&date=${incident.dateOccurred.toISOString()}&desc=${encodeURIComponent(incident.description.slice(0, 200))}`}
                className="block text-center text-xs font-medium bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                + Start Root Cause Analysis
              </Link>
            )}
          </div>
        </div>

        {/* Right: Narrative */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-slate-400" /> Incident Description
            </h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{incident.description}</p>
          </div>

          {incident.immediateActions && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-slate-400" /> Immediate Actions Taken
              </h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{incident.immediateActions}</p>
            </div>
          )}

          {incident.rootCauseAnalysis && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-slate-400" /> Root Cause Analysis Notes
              </h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{incident.rootCauseAnalysis}</p>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
            <span>Created {formatDate(incident.dateReported)}</span>
            <span>Last updated {formatDate(incident.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
