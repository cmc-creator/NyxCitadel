import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquareWarning, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Patient Grievance Tracker' };

const STATUS_COLORS: Record<string, string> = {
  OPEN:                 'bg-red-100 text-red-700',
  UNDER_REVIEW:         'bg-yellow-100 text-yellow-700',
  ACKNOWLEDGMENT_SENT:  'bg-blue-100 text-blue-700',
  PENDING_RESOLUTION:   'bg-orange-100 text-orange-700',
  RESOLVED:             'bg-green-100 text-green-700',
  ESCALATED:            'bg-red-200 text-red-800',
  CLOSED:               'bg-slate-100 text-slate-500',
};

const SEVERITY_COLORS: Record<string, string> = {
  STANDARD:       'bg-slate-100 text-slate-600',
  EXPEDITED:      'bg-orange-100 text-orange-700',
  REGULATORY:     'bg-red-100 text-red-700',
  SENTINEL:       'bg-red-200 text-red-800 font-bold',
};

function DaysIndicator({ dueDate, label }: { dueDate: Date; label: string }) {
  const now = new Date();
  const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diff < 0;
  const isUrgent = diff >= 0 && diff <= 2;

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      isOverdue ? 'bg-red-100 text-red-700 font-semibold' :
      isUrgent  ? 'bg-orange-100 text-orange-700 font-medium' :
                  'bg-slate-100 text-slate-500'
    }`}>
      <Clock className="w-3 h-3" />
      {isOverdue ? `${label} OVERDUE by ${Math.abs(diff)}d` : `${label}: ${diff}d left`}
    </span>
  );
}

export default async function GrievancesPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const yearStart = year ? new Date(year, 0, 1) : null;
  const yearEnd   = year ? new Date(year + 1, 0, 1) : null;

  const grievances = await prisma.grievanceRecord.findMany({
    where: {
      facilityId,
      ...(yearStart && yearEnd ? { dateReceived: { gte: yearStart, lt: yearEnd } } : {}),
    },
    orderBy: { dateReceived: 'desc' },
  });

  const now = new Date();
  const open = grievances.filter(g => g.status !== 'CLOSED' && g.status !== 'RESOLVED');
  const overdueAck = open.filter(g => !g.acknowledgmentDate && g.acknowledgmentDueDate < now);
  const overdueRes = open.filter(g => !g.resolutionDate && g.resolutionDueDate < now);
  const sentinel  = open.filter(g => g.severity === 'SENTINEL');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-orange-500" />
            Patient Grievance Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            CMS 42 CFR 482.13(e) · 7-day acknowledgment · 30-day resolution
          </p>
        </div>
        <Link
          href="/trackers/grievances/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Log Grievance
        </Link>
      </div>

      {/* Archive year banner */}
      {year && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{year} Archive View</strong> - showing grievances received within {year}.
          </p>
          <Link href="/trackers/grievances" className="text-xs text-amber-700 underline">Return to live view</Link>
        </div>
      )}

      {/* Alert banners */}
      {overdueAck.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{overdueAck.length} grievance{overdueAck.length > 1 ? 's' : ''}</strong> past the 7-day acknowledgment deadline (42 CFR 482.13(e)).
          </p>
        </div>
      )}
      {overdueRes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700">
            <strong>{overdueRes.length} grievance{overdueRes.length > 1 ? 's' : ''}</strong> past the 30-day resolution deadline (42 CFR 482.13(e)).
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{open.length}</div>
          <div className="text-sm text-slate-500">Open Grievances</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdueAck.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-2xl font-bold ${overdueAck.length > 0 ? 'text-red-600' : 'text-slate-900'}`}>{overdueAck.length}</div>
          <div className="text-sm text-slate-500">Overdue Acknowledgments</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdueRes.length > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-2xl font-bold ${overdueRes.length > 0 ? 'text-orange-600' : 'text-slate-900'}`}>{overdueRes.length}</div>
          <div className="text-sm text-slate-500">Overdue Resolutions</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {grievances.filter(g => g.status === 'RESOLVED' || g.status === 'CLOSED').length}
          </div>
          <div className="text-sm text-slate-500">Resolved / Closed</div>
        </div>
      </div>

      {/* Table */}
      {grievances.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MessageSquareWarning className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No grievances logged yet</p>
          <Link
            href="/trackers/grievances/new"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Log First Grievance
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Complainant / Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadlines</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grievances.map(g => {
                const isClosed = g.status === 'CLOSED' || g.status === 'RESOLVED';
                return (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{g.grievanceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{g.complainantName}</div>
                      {g.patientName && <div className="text-xs text-slate-500">Patient: {g.patientName}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-600">{g.category.replace(/_/g, ' ')}</div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${SEVERITY_COLORS[g.severity] ?? ''}`}>
                        {g.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[g.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {g.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      {!isClosed && !g.acknowledgmentDate && (
                        <DaysIndicator dueDate={g.acknowledgmentDueDate} label="ACK" />
                      )}
                      {!isClosed && !g.resolutionDate && (
                        <DaysIndicator dueDate={g.resolutionDueDate} label="RES" />
                      )}
                      {isClosed && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(g.dateReceived)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/trackers/grievances/${g.id}`} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
