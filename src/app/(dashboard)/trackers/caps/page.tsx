import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import { ClipboardList, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { isPast } from 'date-fns';

export const metadata = { title: 'Corrective Action Plans' };

export default async function CapsPage({
  searchParams,
}: {
  searchParams: { status?: string; year?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const yearStart = year ? new Date(year, 0, 1) : null;
  const yearEnd   = year ? new Date(year + 1, 0, 1) : null;

  const caps = await prisma.correctiveActionPlan.findMany({
    where: {
      facilityId,
      ...(searchParams.status ? { status: searchParams.status as never } : {}),
      ...(yearStart && yearEnd ? { createdAt: { gte: yearStart, lt: yearEnd } } : {}),
    },
    orderBy: [{ status: 'asc' }, { targetDate: 'asc' }],
    include: {
      assignee: { select: { name: true, email: true } },
    },
  });

  const overdueCount = caps.filter(
    (c) =>
      isPast(c.targetDate) &&
      !['COMPLETED', 'VERIFIED'].includes(c.status)
  ).length;

  const statusColor: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    VERIFIED: 'bg-teal-100 text-teal-800',
    OVERDUE: 'bg-red-100 text-red-800',
    EXTENDED: 'bg-orange-100 text-orange-800',
  };

  const sourceColor: Record<string, string> = {
    SURVEY_FINDING: 'bg-red-50 text-red-700',
    INCIDENT: 'bg-orange-50 text-orange-700',
    INTERNAL_AUDIT: 'bg-blue-50 text-blue-700',
    COMPLAINT: 'bg-yellow-50 text-yellow-700',
    SENTINEL_EVENT: 'bg-red-100 text-red-900',
    DEFAULT: 'bg-slate-50 text-slate-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-purple-600" />
            Corrective Action Plans
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {caps.length} total · {overdueCount} overdue
          </p>
        </div>
        <Link
          href="/trackers/caps/new"
          className="inline-flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New CAP
        </Link>
      </div>

      {/* Archive year banner */}
      {year && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{year} Archive View</strong> — showing CAPs created within {year}.
          </p>
          <Link href="/trackers/caps" className="text-xs text-amber-700 underline">Return to live view</Link>
        </div>
      )}

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <span className="font-bold">{overdueCount} corrective action plans</span> are past their target completion date.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { href: '/trackers/caps', label: `All (${caps.length})`, active: !searchParams.status },
          { href: '/trackers/caps?status=OPEN', label: 'Open', active: searchParams.status === 'OPEN' },
          { href: '/trackers/caps?status=IN_PROGRESS', label: 'In Progress', active: searchParams.status === 'IN_PROGRESS' },
          { href: '/trackers/caps?status=OVERDUE', label: `Overdue (${overdueCount})`, active: searchParams.status === 'OVERDUE' },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              tab.active
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Cards grid for CAPs */}
      <div className="grid gap-4">
        {caps.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-medium">No corrective action plans found.</p>
            <p className="text-sm mt-1">
              <Link href="/trackers/caps/new" className="text-purple-600 hover:underline">
                Create your first CAP
              </Link>
            </p>
          </div>
        ) : (
          caps.map((cap) => {
            const isOverdue = isPast(cap.targetDate) && !['COMPLETED', 'VERIFIED'].includes(cap.status);
            const { label: dueLabel, className: dueClass } = getDueDateStatus(cap.targetDate);
            return (
              <div
                key={cap.id}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono text-slate-500">{cap.capNumber}</span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded ${
                          sourceColor[cap.source] ?? sourceColor.DEFAULT
                        }`}
                      >
                        {cap.source.replace(/_/g, ' ')}
                      </span>
                      {cap.regulatoryBody && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {cap.regulatoryBody.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900">{cap.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{cap.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>Assignee: {cap.assignee?.name ?? cap.assignee?.email ?? 'Unassigned'}</span>
                      {cap.sourceRef && <span>Ref: {cap.sourceRef}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[cap.status] ?? ''}`}>
                      {cap.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      isOverdue ? 'status-overdue' : dueClass
                    }`}>
                      {isOverdue ? `Overdue · ${formatDate(cap.targetDate)}` : `Due ${formatDate(cap.targetDate)}`}
                    </span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded priority-${cap.priority.toLowerCase()}`}>
                      {cap.priority}
                    </span>
                  </div>
                </div>
                {cap.correctionPlan && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-1">Correction Plan:</p>
                    <p className="text-sm text-slate-700 line-clamp-2">{cap.correctionPlan}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
