import Link from 'next/link';
import { Wrench, Flame, Zap, Wind, Lock, AlertTriangle, CheckCircle2, Clock, Filter } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const fmt = (d: Date | string | null): string | null =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : null;

const categoryIcon: Record<string, React.ElementType> = {
  FIRE_SUPPRESSION: Flame,
  FIRE_ALARM: Flame,
  EMERGENCY_LIGHTING: Zap,
  GENERATOR: Zap,
  HVAC: Wind,
  MEDICAL_GAS: Wind,
  ELEVATOR: Wrench,
  SECURITY_SYSTEM: Lock,
  PLUMBING: Wrench,
  ELECTRICAL: Zap,
  MEDICAL_EQUIPMENT: Wrench,
  NURSE_CALL: Wrench,
  DOOR_HARDWARE: Lock,
};

const categoryColor: Record<string, string> = {
  FIRE_SUPPRESSION: 'text-red-400',
  FIRE_ALARM: 'text-red-400',
  EMERGENCY_LIGHTING: 'text-amber-400',
  GENERATOR: 'text-orange-400',
  HVAC: 'text-sky-400',
  SECURITY_SYSTEM: 'text-purple-400',
  PLUMBING: 'text-teal-400',
  ELECTRICAL: 'text-yellow-400',
  NURSE_CALL: 'text-blue-400',
  ELEVATOR: 'text-slate-400',
  MEDICAL_EQUIPMENT: 'text-emerald-400',
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OVERDUE: { label: 'OVERDUE', color: 'bg-red-950/40 text-red-400 border border-red-700/40', icon: AlertTriangle },
  DUE_SOON: { label: 'DUE SOON', color: 'bg-amber-950/40 text-amber-400 border border-amber-700/40', icon: Clock },
  UPCOMING: { label: 'UPCOMING', color: 'bg-sky-950/40 text-sky-400 border border-sky-700/40', icon: Clock },
  IN_PROGRESS: { label: 'IN PROGRESS', color: 'bg-purple-950/40 text-purple-400 border border-purple-700/40', icon: Wrench },
  COMPLETED: { label: 'COMPLETED', color: 'bg-emerald-950/40 text-emerald-400 border border-emerald-700/40', icon: CheckCircle2 },
};

const frequencyLabel: Record<string, string> = {
  WEEKLY: 'Weekly', MONTHLY: 'Monthly', QUARTERLY: 'Quarterly',
  SEMI_ANNUAL: 'Semi-Annual', ANNUAL: 'Annual', AS_NEEDED: 'As Needed',
};

const STATUS_FILTERS = ['ALL', 'OVERDUE', 'DUE_SOON', 'UPCOMING', 'COMPLETED'] as const;

export default async function EquipmentPmPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await auth();
  if (!session?.user?.facilityId) redirect('/login');
  const { facilityId } = session.user;

  const statusFilter = searchParams?.status ?? 'ALL';
  const where: Record<string, unknown> = { facilityId };
  if (statusFilter !== 'ALL') where.status = statusFilter;

  const [allEquipment, filtered] = await Promise.all([
    prisma.equipmentPm.findMany({ where: { facilityId }, orderBy: { nextServiceDate: 'asc' } }),
    prisma.equipmentPm.findMany({ where, orderBy: { nextServiceDate: 'asc' } }),
  ]);

  const countByStatus = (s: string) => allEquipment.filter(e => e.status === s).length;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-slate-400 hover:text-slate-300">Environment of Care</Link>
            <span className="text-slate-600">›</span>
            <span className="text-sm text-foreground font-medium">Equipment PM</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Equipment Preventive Maintenance</h1>
          <p className="text-sm text-slate-400 mt-0.5">Fire systems, utilities, HVAC, elevators, and clinical support equipment schedules</p>
        </div>
        <a href="/eoc/equipment/new" className="px-3 py-1.5 text-sm rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors">
          + Add Equipment
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Overdue', key: 'OVERDUE', color: 'text-red-400', bg: 'border-red-700/40 bg-red-950/30' },
          { label: 'Due Soon', key: 'DUE_SOON', color: 'text-amber-400', bg: 'border-amber-700/40 bg-amber-950/30' },
          { label: 'Upcoming', key: 'UPCOMING', color: 'text-sky-400', bg: 'border-sky-700/40 bg-sky-950/30' },
          { label: 'In Progress', key: 'IN_PROGRESS', color: 'text-purple-400', bg: 'border-purple-700/40 bg-purple-950/30' },
          { label: 'Completed', key: 'COMPLETED', color: 'text-emerald-400', bg: 'border-emerald-700/40 bg-emerald-950/30' },
        ].map(s => (
          <div key={s.key} className={`p-3 rounded-lg border text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{countByStatus(s.key)}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        {STATUS_FILTERS.map(s => (
          <a
            key={s}
            href={s === 'ALL' ? '/eoc/equipment' : `/eoc/equipment?status=${s}`}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
          </a>
        ))}
        <span className="ml-auto text-xs text-slate-500">{filtered.length} items</span>
      </div>

      {/* Equipment list */}
      <div className="space-y-2">
        {filtered.map(e => {
          const Icon = categoryIcon[e.category] ?? Wrench;
          const iconColor = categoryColor[e.category] ?? 'text-slate-400';
          const sc = statusConfig[e.status] ?? statusConfig.UPCOMING;
          const StatusIcon = sc.icon;
          const isOverdue = e.status === 'OVERDUE';
          return (
            <div key={e.id} className={`p-4 rounded-xl border bg-card transition-colors hover:border-slate-500/50 ${isOverdue ? 'border-red-700/30' : 'border-border'}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-slate-900/60 shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">{e.equipmentName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{e.location} · <span className="text-slate-600">{e.equipmentId ?? '—'}</span></p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{frequencyLabel[e.frequency] ?? e.frequency}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${sc.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sc.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                    <span>Last service: <span className={`font-medium ${e.lastServiceDate ? 'text-slate-300' : 'text-red-400'}`}>{fmt(e.lastServiceDate) ?? 'Never'}</span></span>
                    <span>Next due: <span className={`font-medium ${isOverdue ? 'text-red-400' : e.status === 'DUE_SOON' ? 'text-amber-400' : 'text-slate-300'}`}>{fmt(e.nextServiceDate)}</span></span>
                    {e.vendor && <span>Vendor: <span className="text-slate-400">{e.vendor}</span></span>}
                    {e.contactPhone && <span><span className="text-slate-400">{e.contactPhone}</span></span>}
                  </div>
                  {e.notes && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{e.notes}</p>}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-10">No equipment records found.</p>
        )}
      </div>
    </div>
  );
}
