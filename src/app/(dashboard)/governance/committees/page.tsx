import { Users, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CommitteeMeetingsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const meetings = await prisma.committeeMeeting.findMany({
    where: { facilityId },
    orderBy: { meetingDate: 'desc' },
    take: 60,
  });

  const noQuorum = meetings.filter(m => !m.quorumMet).length;
  const pendingMinutes = meetings.filter(m => !m.minutesApprovedDate).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Committee Meetings</h1>
          </div>
          <p className="text-muted-foreground/70 text-sm">Track committee quorum, minutes approval, and action items.</p>
        </div>
        <a href="/governance/committees/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log Meeting
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Meetings', value: meetings.length, color: 'text-teal-400' },
          { label: 'Pending Minutes Approval', value: pendingMinutes, color: pendingMinutes > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Quorum Not Met', value: noQuorum, color: noQuorum > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-muted-foreground/70 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {meetings.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-8 text-center text-muted-foreground text-sm">No committee meetings on record.</div>
        ) : meetings.map(m => {
          const actionItems = (m.actionItems as unknown[]) ?? [];
          return (
            <div key={m.id} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-white">{m.committeeType}</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">{m.meetingDate.toLocaleDateString()} {m.chair ? `- Chair: ${m.chair}` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  {m.quorumMet
                    ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Quorum Met</span>
                    : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">No Quorum</span>}
                  {m.minutesApprovedDate
                    ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Minutes Approved</span>
                    : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pending Minutes</span>}
                </div>
              </div>
              {actionItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-muted-foreground mb-1">{actionItems.length} action item(s)</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
