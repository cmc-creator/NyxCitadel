import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Siren,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react';
import DrillWarRoomClient from '@/components/drills/DrillWarRoomClient';
import { formatDate } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED:   'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-red-100 text-red-700 animate-pulse',
  COMPLETED:   'bg-emerald-100 text-emerald-700',
  CANCELLED:   'bg-slate-100 text-slate-500',
  RESCHEDULED: 'bg-orange-100 text-orange-700',
};

export default async function DrillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const drill = await prisma.drill.findFirst({
    where: { id: params.id, facilityId },
    include: {
      drillActions: { orderBy: { timestamp: 'asc' } },
    },
  });

  if (!drill) notFound();

  const issueCount   = drill.drillActions.filter((a) => a.issueFlag).length;
  const actionCount  = drill.drillActions.length;

  // Serialize for client component
  const serializedActions = drill.drillActions.map((a) => ({
    id:           a.id,
    timestamp:    a.timestamp.toISOString(),
    actor:        a.actor,
    actionType:   a.actionType,
    description:  a.description,
    outcomeNotes: a.outcomeNotes,
    issueFlag:    a.issueFlag,
  }));

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/emergency/drills"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Drills
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Siren className="w-6 h-6 text-red-600" />
            {drill.drillName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{drill.drillType.replace(/_/g, ' ')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${STATUS_STYLES[drill.status] ?? 'bg-slate-100 text-slate-500'}`}
          >
            {drill.status.replace('_', ' ')}
          </span>
          {drill.status === 'COMPLETED' && !drill.aarGeneratedAt && (
            <Link
              href={`/emergency/drills/${drill.id}/aar`}
              className="inline-flex items-center gap-1 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> Generate AAR
            </Link>
          )}
          {drill.aarGeneratedAt && (
            <Link
              href={`/emergency/drills/${drill.id}/aar`}
              className="inline-flex items-center gap-1 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5" /> View AAR
            </Link>
          )}
        </div>
      </div>

      {/* Drill Meta Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoCard icon={<Calendar className="w-4 h-4 text-slate-400" />} label="Scheduled" value={formatDate(drill.scheduledDate)} />
        {drill.conductedDate && (
          <InfoCard icon={<Clock className="w-4 h-4 text-slate-400" />} label="Conducted" value={formatDate(drill.conductedDate)} />
        )}
        {drill.location && (
          <InfoCard icon={<MapPin className="w-4 h-4 text-slate-400" />} label="Location" value={drill.location} />
        )}
        {drill.participantCount != null && (
          <InfoCard icon={<Users className="w-4 h-4 text-slate-400" />} label="Participants" value={String(drill.participantCount)} />
        )}
        <InfoCard icon={<ClipboardList className="w-4 h-4 text-slate-400" />} label="Actions Logged" value={String(actionCount)} />
        {issueCount > 0 && (
          <InfoCard icon={<AlertTriangle className="w-4 h-4 text-orange-400" />} label="Issues Flagged" value={String(issueCount)} highlight />
        )}
        {drill.observer && (
          <InfoCard icon={<Users className="w-4 h-4 text-slate-400" />} label="Observer" value={drill.observer} />
        )}
      </div>

      {/* Scenario & Objectives */}
      {(drill.scenario || drill.objectives) && (
        <div className="grid md:grid-cols-2 gap-4">
          {drill.scenario && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Scenario</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{drill.scenario}</p>
            </div>
          )}
          {drill.objectives && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Objectives</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{drill.objectives}</p>
            </div>
          )}
        </div>
      )}

      {/* Completed findings */}
      {drill.status === 'COMPLETED' && (drill.strengths || drill.improvements) && (
        <div className="grid md:grid-cols-2 gap-4">
          {drill.strengths && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{drill.strengths}</p>
            </div>
          )}
          {drill.improvements && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Areas for Improvement
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{drill.improvements}</p>
            </div>
          )}
        </div>
      )}

      {/* War Room */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Siren className="w-5 h-5 text-red-500" />
          War Room — Live Action Log
          {drill.status !== 'CANCELLED' && (
            <span className="text-xs font-normal text-slate-400">
              (log events in real-time during the drill)
            </span>
          )}
        </h2>
        <DrillWarRoomClient
          drillId={drill.id}
          initialActions={serializedActions}
          drillStatus={drill.status}
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-1.5 mb-1">{icon}</div>
      <p className={`text-sm font-semibold ${highlight ? 'text-orange-700' : 'text-slate-800'}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
