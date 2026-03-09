import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  FileWarning, ArrowLeft, Calendar, User, MapPin, AlertTriangle,
  CheckCircle2, Clock, ShieldAlert, Activity, FileText, Info,
} from 'lucide-react';
import { isPast } from 'date-fns';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Incident Report Detail' };

const STATUS_COLORS: Record<string, string> = {
  OPEN:              'bg-red-100 text-red-700',
  INVESTIGATING:     'bg-yellow-100 text-yellow-700',
  PENDING_REVIEW:    'bg-blue-100 text-blue-700',
  REPORTED_TO_STATE: 'bg-purple-100 text-purple-700',
  CLOSED:            'bg-slate-100 text-slate-500',
  REOPENED:          'bg-orange-100 text-orange-700',
};

const SEVERITY_COLORS: Record<string, string> = {
  NEAR_MISS: 'bg-slate-100 text-slate-600',
  MINOR:     'bg-green-100 text-green-700',
  MODERATE:  'bg-yellow-100 text-yellow-700',
  SERIOUS:   'bg-orange-100 text-orange-700',
  SENTINEL:  'bg-red-200 text-red-800 font-bold',
};

const AI_SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  HIGH:     'bg-orange-100 text-orange-700',
  MODERATE: 'bg-yellow-100 text-yellow-700',
  LOW:      'bg-green-100 text-green-700',
};

