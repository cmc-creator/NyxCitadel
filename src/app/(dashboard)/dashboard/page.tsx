import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  ShieldAlert,
  Siren,
  TrendingUp,
  Users,
  ClipboardList,
} from 'lucide-react';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import Link from 'next/link';
import { addDays } from 'date-fns';

export const metadata = { title: 'Dashboard' };

async function getDashboardStats(facilityId: string) {
  const now = new Date();
  const in30Days = addDays(now, 30);
  const in90Days = addDays(now, 90);

  const [
    overdueEvents,
    upcomingEvents30,
    upcomingEvents90,
    openIncidents,
    openCaps,
    overduePolicies,
    expiringTraining,
    upcomingDrills,
    recentEvents,
  ] = await Promise.all([
    // Overdue calendar events
    prisma.calendarEvent.count({
      where: {
        facilityId,
        dueDate: { lt: now },
        completedDate: null,
        status: { not: 'COMPLETED' },
      },
    }),
    // Upcoming in 30 days
    prisma.calendarEvent.count({
      where: {
        facilityId,
        dueDate: { gte: now, lte: in30Days },
        status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] },
      },
    }),
    // Upcoming in 90 days
    prisma.calendarEvent.count({
      where: {
        facilityId,
        dueDate: { gte: now, lte: in90Days },
        status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] },
      },
    }),
    // Open incidents
    prisma.incident.count({
      where: { facilityId, status: { notIn: ['CLOSED'] } },
    }),
    // Open CAPs
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
    }),
    // Policies overdue for review
    prisma.policy.count({
      where: { facilityId, nextReviewDate: { lt: now }, status: 'ACTIVE' },
    }),
    // Training expiring in 30 days
    prisma.trainingRecord.count({
      where: {
        facilityId,
        expiryDate: { gte: now, lte: in30Days },
        status: { not: 'EXEMPT' },
      },
    }),
    // Upcoming drills in 90 days
    prisma.drill.count({
      where: {
        facilityId,
        scheduledDate: { gte: now, lte: in90Days },
        status: { not: 'CANCELLED' },
      },
    }),
    // Recent calendar events (last 10 upcoming)
    prisma.calendarEvent.findMany({
      where: {
        facilityId,
        dueDate: { gte: now },
        status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
  ]);

  return {
    overdueEvents,
    upcomingEvents30,
    upcomingEvents90,
    openIncidents,
    openCaps,
    overduePolicies,
    expiringTraining,
    upcomingDrills,
    recentEvents,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const stats = await getDashboardStats(facilityId);

  const totalAlerts =
    stats.overdueEvents + stats.openIncidents + stats.overduePolicies;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Compliance Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Destiny Springs Healthcare · {formatDate(new Date(), 'MMMM yyyy')}
          </p>
        </div>
        <Link
          href="/calendar"
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <CalendarDays className="w-4 h-4" />
          View Full Calendar
        </Link>
      </div>

      {/* Alert Banner */}
      {totalAlerts > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">
            <span className="font-bold">{totalAlerts} items require immediate attention:</span>{' '}
            {stats.overdueEvents > 0 && `${stats.overdueEvents} overdue compliance events`}
            {stats.overdueEvents > 0 && stats.overduePolicies > 0 && ', '}
            {stats.overduePolicies > 0 && `${stats.overduePolicies} policies past review date`}
            {(stats.overdueEvents > 0 || stats.overduePolicies > 0) && stats.openIncidents > 0 && ', '}
            {stats.openIncidents > 0 && `${stats.openIncidents} open incidents`}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Overdue Items"
          value={stats.overdueEvents}
          icon={AlertTriangle}
          color="red"
          href="/calendar?filter=overdue"
          description="Past due date"
        />
        <StatCard
          title="Due in 30 Days"
          value={stats.upcomingEvents30}
          icon={Clock}
          color="yellow"
          href="/calendar?filter=30days"
          description="Upcoming deadlines"
        />
        <StatCard
          title="Open Incidents"
          value={stats.openIncidents}
          icon={ShieldAlert}
          color="orange"
          href="/trackers/incidents"
          description="Requiring follow-up"
        />
        <StatCard
          title="Open CAPs"
          value={stats.openCaps}
          icon={ClipboardList}
          color="purple"
          href="/trackers/caps"
          description="Corrective actions"
        />
        <StatCard
          title="Policies Overdue Review"
          value={stats.overduePolicies}
          icon={FileText}
          color="red"
          href="/trackers/policies?filter=overdue"
          description="Past review date"
        />
        <StatCard
          title="Training Expiring"
          value={stats.expiringTraining}
          icon={Users}
          color="yellow"
          href="/trackers/training?filter=expiring"
          description="Within 30 days"
        />
        <StatCard
          title="Upcoming Drills"
          value={stats.upcomingDrills}
          icon={Siren}
          color="blue"
          href="/emergency/drills"
          description="Next 90 days"
        />
        <StatCard
          title="Events Next 90 Days"
          value={stats.upcomingEvents90}
          icon={TrendingUp}
          color="green"
          href="/calendar"
          description="Scheduled compliance"
        />
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-purple-600" />
            Upcoming Compliance Events
          </h2>
          <Link
            href="/calendar"
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {stats.recentEvents.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <div className="text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs mt-1">No upcoming compliance events</p>
              </div>
            </div>
          ) : (
            stats.recentEvents.map((event) => {
              const { label, className } = getDueDateStatus(event.dueDate);
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-lg font-bold text-slate-900 leading-none">
                      {formatDate(event.dueDate, 'd')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(event.dueDate, 'MMM')}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {event.category.replace(/_/g, ' ')}
                      {event.regulatoryBody && ` · ${event.regulatoryBody.replace(/_/g, ' ')}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full border ${className}`}
                  >
                    {label}
                  </span>
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded priority-${event.priority.toLowerCase()}`}
                  >
                    {event.priority}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card Component ────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'red' | 'yellow' | 'orange' | 'purple' | 'blue' | 'green';
  href: string;
  description: string;
}) {
  const colorMap = {
    red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-100', value: 'text-red-700' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', ring: 'ring-yellow-100', value: 'text-yellow-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', ring: 'ring-orange-100', value: 'text-orange-700' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100', value: 'text-purple-700' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100', value: 'text-blue-700' },
    green: { bg: 'bg-green-50', icon: 'text-green-600', ring: 'ring-green-100', value: 'text-green-700' },
  };
  const c = colorMap[color];

  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {title}
          </p>
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
