import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, Plus, Download } from 'lucide-react';
import Link from 'next/link';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Incident Tracker' };

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const incidents = await prisma.incident.findMany({
    where: {
      facilityId,
      ...(searchParams.status ? { status: searchParams.status as never } : {}),
      ...(searchParams.type ? { incidentType: searchParams.type as never } : {}),
    },
    orderBy: { dateOccurred: 'desc' },
    include: { cap: { select: { id: true, capNumber: true, status: true } } },
  });

  const openCount = incidents.filter((i) => i.status !== 'CLOSED').length;
  const reportableCount = incidents.filter(
    (i) => i.reportableToState && !i.reportedToState
  ).length;

  const severityColor: Record<string, string> = {
    MINOR: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    MAJOR: 'bg-orange-100 text-orange-800',
    CATASTROPHIC: 'bg-red-100 text-red-800',
    SENTINEL: 'bg-red-600 text-white',
  };

  const statusColor: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    UNDER_INVESTIGATION: 'bg-yellow-100 text-yellow-800',
    RCA_IN_PROGRESS: 'bg-orange-100 text-orange-800',
    CAP_IN_PROGRESS: 'bg-teal-100 text-teal-800',
    CLOSED: 'bg-gray-100 text-gray-600',
    REPORTABLE_PENDING: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-teal-600" />
            Incident / Occurrence Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {incidents.length} total · {openCount} open · {reportableCount} pending state report
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/api/export/incidents"
            className="inline-flex items-center gap-1.5 text-sm bg-card border border-border hover:bg-slate-50 text-foreground/80 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Link>
          <PrintButton />
          <Link
            href="/trackers/incidents/new"
            className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Incident Report
          </Link>
        </div>
      </div>

      {reportableCount > 0 && (
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <span className="font-bold">{reportableCount} incidents</span> are reportable to the state and have not been reported yet.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { href: '/trackers/incidents', label: `All (${incidents.length})`, active: !searchParams.status },
          { href: '/trackers/incidents?status=OPEN', label: `Open (${openCount})`, active: searchParams.status === 'OPEN' },
          { href: '/trackers/incidents?status=REPORTABLE_PENDING', label: `Reportable Pending (${reportableCount})`, active: searchParams.status === 'REPORTABLE_PENDING' },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              tab.active
                ? 'bg-teal-600 text-white'
                : 'bg-card border border-border text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Incident #</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Severity</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Description</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Reportable</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">CAP</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground/70">
                  No incidents found. <Link href="/trackers/incidents/new" className="text-teal-600 hover:underline">File a new incident report</Link>
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    <Link href={`/trackers/incidents/${incident.id}`} className="text-teal-600 hover:underline">
                      {incident.incidentNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {formatDate(incident.dateOccurred)}
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground/80">
                    {incident.incidentType.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityColor[incident.severity] ?? ''}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-xs truncate">
                    {incident.description}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {incident.reportableToState ? (
                      <span className={`font-medium ${incident.reportedToState ? 'text-green-600' : 'text-red-600'}`}>
                        {incident.reportedToState ? `Reported ${formatDate(incident.stateReportDate)}` : '⚠ Not Reported'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/70">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {incident.cap ? (
                      <Link href={`/trackers/caps`} className="text-teal-600 hover:underline font-mono">
                        {incident.cap.capNumber}
                      </Link>
                    ) : incident.correctionRequired ? (
                      <Link href={`/trackers/caps/new?incidentId=${incident.id}`} className="text-orange-600 hover:underline">
                        Create CAP
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/70">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[incident.status] ?? ''}`}>
                      {incident.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
