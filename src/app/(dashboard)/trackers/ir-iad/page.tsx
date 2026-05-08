import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileWarning, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'IR / IAD Incident Tracker' };

const STATUS_COLORS: Record<string, string> = {
  OPEN:              'bg-red-100 text-red-700',
  INVESTIGATING:     'bg-yellow-100 text-yellow-700',
  PENDING_REVIEW:    'bg-blue-100 text-blue-700',
  REPORTED_TO_STATE: 'bg-teal-100 text-teal-700',
  CLOSED:            'bg-slate-100 text-slate-500',
  REOPENED:          'bg-orange-100 text-orange-700',
};

const SEVERITY_COLORS: Record<string, string> = {
  NEAR_MISS: 'bg-slate-100 text-slate-500',
  MINOR:     'bg-green-100 text-green-700',
  MODERATE:  'bg-yellow-100 text-yellow-700',
  SERIOUS:   'bg-orange-100 text-orange-700',
  SENTINEL:  'bg-red-200 text-red-800 font-bold',
};

function DeadlineTag({ dueDate, label }: { dueDate: Date; label: string }) {
  const now = new Date();
  const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const overdue = diff < 0;
  const urgent  = diff >= 0 && diff <= 1;
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

export default async function IrIadPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const yearStart = year ? new Date(year, 0, 1) : null;
  const yearEnd   = year ? new Date(year + 1, 0, 1) : null;

  const reports = await prisma.incidentReport.findMany({
    where: {
      facilityId,
      ...(yearStart && yearEnd ? { incidentDate: { gte: yearStart, lt: yearEnd } } : {}),
    },
    orderBy: { incidentDate: 'desc' },
  });

  const now = new Date();
  const open = reports.filter(r => r.status !== 'CLOSED');
  const sentinel = open.filter(r => r.severity === 'SENTINEL');
  const overdueAdhs = reports.filter(
    r => r.adhsReportable && !r.adhsReported && r.adhsReportDue && r.adhsReportDue < now
  );
  const pendingIad = reports.filter(r => r.iadRequired && !r.iadSubmitted);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileWarning className="w-6 h-6 text-red-500" />
            IR / IAD Incident Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Incident Reports & Adverse Data · ADHS ARS 36-2402 · AHCCCS ACOM · JC Sentinel Event Policy
            {year && <span className="ml-2 font-semibold text-teal-700">· {year} Archive</span>}
          </p>
        </div>
        <Link
          href="/trackers/ir-iad/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Log Incident Report
        </Link>
      </div>

      {/* Alert banners */}
      {sentinel.length > 0 && (
        <div className="bg-red-950/20 border border-red-300 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700 font-semibold">
            {sentinel.length} open Sentinel Event{sentinel.length > 1 ? 's' : ''} - JC reporting and RCA required within 45 days.
          </p>
        </div>
      )}
      {overdueAdhs.length > 0 && (
        <div className="bg-orange-950/20 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700">
            <strong>{overdueAdhs.length} ADHS report{overdueAdhs.length > 1 ? 's' : ''}</strong> past reporting deadline (ARS 36-2402).
          </p>
        </div>
      )}
      {pendingIad.length > 0 && (
        <div className="bg-blue-950/20 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-700">
            <strong>{pendingIad.length} incident{pendingIad.length > 1 ? 's' : ''}</strong> require IAD state data submission.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">{open.length}</div>
          <div className="text-sm text-slate-500">Open Incidents</div>
        </div>
        <div className={`rounded-xl border p-4 ${sentinel.length > 0 ? 'bg-red-950/20 border-red-200' : 'bg-card border-border'}`}>
          <div className={`text-2xl font-bold ${sentinel.length > 0 ? 'text-red-600' : 'text-foreground'}`}>{sentinel.length}</div>
          <div className="text-sm text-slate-500">Sentinel Events</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdueAdhs.length > 0 ? 'bg-orange-950/20 border-orange-200' : 'bg-card border-border'}`}>
          <div className={`text-2xl font-bold ${overdueAdhs.length > 0 ? 'text-orange-600' : 'text-foreground'}`}>{overdueAdhs.length}</div>
          <div className="text-sm text-slate-500">Overdue ADHS Reports</div>
        </div>
        <div className={`rounded-xl border p-4 ${pendingIad.length > 0 ? 'bg-blue-950/20 border-blue-200' : 'bg-card border-border'}`}>
          <div className={`text-2xl font-bold ${pendingIad.length > 0 ? 'text-blue-600' : 'text-foreground'}`}>{pendingIad.length}</div>
          <div className="text-sm text-slate-500">Pending IAD Submissions</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">IR #</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Severity</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Patient / MRN</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Reporting</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground/70">
                    <FileWarning className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No incident reports logged yet.
                  </td>
                </tr>
              ) : (
                reports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-red-700">
                      <Link href={`/trackers/ir-iad/${r.id}`} className="hover:underline">{r.irNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(r.incidentDate)}</td>
                    <td className="px-4 py-3 text-foreground/80 whitespace-nowrap text-xs">
                      {r.incidentType.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${SEVERITY_COLORS[r.severity] ?? 'bg-slate-100 text-slate-600'}`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {r.patientName ? (
                        <span>
                          {r.patientName}
                          {r.patientMRN && <span className="text-muted-foreground/70"> · {r.patientMRN}</span>}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/70">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {r.adhsReportable && !r.adhsReported && r.adhsReportDue ? (
                          <DeadlineTag dueDate={r.adhsReportDue} label="ADHS" />
                        ) : r.adhsReported ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3 h-3" /> ADHS reported
                          </span>
                        ) : null}
                        {r.jcReportable && !r.jcReported && (
                          <span className="text-xs text-teal-600 font-medium">JC pending</span>
                        )}
                        {r.iadRequired && !r.iadSubmitted && (
                          <span className="text-xs text-blue-600 font-medium">IAD pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(r.severity === 'SENTINEL' || r.iadRequired) && !r.linkedRcaId && r.status !== 'CLOSED' && (
                        <Link
                          href={`/trackers/rca/new?fromIr=${r.id}&type=${encodeURIComponent(r.incidentType)}&date=${r.incidentDate.toISOString()}&desc=${encodeURIComponent(r.briefDescription?.slice(0, 200) ?? '')}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-teal-950/20 border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                          → Start RCA
                        </Link>
                      )}
                      {r.linkedRcaId && (
                        <Link
                          href={`/trackers/rca`}
                          className="inline-flex items-center gap-1 text-xs text-green-600 font-medium whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3 h-3" /> RCA linked
                        </Link>
                      )}
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
