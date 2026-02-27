import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { Scale, ArrowLeft, AlertTriangle, Clock, CheckCircle2, FileSearch, Link2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = { title: 'QOC / LOI Complaint' };

const STATUS_COLOR: Record<string, string> = {
  OPEN:               'bg-red-100 text-red-700',
  LOI_RECEIVED:       'bg-orange-100 text-orange-700',
  RESPONSE_SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_INVESTIGATION:'bg-yellow-100 text-yellow-700',
  FINDINGS_ISSUED:    'bg-purple-100 text-purple-700',
  SUBSTANTIATED:      'bg-red-200 text-red-800',
  UNSUBSTANTIATED:    'bg-green-100 text-green-700',
  CLOSED:             'bg-slate-100 text-slate-500',
};

const INV_COLOR: Record<string, string> = {
  STANDARD:           'bg-slate-100 text-slate-600',
  IMMEDIATE_JEOPARDY: 'bg-red-100 text-red-700',
  EXPANDED:           'bg-orange-100 text-orange-700',
  REVISIT:            'bg-yellow-100 text-yellow-700',
  FOLLOW_UP:          'bg-blue-100 text-blue-700',
};

export default async function QocDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const complaint = await prisma.qocComplaint.findFirst({
    where: { id: params.id, facilityId: session!.user.facilityId },
  });
  if (!complaint) notFound();

  const now = new Date();
  const responseOverdue = complaint.responseDueDate && complaint.responseDueDate < now && !complaint.responseSubmittedDate;
  const daysUntilResponse = complaint.responseDueDate
    ? Math.ceil((complaint.responseDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const citations = Array.isArray(complaint.citationsIssued)
    ? (complaint.citationsIssued as string[])
    : [];
  const allegationCategories = Array.isArray(complaint.allegationCategories)
    ? (complaint.allegationCategories as string[])
    : [];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/trackers/qoc" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to QOC / LOI Tracker
        </Link>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-500">{complaint.qocNumber}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLOR[complaint.status] ?? 'bg-slate-100'}`}>
            {complaint.status.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${INV_COLOR[complaint.investigationType] ?? 'bg-slate-100'}`}>
            {complaint.investigationType.replace(/_/g, ' ')}
          </span>
          {complaint.deficienciesFound && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700">Deficiencies Found</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-6 h-6 text-purple-600" />
          QOC / LOI Complaint
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Received {formatDate(complaint.dateReceived)} · Complainant: {complaint.complainantType.replace(/_/g, ' ')}</p>
      </div>

      {/* Response deadline alert */}
      {responseOverdue && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span><strong>Response overdue</strong> — 10 business-day window expired {formatDate(complaint.responseDueDate!)}.</span>
        </div>
      )}
      {!responseOverdue && daysUntilResponse !== null && daysUntilResponse >= 0 && daysUntilResponse <= 3 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-4 py-3 text-sm">
          <Clock className="w-4 h-4 shrink-0" />
          <span><strong>{daysUntilResponse} day{daysUntilResponse !== 1 ? 's' : ''} remaining</strong> to submit response by {formatDate(complaint.responseDueDate!)}.</span>
        </div>
      )}

      {/* Complaint Intake */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint Intake</h2>
        </div>
        <div className="px-5 py-4 space-y-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-xs text-slate-400">Date Received</dt><dd className="text-slate-800 font-medium">{formatDate(complaint.dateReceived)}</dd></div>
            <div><dt className="text-xs text-slate-400">Complainant Type</dt><dd className="text-slate-800">{complaint.complainantType.replace(/_/g, ' ')}</dd></div>
            {complaint.cmsComplaintNumber && <div><dt className="text-xs text-slate-400">CMS Complaint #</dt><dd className="text-slate-800 font-mono">{complaint.cmsComplaintNumber}</dd></div>}
            {complaint.stateReferenceNumber && <div><dt className="text-xs text-slate-400">State Reference #</dt><dd className="text-slate-800 font-mono">{complaint.stateReferenceNumber}</dd></div>}
            {complaint.assignedTo && <div><dt className="text-xs text-slate-400">Assigned To</dt><dd className="text-slate-800">{complaint.assignedTo}</dd></div>}
            {complaint.closedDate && <div><dt className="text-xs text-slate-400">Closed Date</dt><dd className="text-slate-800">{formatDate(complaint.closedDate)}</dd></div>}
          </dl>
          {allegationCategories.length > 0 && (
            <div>
              <dt className="text-xs text-slate-400 mb-1.5">Allegation Categories</dt>
              <div className="flex flex-wrap gap-1.5">
                {allegationCategories.map((cat, i) => (
                  <span key={i} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">{cat}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <dt className="text-xs text-slate-400 mb-1">Allegation Summary</dt>
            <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">{complaint.allegationSummary}</p>
          </div>
        </div>
      </div>

      {/* LOI & Investigation */}
      {complaint.loiReceivedDate && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Letter of Investigation</h2>
          </div>
          <div className="px-5 py-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-xs text-slate-400">LOI Received</dt><dd className="text-slate-800 font-medium">{formatDate(complaint.loiReceivedDate)}</dd></div>
              {complaint.responseDueDate && (
                <div>
                  <dt className="text-xs text-slate-400">Response Due</dt>
                  <dd className={`font-medium ${responseOverdue ? 'text-red-600' : 'text-slate-800'}`}>
                    {formatDate(complaint.responseDueDate)}
                    {complaint.responseSubmittedDate && (
                      <span className="ml-2 text-xs text-green-600 font-normal">
                        <CheckCircle2 className="w-3 h-3 inline mb-0.5" /> Submitted {formatDate(complaint.responseSubmittedDate)}
                      </span>
                    )}
                  </dd>
                </div>
              )}
              {complaint.investigatorName && <div><dt className="text-xs text-slate-400">Investigator</dt><dd className="text-slate-800">{complaint.investigatorName}</dd></div>}
              {complaint.surveyDate && <div><dt className="text-xs text-slate-400">On-Site Survey</dt><dd className="text-slate-800">{formatDate(complaint.surveyDate)}</dd></div>}
            </dl>
          </div>
        </div>
      )}

      {/* Findings */}
      {(complaint.findingsSummary || citations.length > 0) && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Findings</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            {citations.length > 0 && (
              <div>
                <dt className="text-xs text-slate-400 mb-1.5">Citations Issued</dt>
                <div className="flex flex-wrap gap-1.5">
                  {citations.map((c, i) => (
                    <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded font-mono">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {complaint.findingsSummary && (
              <div>
                <dt className="text-xs text-slate-400 mb-1">Findings Summary</dt>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{complaint.findingsSummary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linked Records */}
      {(complaint.linkedGrievanceId || complaint.linkedPocId || complaint.linkedRcaId) && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5" /> Linked Records
          </h2>
          <div className="flex flex-wrap gap-3">
            {complaint.linkedGrievanceId && (
              <Link href="/trackers/grievances" className="text-sm text-purple-600 hover:underline">→ View Grievance</Link>
            )}
            {complaint.linkedPocId && (
              <Link href={`/quality/poc/${complaint.linkedPocId}`} className="text-sm text-purple-600 hover:underline">→ View Plan of Correction</Link>
            )}
            {complaint.linkedRcaId && (
              <Link href={`/trackers/rca/${complaint.linkedRcaId}`} className="text-sm text-purple-600 hover:underline">→ View RCA</Link>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {complaint.notes && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{complaint.notes}</p>
        </div>
      )}
    </div>
  );
}
