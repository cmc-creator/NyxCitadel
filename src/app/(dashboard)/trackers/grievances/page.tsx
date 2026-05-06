import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquareWarning, Plus, AlertCircle } from 'lucide-react';
import { GrievancesListClient } from '@/components/trackers/GrievancesListClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Patient Grievance Tracker' };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
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
        <div className="bg-amber-950/20 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{year} Archive View</strong> - showing grievances received within {year}.
          </p>
          <Link href="/trackers/grievances" className="text-xs text-amber-700 underline">Return to live view</Link>
        </div>
      )}

      {/* Alert banners */}
      {overdueAck.length > 0 && (
        <div className="bg-red-950/20 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            <strong>{overdueAck.length} grievance{overdueAck.length > 1 ? 's' : ''}</strong> past the 7-day acknowledgment deadline (42 CFR 482.13(e)).
          </p>
        </div>
      )}
      {overdueRes.length > 0 && (
        <div className="bg-orange-950/20 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-700">
            <strong>{overdueRes.length} grievance{overdueRes.length > 1 ? 's' : ''}</strong> past the 30-day resolution deadline (42 CFR 482.13(e)).
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">{open.length}</div>
          <div className="text-sm text-slate-500">Open Grievances</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdueAck.length > 0 ? 'bg-red-950/20 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-2xl font-bold ${overdueAck.length > 0 ? 'text-red-600' : 'text-foreground'}`}>{overdueAck.length}</div>
          <div className="text-sm text-slate-500">Overdue Acknowledgments</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdueRes.length > 0 ? 'bg-orange-950/20 border-orange-200' : 'bg-white border-slate-200'}`}>
          <div className={`text-2xl font-bold ${overdueRes.length > 0 ? 'text-orange-600' : 'text-foreground'}`}>{overdueRes.length}</div>
          <div className="text-sm text-slate-500">Overdue Resolutions</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-green-600">
            {grievances.filter(g => g.status === 'RESOLVED' || g.status === 'CLOSED').length}
          </div>
          <div className="text-sm text-slate-500">Resolved / Closed</div>
        </div>
      </div>

      {/* Table */}
      <GrievancesListClient grievances={grievances} />
    </div>
  );
}
