import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Search, Plus, Clock, ClipboardList, Repeat } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Root Cause Analyses' };

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS:     'bg-yellow-100 text-yellow-700',
  DRAFT_COMPLETE:  'bg-blue-100 text-blue-700',
  UNDER_REVIEW:    'bg-orange-100 text-orange-700',
  APPROVED:        'bg-green-100 text-green-700',
  SUBMITTED_TO_JC: 'bg-purple-100 text-purple-700',
  CLOSED:          'bg-slate-100 text-slate-500',
};

export default async function RcaPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const yearStart = year ? new Date(year, 0, 1) : null;
  const yearEnd   = year ? new Date(year + 1, 0, 1) : null;

  const rcas = await prisma.rootCauseAnalysis.findMany({
    where: {
      facilityId,
      ...(yearStart && yearEnd ? { eventDate: { gte: yearStart, lt: yearEnd } } : {}),
    },
    orderBy: { eventDate: 'desc' },
  });

  const inProgress = rcas.filter(r => r.status === 'IN_PROGRESS' || r.status === 'DRAFT_COMPLETE');
  const approved   = rcas.filter(r => r.status === 'APPROVED' || r.status === 'SUBMITTED_TO_JC' || r.status === 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-600" />
            Root Cause Analyses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            JC LD.04.04.05 - Required for sentinel events and serious adverse events.
          </p>
        </div>
        <Link
          href="/trackers/rca/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New RCA
        </Link>
      </div>

      {/* Archive year banner */}
      {year && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{year} Archive View</strong> - showing RCAs with event date within {year}.
          </p>
          <Link href="/trackers/rca" className="text-xs text-amber-700 underline">Return to live view</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">{inProgress.length}</div>
          <div className="text-sm text-slate-500">In Progress</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">{approved.length}</div>
          <div className="text-sm text-slate-500">Approved / Closed</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-purple-600">
            {rcas.filter(r => r.status === 'SUBMITTED_TO_JC').length}
          </div>
          <div className="text-sm text-slate-500">Submitted to JC</div>
        </div>
      </div>

      {/* List */}
      {rcas.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No root cause analyses yet</p>
          <Link
            href="/trackers/rca/new"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Start First RCA
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rcas.map(rca => (
            <div key={rca.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">{rca.rcaNumber}</span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{rca.eventType}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[rca.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {rca.status.replace(/_/g, ' ')}
                    </span>
                    {rca.systemChangesRequired && (
                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">System changes needed</span>
                    )}
                  </div>
                  <p className="text-slate-700 mt-1 text-sm line-clamp-2">{rca.eventDescription}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                    <span>Event: {formatDate(rca.eventDate)}</span>
                    {rca.completedBy && <span>By: {rca.completedBy}</span>}
                    {rca.conductedDate && <span>Conducted: {formatDate(rca.conductedDate)}</span>}
                    {rca.linkedIncidentId && <span>Linked to incident</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(rca.status === 'APPROVED' || rca.status === 'SUBMITTED_TO_JC' || rca.status === 'CLOSED') &&
                    rca.systemChangesRequired && (
                    <Link
                      href={`/trackers/caps/new?fromRca=${rca.id}&title=${encodeURIComponent(`CAP: ${rca.eventType}`)}&source=INCIDENT&desc=${encodeURIComponent((rca.conclusion ?? '').slice(0, 200))}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                    >
                      <ClipboardList className="w-3.5 h-3.5" /> → Create CAP
                    </Link>
                  )}
                  {/* PDSA cycle launch - for approved RCAs where system-level change is needed */}
                  {(rca.status === 'APPROVED' || rca.status === 'SUBMITTED_TO_JC' || rca.status === 'CLOSED') && (
                    <Link
                      href={`/trackers/caps/new?fromRca=${rca.id}&isPdsa=true&title=${encodeURIComponent(`PDSA: ${rca.eventType}`)}&source=INCIDENT&desc=${encodeURIComponent((rca.conclusion ?? '').slice(0, 200))}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors whitespace-nowrap"
                    >
                      <Repeat className="w-3.5 h-3.5" /> → Launch PDSA
                    </Link>
                  )}

                  <Link
                    href={`/trackers/rca/${rca.id}`}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium shrink-0"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
