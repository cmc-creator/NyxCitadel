import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Siren,
  TrendingUp,
  TrendingDown,
  Users,
  ClipboardList,
  FileWarning,
  Scale,
  MessageSquareWarning,
  GraduationCap,
  Zap,
  Activity,
  Minus,
} from 'lucide-react';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import Link from 'next/link';
import { addDays } from 'date-fns';

export const metadata = { title: 'Dashboard' };

async function getDashboardStats(facilityId: string) {
  const now = new Date();
  const in30Days = addDays(now, 30);
  const in60Days = addDays(now, 60);
  const in2Days  = addDays(now, 2);
  const currentYear = now.getFullYear();
  const yearStart = new Date(currentYear, 0, 1);

  const [
    overdueEvents,
    upcomingEvents30,
    openCaps,
    overduePolicies,
    expiringTraining30,
    recentEvents,
    openIrIad, sentinelIrIad, adhsOverdue, pendingIad, iadUrgent,
    openQoc, qocOverdueResponse, qocImmediateJeopardy,
    openGrievances, grievanceOverdueAck, grievanceOverdueRes,
    policiesDue30, policiesDue60,
    totalRequiredTraining, completedTraining,
    drillsThisYear,
    recentQapiMetrics,
    sentinelIncidents,
    overdueCapCount,
  ] = await Promise.all([
    prisma.calendarEvent.count({ where: { facilityId, dueDate: { lt: now }, completedDate: null, status: { not: 'COMPLETED' } } }),
    prisma.calendarEvent.count({ where: { facilityId, dueDate: { gte: now, lte: in30Days }, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } } }),
    prisma.policy.count({ where: { facilityId, nextReviewDate: { lt: now }, status: 'ACTIVE' } }),
    prisma.trainingRecord.count({ where: { facilityId, expiryDate: { gte: now, lte: in30Days }, status: { not: 'EXEMPT' } } }),
    prisma.calendarEvent.findMany({ where: { facilityId, dueDate: { gte: now }, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } }, orderBy: { dueDate: 'asc' }, take: 6 }),
    // IR/IAD
    prisma.incidentReport.count({ where: { facilityId, status: { notIn: ['CLOSED'] } } }),
    prisma.incidentReport.count({ where: { facilityId, severity: 'SENTINEL', status: { not: 'CLOSED' } } }),
    prisma.incidentReport.count({ where: { facilityId, adhsReportable: true, adhsReported: false, adhsReportDue: { lt: now } } }),
    prisma.incidentReport.count({ where: { facilityId, iadRequired: true, iadSubmitted: false, status: { not: 'CLOSED' } } }),
    prisma.incidentReport.count({ where: { facilityId, adhsReportable: true, adhsReported: false, adhsReportDue: { gte: now, lte: in2Days } } }),
    // QOC
    prisma.qocComplaint.count({ where: { facilityId, status: { notIn: ['CLOSED', 'UNSUBSTANTIATED'] } } }),
    prisma.qocComplaint.count({ where: { facilityId, status: 'LOI_RECEIVED', responseSubmittedDate: null, responseDueDate: { lt: now } } }),
    prisma.qocComplaint.count({ where: { facilityId, investigationType: 'IMMEDIATE_JEOPARDY', status: { notIn: ['CLOSED', 'UNSUBSTANTIATED'] } } }),
    // Grievances
    prisma.grievanceRecord.count({ where: { facilityId, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
    prisma.grievanceRecord.count({ where: { facilityId, acknowledgmentDate: null, acknowledgmentDueDate: { lt: now }, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
    prisma.grievanceRecord.count({ where: { facilityId, resolutionDate: null, resolutionDueDate: { lt: now }, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
    // Policies
    prisma.policy.count({ where: { facilityId, nextReviewDate: { gte: now, lte: in30Days }, status: { notIn: ['ARCHIVED'] } } }),
    prisma.policy.count({ where: { facilityId, nextReviewDate: { gte: now, lte: in60Days }, status: { notIn: ['ARCHIVED'] } } }),
    // Training
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: { not: 'EXEMPT' } } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: 'COMPLETED' } }),
    // Drills
    prisma.drill.findMany({ where: { facilityId, scheduledDate: { gte: yearStart } }, select: { drillType: true, status: true } }),
    // QAPI
    prisma.qapiMetric.findMany({
      where: { facilityId, year: { gte: now.getFullYear() - 1 }, metricKey: { in: ['restraint_rate', 'fall_rate', 'elopement_count', 'medication_error_rate', 'patient_satisfaction'] } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 20,
    }),
    prisma.incident.count({ where: { facilityId, severity: 'SENTINEL', status: { not: 'CLOSED' } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, targetDate: { lt: now }, status: { notIn: ['COMPLETED', 'VERIFIED'] } } }),
  ]);

  const trainingCompliancePct = totalRequiredTraining > 0
    ? Math.round((completedTraining / totalRequiredTraining) * 100) : null;
  const fireDrills  = drillsThisYear.filter((d: { drillType: string; status: string }) => d.drillType === 'FIRE_EVACUATION' && d.status === 'COMPLETED').length;
  const tabletops   = drillsThisYear.filter((d: { drillType: string; status: string }) => d.drillType === 'TABLETOP' && d.status === 'COMPLETED').length;
  const functional  = drillsThisYear.filter((d: { drillType: string; status: string }) => ['FUNCTIONAL_DRILL', 'FULL_SCALE'].includes(d.drillType) && d.status === 'COMPLETED').length;

  const latestMetrics: Record<string, { value: number; target?: number; prev?: number }> = {};
  for (const m of recentQapiMetrics) {
    if (!latestMetrics[m.metricKey]) {
      latestMetrics[m.metricKey] = { value: m.value, target: m.target ?? undefined };
    } else if (latestMetrics[m.metricKey].prev === undefined) {
      latestMetrics[m.metricKey].prev = m.value;
    }
  }

  return {
    overdueEvents, upcomingEvents30, openCaps, overduePolicies, expiringTraining30, recentEvents,
    openIrIad, sentinelIrIad, adhsOverdue, pendingIad, iadUrgent,
    openQoc, qocOverdueResponse, qocImmediateJeopardy,
    openGrievances, grievanceOverdueAck, grievanceOverdueRes,
    policiesDue30, policiesDue60,
    trainingCompliancePct, fireDrills, tabletops, functional,
    latestMetrics,
    totalSentinels: sentinelIrIad + sentinelIncidents,
    overdueCapCount,
  };
}

// ─── Trend Icon ─────────────────────────────────────────────────────────────
function TrendIcon({ value, prev, higherIsBetter = false }: { value: number; prev?: number; higherIsBetter?: boolean }) {
  if (prev === undefined) return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  const improved = higherIsBetter ? value >= prev : value <= prev;
  if (value === prev) return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  return improved
    ? <TrendingDown className="w-3.5 h-3.5 text-green-500" />
    : <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ value, max, label, sublabel }: { value: number; max: number; label: string; sublabel?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor = pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-500">{value}/{max} <span className="font-semibold text-slate-700">{pct}%</span></span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const s = await getDashboardStats(facilityId);

  const urgentCount = s.totalSentinels + s.adhsOverdue + s.qocImmediateJeopardy + s.grievanceOverdueAck + s.grievanceOverdueRes + s.qocOverdueResponse + s.overdueCapCount;
  const watchCount  = s.iadUrgent + s.pendingIad + s.openIrIad + s.openQoc + s.openGrievances + s.overduePolicies;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance Command Center</h1>
          <p className="text-sm text-slate-500 mt-0.5">Destiny Springs Healthcare · {formatDate(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/quality/metrics" className="inline-flex items-center gap-1.5 text-sm text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors">
            <Activity className="w-3.5 h-3.5" /> QAPI Metrics
          </Link>
          <Link href="/calendar" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <CalendarDays className="w-4 h-4" /> Calendar
          </Link>
        </div>
      </div>

      {/* RED ZONE */}
      {urgentCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-red-800">Requires Immediate Action ({urgentCount})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {s.totalSentinels > 0 && <UrgentChip href="/trackers/ir-iad" label={`${s.totalSentinels} open sentinel event${s.totalSentinels > 1 ? 's' : ''}`} subtitle="JC RCA required within 45d" />}
            {s.adhsOverdue > 0 && <UrgentChip href="/trackers/ir-iad" label={`${s.adhsOverdue} ADHS report${s.adhsOverdue > 1 ? 's' : ''} overdue`} subtitle="ARS 36-2402 — past deadline" />}
            {s.qocOverdueResponse > 0 && <UrgentChip href="/trackers/qoc" label={`${s.qocOverdueResponse} QOC/LOI response${s.qocOverdueResponse > 1 ? 's' : ''} overdue`} subtitle="CMS 10-business-day window" />}
            {s.qocImmediateJeopardy > 0 && <UrgentChip href="/trackers/qoc" label={`${s.qocImmediateJeopardy} Immediate Jeopardy complaint${s.qocImmediateJeopardy > 1 ? 's' : ''}`} subtitle="CMS IJ — expedited response required" />}
            {s.grievanceOverdueAck > 0 && <UrgentChip href="/trackers/grievances" label={`${s.grievanceOverdueAck} grievance ack${s.grievanceOverdueAck > 1 ? 's' : ''} overdue`} subtitle="CMS 482.13(e) — 7-day window" />}
            {s.grievanceOverdueRes > 0 && <UrgentChip href="/trackers/grievances" label={`${s.grievanceOverdueRes} grievance resolution${s.grievanceOverdueRes > 1 ? 's' : ''} overdue`} subtitle="CMS 482.13(e) — 30-day window" />}
            {s.overdueCapCount > 0 && <UrgentChip href="/trackers/caps" label={`${s.overdueCapCount} CAP${s.overdueCapCount > 1 ? 's' : ''} past target date`} subtitle="Corrective action overdue" />}
          </div>
        </div>
      )}

      {/* AMBER ZONE */}
      {watchCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Watch List ({watchCount})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {s.iadUrgent > 0 && <WatchChip href="/trackers/ir-iad" label={`${s.iadUrgent} ADHS report${s.iadUrgent > 1 ? 's' : ''} due <48 hrs`} />}
            {s.pendingIad > 0 && <WatchChip href="/trackers/ir-iad" label={`${s.pendingIad} pending IAD submission${s.pendingIad > 1 ? 's' : ''}`} />}
            {s.openIrIad > 0 && <WatchChip href="/trackers/ir-iad" label={`${s.openIrIad} open IR/IAD report${s.openIrIad > 1 ? 's' : ''}`} />}
            {s.openQoc > 0 && <WatchChip href="/trackers/qoc" label={`${s.openQoc} open QOC/LOI complaint${s.openQoc > 1 ? 's' : ''}`} />}
            {s.openGrievances > 0 && <WatchChip href="/trackers/grievances" label={`${s.openGrievances} open grievance${s.openGrievances > 1 ? 's' : ''}`} />}
            {s.overduePolicies > 0 && <WatchChip href="/trackers/policies?filter=overdue" label={`${s.overduePolicies} policy review${s.overduePolicies > 1 ? 's' : ''} overdue`} />}
          </div>
        </div>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Overdue Events" value={s.overdueEvents} icon={AlertTriangle} color="red" href="/calendar?filter=overdue" description="Past due date" />
        <StatCard title="Due in 30 Days" value={s.upcomingEvents30} icon={Clock} color="yellow" href="/calendar?filter=30days" description="Upcoming deadlines" />
        <StatCard title="Open CAPs" value={s.openCaps} icon={ClipboardList} color="purple" href="/trackers/caps" description="Corrective actions" />
        <StatCard title="Open IR/IAD" value={s.openIrIad} icon={FileWarning} color={s.sentinelIrIad > 0 ? 'red' : 'orange'} href="/trackers/ir-iad" description={s.sentinelIrIad > 0 ? `${s.sentinelIrIad} sentinel` : 'Active reports'} />
        <StatCard title="Open Grievances" value={s.openGrievances} icon={MessageSquareWarning} color="orange" href="/trackers/grievances" description="CMS 30-day window" />
        <StatCard title="Open QOC/LOI" value={s.openQoc} icon={Scale} color="purple" href="/trackers/qoc" description="CMS complaint track" />
        <StatCard title="Training Expiring" value={s.expiringTraining30} icon={Users} color="yellow" href="/trackers/training?filter=expiring" description="Within 30 days" />
        <StatCard title="Policies Overdue" value={s.overduePolicies} icon={FileText} color="red" href="/trackers/policies?filter=overdue" description="Past review date" />
      </div>

      {/* COMPLIANCE HEALTH BARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-800">Staff Training Compliance</h3>
            <Link href="/trackers/training" className="ml-auto text-xs text-purple-600 hover:underline">View all →</Link>
          </div>
          {s.trainingCompliancePct !== null ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">Required trainings complete</span>
                <span className={`text-2xl font-bold ${s.trainingCompliancePct >= 85 ? 'text-green-600' : s.trainingCompliancePct >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{s.trainingCompliancePct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${s.trainingCompliancePct >= 85 ? 'bg-green-500' : s.trainingCompliancePct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.trainingCompliancePct}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">{s.trainingCompliancePct >= 90 ? '✓ Target met (≥90%)' : `Target: 90% · ${s.expiringTraining30} expiring in 30d`}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No training records. <Link href="/trackers/training/new" className="text-purple-600 hover:underline">Add records</Link></p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Siren className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">{new Date().getFullYear()} Drill Compliance</h3>
            <Link href="/emergency/drills" className="ml-auto text-xs text-purple-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            <ProgressBar value={s.fireDrills} max={12} label="Fire Evacuation Drills" sublabel="All shifts, quarterly min. 12/year · JC" />
            <ProgressBar value={s.tabletops} max={1} label="Tabletop Exercise" sublabel="Min. 1/year · JC EM.03.01.03" />
            <ProgressBar value={s.functional} max={1} label="Functional / Full-Scale" sublabel="Min. 1/year · JC EM.03.01.03" />
          </div>
        </div>
      </div>

      {/* QAPI SNAPSHOT */}
      {Object.keys(s.latestMetrics).length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-800">QAPI Metrics Snapshot</h3>
            <Link href="/quality/metrics" className="ml-auto text-xs text-purple-600 hover:underline">Enter metrics →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {([
              { key: 'restraint_rate',       label: 'Restraint',      unit: '/1k', target: 5,  lowerBetter: true },
              { key: 'fall_rate',             label: 'Falls',          unit: '/1k', target: 2,  lowerBetter: true },
              { key: 'elopement_count',       label: 'Elopements',     unit: '',    target: 0,  lowerBetter: true },
              { key: 'medication_error_rate', label: 'Med Errors',     unit: '/1k', target: 1,  lowerBetter: true },
              { key: 'patient_satisfaction',  label: 'Satisfaction',   unit: '%',   target: 85, lowerBetter: false },
            ] as const).map(({ key, label, unit, target, lowerBetter }) => {
              const m = s.latestMetrics[key];
              if (!m) return (
                <div key={key} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">{label}</p>
                  <p className="text-xs text-slate-300 mt-1">No data</p>
                </div>
              );
              const onTarget = lowerBetter ? m.value <= target : m.value >= target;
              return (
                <div key={key} className={`rounded-lg p-3 text-center border ${onTarget ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-xs font-medium text-slate-600">{label}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className={`text-lg font-bold ${onTarget ? 'text-green-700' : 'text-red-700'}`}>
                      {Number.isInteger(m.value) ? m.value : m.value.toFixed(1)}{unit}
                    </span>
                    <TrendIcon value={m.value} prev={m.prev} higherIsBetter={!lowerBetter} />
                  </div>
                  <p className="text-xs text-slate-400">Target: {target}{unit}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* UPCOMING EVENTS */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-purple-600" />
            Next Up: Compliance Events
          </h2>
          <Link href="/calendar" className="text-sm text-purple-600 hover:text-purple-700 font-medium">View all →</Link>
        </div>
        <div className="divide-y divide-slate-50">
          {s.recentEvents.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <div className="text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
                <p className="text-sm font-medium">All caught up!</p>
              </div>
            </div>
          ) : (
            s.recentEvents.map((event) => {
              const { label, className } = getDueDateStatus(event.dueDate);
              return (
                <div key={event.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-lg font-bold text-slate-900 leading-none">{formatDate(event.dueDate, 'd')}</p>
                    <p className="text-xs text-slate-500">{formatDate(event.dueDate, 'MMM')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{event.title}</p>
                    <p className="text-xs text-slate-400">{event.category.replace(/_/g, ' ')}{event.regulatoryBody && ` · ${event.regulatoryBody.replace(/_/g, ' ')}`}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${className}`}>{label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { href: '/trackers/ir-iad/new',     label: 'Log Incident Report',  icon: FileWarning,          color: 'text-red-600    bg-red-50    border-red-200    hover:bg-red-100'    },
          { href: '/trackers/grievances/new', label: 'Log Grievance',         icon: MessageSquareWarning, color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100' },
          { href: '/trackers/caps/new',        label: 'New CAP',              icon: ClipboardList,        color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100' },
          { href: '/quality/metrics',          label: 'Enter QAPI Metrics',   icon: Activity,             color: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100' },
        ] as const).map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href} className={`flex items-center gap-2 border rounded-xl px-4 py-3 text-sm font-medium transition-colors ${color}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function UrgentChip({ href, label, subtitle }: { href: string; label: string; subtitle: string }) {
  return (
    <Link href={href} className="inline-flex flex-col bg-white border border-red-300 rounded-lg px-3 py-2 hover:bg-red-50 transition-colors">
      <span className="text-xs font-semibold text-red-700">{label}</span>
      <span className="text-xs text-red-400">{subtitle}</span>
    </Link>
  );
}

function WatchChip({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center text-xs font-medium text-amber-700 bg-white border border-amber-300 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors">
      {label}
    </Link>
  );
}

function StatCard({ title, value, icon: Icon, color, href, description }: {
  title: string; value: number; icon: React.ElementType;
  color: 'red' | 'yellow' | 'orange' | 'purple' | 'blue' | 'green';
  href: string; description: string;
}) {
  const colorMap = {
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    ring: 'ring-red-100',    value: 'text-red-700'    },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', ring: 'ring-yellow-100', value: 'text-yellow-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', ring: 'ring-orange-100', value: 'text-orange-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100', value: 'text-purple-700' },
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   ring: 'ring-blue-100',   value: 'text-blue-700'   },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  ring: 'ring-green-100',  value: 'text-green-700'  },
  };
  const c = colorMap[color];
  return (
    <Link href={href} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.value}`}>{value}</p>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </Link>
  );
}
