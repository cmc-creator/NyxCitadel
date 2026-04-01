import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Scale, Plus, Clock, AlertCircle, CheckCircle2, FileSearch } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'QOC / LOI Complaint Tracker' };

const STATUS_COLORS: Record<string, string> = {
  OPEN:               'bg-red-100 text-red-700',
  LOI_RECEIVED:       'bg-orange-100 text-orange-700',
  RESPONSE_SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_INVESTIGATION:'bg-yellow-100 text-yellow-700',
  FINDINGS_ISSUED:    'bg-teal-100 text-teal-700',
  SUBSTANTIATED:      'bg-red-200 text-red-800 font-semibold',
  UNSUBSTANTIATED:    'bg-green-100 text-green-700',
  CLOSED:             'bg-slate-100 text-slate-500',
};

const INV_COLORS: Record<string, string> = {
  STANDARD:          'bg-slate-100 text-slate-600',
  IMMEDIATE_JEOPARDY:'bg-red-100 text-red-700 font-bold',
  EXPANDED:          'bg-orange-100 text-orange-700',
  REVISIT:           'bg-yellow-100 text-yellow-700',
  FOLLOW_UP:         'bg-blue-100 text-blue-700',
};

function DeadlineTag({ dueDate, label }: { dueDate: Date; label: string }) {
  const now = new Date();
  const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const overdue = diff < 0;
  const urgent  = diff >= 0 && diff <= 3;
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      overdue ? 'bg-red-100 text-red-700 font-semibold' :
      urgent  ? 'bg-orange-100 text-orange-700 font-medium' :
                'bg-slate-100 text-slate-500'
    }`}>
      <Clock className="w-3 h-3" />
      {overdue
        ? `${label} OVERDUE ${Math.abs(diff)}d`
        : `${label}: ${diff}d left`}
    </span>
  );
}

export default async function QocPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const yearStart = year ? new Date(year, 0, 1) : null;
  const yearEnd   = year ? new Date(year + 1, 0, 1) : null;

  const complaints = await prisma.qocComplaint.findMany({
    where: {
      facilityId,
      ...(yearStart && yearEnd ? { dateReceived: { gte: yearStart, lt: yearEnd } } : {}),
    },
    orderBy: { dateReceived: 'desc' },
  });

  const now = new Date();
  const open = complaints.filter(c => c.status !== 'CLOSED' && c.status !== 'UNSUBSTANTIATED');
  const awaitingResponse = complaints.filter(
    c => c.status === 'LOI_RECEIVED' && !c.responseSubmittedDate
  );
  const overdueResponse = awaitingResponse.filter(
    c => c.responseDueDate && c.responseDueDate < now
  );
  const ij = open.filter(c => c.investigationType === 'IMMEDIATE_JEOPARDY');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-teal-600" />
            QOC / LOI Complaint Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            CMS 42 CFR 488 · Quality of Care Complaints · Letters of Investigation · 10-business-day response window
          </p>
        </div>
        <Link
          href="/trackers/qoc/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Log QOC Complaint
        </Link>
      </div>

      {/* Archive year banner */}
      {year && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{year} Archive View</strong> - showing QOC complaints received within {year}.
          </p>
          <Link href="/trackers/qoc" className="text-xs text-amber-700 underline">Return to live view</Link>
        </div>
      )}

      {/* Alert banners */}
      {ij.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 font-semibold">
            {ij.length} active Immediate Jeopardy investigation{ij.length > 1 ? 's' : ''} - requires immediate executive action.
          </p>
        </div>
      )}
      {overdueResponse.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700">
            <strong>{overdueResponse.length} LOI response{overdueResponse.length > 1 ? 's' : ''}</strong> past the 10-business-day deadline.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{open.length}</div>
          <div className="text-sm text-slate-500">Open Complaints</div>
        </div>
        <div className={`rounded-xl border p-4 ${ij.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-2xl font-bold ${ij.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>{ij.length}</div>
          <div className="text-sm text-slate-500">Immediate Jeopardy</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdueResponse.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-2xl font-bold ${overdueResponse.length > 0 ? 'text-orange-600' : 'text-slate-900'}`}>{overdueResponse.length}</div>
          <div className="text-sm text-slate-500">Overdue Responses</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {complaints.filter(c => c.status === 'CLOSED' || c.status === 'UNSUBSTANTIATED').length}
          </div>
          <div className="text-sm text-slate-500">Closed / Unsubstantiated</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">QOC #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Received</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Complainant</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Allegation Summary</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Investigation Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Response Due</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <FileSearch className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No QOC complaints logged yet.
                  </td>
                </tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-teal-700">
                      <Link href={`/trackers/qoc/${c.id}`} className="hover:underline">{c.qocNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(c.dateReceived)}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {c.complainantType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{c.allegationSummary}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${INV_COLORS[c.investigationType] ?? 'bg-slate-100 text-slate-600'}`}>
                        {c.investigationType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.responseDueDate && !c.responseSubmittedDate ? (
                        <DeadlineTag dueDate={c.responseDueDate} label="Response" />
                      ) : c.responseSubmittedDate ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="w-3 h-3" /> Submitted {formatDate(c.responseSubmittedDate)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">No LOI yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {c.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