export default async function IrIadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const r = await prisma.incidentReport.findFirst({
    where: { id: params.id, facilityId },
  });
  if (!r) notFound();

  const adhsOverdue = r.adhsReportDue && !r.adhsReported && isPast(r.adhsReportDue);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div>
        <Link
          href="/trackers/ir-iad"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to IR / IAD Tracker
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <FileWarning className="w-6 h-6 text-red-600 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-slate-900">{r.irNumber}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {r.status.replace(/_/g, ' ')}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SEVERITY_COLORS[r.severity] ?? 'bg-slate-100 text-slate-600'}`}>
              {r.severity.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            {r.linkedRcaId && (
              <Link href="/trackers/rca" className="inline-flex items-center gap-1 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100">
                <CheckCircle2 className="w-3.5 h-3.5" /> View RCA
              </Link>
            )}
            {!r.linkedRcaId && (r.severity === 'SENTINEL' || r.iadRequired) && r.status !== 'CLOSED' && (
              <Link
                href={`/trackers/rca/new?fromIr=${r.id}&type=${encodeURIComponent(r.incidentType)}&date=${r.incidentDate.toISOString()}&desc=${encodeURIComponent(r.briefDescription?.slice(0, 200) ?? '')}`}
                className="inline-flex items-center gap-1 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
              >
                → Start RCA
              </Link>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-1 ml-9">
          {r.incidentType.replace(/_/g, ' ')} · {formatDate(r.incidentDate)}
          {r.incidentTime && ` at ${r.incidentTime}`}
          {r.location && ` · ${r.location}`}
        </p>
      </div>

      {/* ADHS overdue alert */}
      {adhsOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">ADHS Report Overdue</p>
            <p className="text-xs text-red-600">Was due {formatDate(r.adhsReportDue!)}. Report to ADHS immediately.</p>
          </div>
        </div>
      )}

      {/* AI Triage */}
      {r.aiTriageSeverity && (
        <div className={`rounded-xl border px-4 py-3 ${r.aiTriageSeverity === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-amber-700" />
            <p className="text-sm font-semibold text-slate-800">AI Triage Assessment</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${AI_SEVERITY_COLORS[r.aiTriageSeverity] ?? ''}`}>
              {r.aiTriageSeverity}
            </span>
            {r.aiCascadeTriggered && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Auto-RCA Triggered</span>
            )}
          </div>
          {r.aiTriageReason && <p className="text-xs text-slate-600">{r.aiTriageReason}</p>}
          {r.aiTriageTags && (
            <div className="flex gap-1.5 flex-wrap mt-1.5">
              {r.aiTriageTags.split(',').map(tag => (
                <span key={tag.trim()} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                  {tag.trim().replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Incident Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" /> Incident Details
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium text-slate-500">Incident Type</dt>
                <dd className="text-slate-800 mt-0.5">{r.incidentType.replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Severity</dt>
                <dd className="mt-0.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_COLORS[r.severity] ?? ''}`}>
                    {r.severity.replace(/_/g, ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Incident Date</dt>
                <dd className="text-slate-800 mt-0.5">{formatDate(r.incidentDate)}{r.incidentTime && ` at ${r.incidentTime}`}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500">Reported Date</dt>
                <dd className="text-slate-800 mt-0.5">{formatDate(r.reportedDate)}</dd>
              </div>
              {r.location && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</dt>
                  <dd className="text-slate-800 mt-0.5">{r.location}{r.unitName && ` · ${r.unitName}`}</dd>
                </div>
              )}
              {r.assignedTo && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> Assigned To</dt>
                  <dd className="text-slate-800 mt-0.5">{r.assignedTo}</dd>
                </div>
              )}
              {r.closedDate && (
                <div>
                  <dt className="text-xs font-medium text-slate-500">Closed Date</dt>
                  <dd className="text-slate-800 mt-0.5">{formatDate(r.closedDate)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Narrative */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Narrative
            </h2>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Brief Description</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{r.briefDescription}</p>
            </div>
            {r.injuryDescription && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Injury Description</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{r.injuryDescription}</p>
              </div>
            )}
            {r.immediateActions && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Immediate Actions Taken</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{r.immediateActions}</p>
              </div>
            )}
          </div>

          {/* Investigation */}
          {(r.investigationFindings || r.preventiveActions || r.rootCauseIdentified) && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400" /> Investigation
              </h2>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.rootCauseIdentified ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {r.rootCauseIdentified ? '✓ Root Cause Identified' : 'Root Cause Pending'}
                </span>
              </div>
              {r.investigationFindings && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Investigation Findings</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{r.investigationFindings}</p>
                </div>
              )}
              {r.preventiveActions && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Preventive Actions</p>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">{r.preventiveActions}</p>
                </div>
              )}
              {r.linkedCapId && (
                <Link
                  href={`/trackers/caps/${r.linkedCapId}`}
                  className="inline-flex items-center gap-1 text-sm text-purple-700 hover:underline"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Linked CAP
                </Link>
              )}
            </div>
          )}

          {r.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-2">Notes</h2>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Patient info */}
          {(r.patientName || r.patientMRN) && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Patient</h3>
              <dl className="space-y-2 text-sm">
                {r.patientName && <div><dt className="text-xs text-slate-500">Name</dt><dd className="font-medium text-slate-800">{r.patientName}</dd></div>}
                {r.patientMRN && <div><dt className="text-xs text-slate-500">MRN</dt><dd className="font-mono text-slate-700">{r.patientMRN}</dd></div>}
                {r.patientAge && <div><dt className="text-xs text-slate-500">Age</dt><dd className="text-slate-700">{r.patientAge}</dd></div>}
                {r.patientDOB && <div><dt className="text-xs text-slate-500">DOB</dt><dd className="text-slate-700">{formatDate(r.patientDOB)}</dd></div>}
              </dl>
            </div>
          )}

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Notifications</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Physician</span>
                <span className={`text-xs font-medium ${r.physicianNotified ? 'text-green-600' : 'text-slate-400'}`}>
                  {r.physicianNotified ? `✓ ${r.physicianNotifiedTime ?? 'Notified'}` : 'Not notified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Supervisor</span>
                <span className={`text-xs font-medium ${r.supervisorNotified ? 'text-green-600' : 'text-slate-400'}`}>
                  {r.supervisorNotified ? `✓ ${r.supervisorNotifiedTime ?? 'Notified'}` : 'Not notified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Family</span>
                <span className={`text-xs font-medium ${r.familyNotified ? 'text-green-600' : 'text-slate-400'}`}>
                  {r.familyNotified ? `✓ ${r.familyNotifiedDate ? formatDate(r.familyNotifiedDate) : 'Notified'}` : 'Not notified'}
                </span>
              </div>
            </dl>
          </div>

          {/* Regulatory Reporting */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Regulatory Reporting</h3>
            <div className="space-y-3">
              {/* ADHS */}
              <div className={`rounded-lg p-3 ${r.adhsReportable ? (r.adhsReported ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200') : 'bg-slate-50 border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">ADHS</span>
                  {r.adhsReportable ? (
                    r.adhsReported ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Reported</span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                    )
                  ) : (
                    <span className="text-xs text-slate-400">Not required</span>
                  )}
                </div>
                {r.adhsReportable && (
                  <div className="text-xs text-slate-600 space-y-0.5">
                    {r.adhsReportableCategory && <p>Category: {r.adhsReportableCategory}</p>}
                    {r.adhsReportDue && <p>Due: {formatDate(r.adhsReportDue)}</p>}
                    {r.adhsReportDate && <p>Reported: {formatDate(r.adhsReportDate)}</p>}
                    {r.adhsConfirmationNumber && <p className="font-mono">Conf #: {r.adhsConfirmationNumber}</p>}
                  </div>
                )}
              </div>

              {/* AHCCCS */}
              <div className={`rounded-lg p-3 ${r.ahcccsReportable ? (r.ahcccsReported ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200') : 'bg-slate-50 border border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">AHCCCS</span>
                  {r.ahcccsReportable ? (
                    r.ahcccsReported ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Reported {r.ahcccsReportDate ? formatDate(r.ahcccsReportDate) : ''}</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Pending</span>
                    )
                  ) : <span className="text-xs text-slate-400">Not required</span>}
                </div>
              </div>

              {/* JC */}
              <div className={`rounded-lg p-3 ${r.jcReportable ? (r.jcReported ? 'bg-green-50 border border-green-200' : 'bg-purple-50 border border-purple-200') : 'bg-slate-50 border border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Joint Commission</span>
                  {r.jcReportable ? (
                    r.jcReported ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Reported</span>
                    ) : (
                      <span className="text-xs text-purple-600 font-medium">Pending</span>
                    )
                  ) : <span className="text-xs text-slate-400">Not required</span>}
                </div>
              </div>

              {/* IAD */}
              <div className={`rounded-lg p-3 ${r.iadRequired ? (r.iadSubmitted ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200') : 'bg-slate-50 border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700">IAD Submission</span>
                  {r.iadRequired ? (
                    r.iadSubmitted ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Submitted</span>
                    ) : (
                      <span className="text-xs text-blue-600 font-medium">Pending</span>
                    )
                  ) : <span className="text-xs text-slate-400">Not required</span>}
                </div>
                {r.iadRequired && (
                  <div className="text-xs text-slate-600 space-y-0.5">
                    {r.iadPeriod && <p>Period: {r.iadPeriod}</p>}
                    {r.iadSubmittedDate && <p>Submitted: {formatDate(r.iadSubmittedDate)}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Staff / witnesses */}
          {(r.staffInvolvedNames || r.witnessNames) && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Personnel</h3>
              <dl className="space-y-2 text-sm">
                {r.staffInvolvedNames && (
                  <div>
                    <dt className="text-xs text-slate-500">Staff Involved</dt>
                    <dd className="text-slate-700 text-xs mt-0.5 whitespace-pre-wrap">{r.staffInvolvedNames}</dd>
                  </div>
                )}
                {r.witnessNames && (
                  <div>
                    <dt className="text-xs text-slate-500">Witnesses</dt>
                    <dd className="text-slate-700 text-xs mt-0.5 whitespace-pre-wrap">{r.witnessNames}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
