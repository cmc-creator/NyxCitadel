import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MessageSquareWarning, Plus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Patient Grievance Tracker' };

const STATUS_COLORS: Record<string, string> = {
  OPEN:                 'bg-red-500/10 text-red-300',
  UNDER_REVIEW:         'bg-yellow-500/10 text-yellow-300',
  ACKNOWLEDGMENT_SENT:  'bg-blue-500/10 text-blue-300',
  PENDING_RESOLUTION:   'bg-orange-500/10 text-orange-300',
  RESOLVED:             'bg-green-500/10 text-green-300',
  ESCALATED:            'bg-red-500/20 text-red-300',
  CLOSED:               'bg-muted/30 text-muted-foreground',
};

const SEVERITY_COLORS: Record<string, string> = {
  STANDARD:       'bg-muted/30 text-muted-foreground',
  EXPEDITED:      'bg-orange-500/10 text-orange-300',
  REGULATORY:     'bg-red-500/10 text-red-300',
  SENTINEL:       'bg-red-500/20 text-red-300 font-bold',
};

function DaysIndicator({ dueDate, label }: { dueDate: Date; label: string }) {
  const now = new Date();
  const diff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diff < 0;
  const isUrgent = diff >= 0 && diff <= 2;

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      isOverdue ? 'bg-red-500/10 text-red-300 font-semibold' :
      isUrgent  ? 'bg-orange-500/10 text-orange-300 font-medium' :
                  'bg-muted/30 text-muted-foreground'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-orange-500" />
            Patient Grievance Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
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
          <p className="text-sm text-amber-300">
            <strong>{year} Archive View</strong> - showing grievances received within {year}.
          </p>
          <Link href="/trackers/grievances" className="text-xs text-amber-400 underline">Return to live view</Link>
        </div>
      )}

      {/* Alert banners */}
      {overdueAck.length > 0 && (
        <div className="bg-red-950/20 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-300">
            <strong>{overdueAck.length} grievance{overdueAck.length > 1 ? 's' : ''}</strong> past the 7-day acknowledgment deadline (42 CFR 482.13(e)).
          </p>
        </div>
      )}
      {overdueRes.length > 0 && (
        <div className="bg-orange-950/20 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
          <p className="text-sm text-orange-300">
            <strong>{overdueRes.length} grievance{overdueRes.length > 1 ? 's' : ''}</strong> past the 30-day resolution deadline (42 CFR 482.13(e)).
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-foreground">{open.length}</div>
          <div className="text-sm text-muted-foreground">Open Grievances</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdueAck.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-card border-border'}`}>
          <div className={`text-2xl font-bold ${overdueAck.length > 0 ? 'text-red-300' : 'text-foreground'}`}>{overdueAck.length}</div>
          <div className="text-sm text-muted-foreground">Overdue Acknowledgments</div>
        </div>
        <div className={`rounded-xl border p-4 ${overdueRes.length > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-card border-border'}`}>
          <div className={`text-2xl font-bold ${overdueRes.length > 0 ? 'text-orange-300' : 'text-foreground'}`}>{overdueRes.length}</div>
          <div className="text-sm text-muted-foreground">Overdue Resolutions</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-2xl font-bold text-green-400">
            {grievances.filter(g => g.status === 'RESOLVED' || g.status === 'CLOSED').length}
          </div>
          <div className="text-sm text-muted-foreground">Resolved / Closed</div>
        </div>
      </div>

      {/* Table */}
      {grievances.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <MessageSquareWarning className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No grievances logged yet</p>
          <Link
            href="/trackers/grievances/new"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Log First Grievance
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Complainant / Patient</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Deadlines</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Received</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {grievances.map(g => {
                const isClosed = g.status === 'CLOSED' || g.status === 'RESOLVED';
                return (
                  <tr key={g.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground/70">{g.grievanceNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{g.complainantName}</div>
                      {g.patientName && <div className="text-xs text-muted-foreground/70">Patient: {g.patientName}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-muted-foreground/70">{g.category.replace(/_/g, ' ')}</div>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${SEVERITY_COLORS[g.severity] ?? ''}`}>
                        {g.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[g.status] ?? 'bg-muted/30 text-muted-foreground'}`}>
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
                    <td className="px-4 py-3 text-xs text-muted-foreground/70">{formatDate(g.dateReceived)}</td>
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
