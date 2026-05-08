import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AlertTriangle, Plus, Download } from 'lucide-react';
import Link from 'next/link';
import { PrintButton } from '@/components/ui/PrintButton';
import { IncidentsListClient } from '@/components/trackers/IncidentsListClient';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-teal-600" />
            Incident / Occurrence Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {incidents.length} total · {openCount} open · {reportableCount} pending state report
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/api/export/incidents"
            className="inline-flex items-center gap-1.5 text-sm bg-card border border-border hover:bg-accent/50 text-foreground/80 px-3 py-1.5 rounded-lg font-medium transition-colors"
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
                : 'bg-card border border-border text-muted-foreground hover:bg-accent/50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <IncidentsListClient incidents={incidents} />
    </div>
  );
}
