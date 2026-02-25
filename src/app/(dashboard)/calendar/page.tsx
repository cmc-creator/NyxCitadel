import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  CalendarDays,
  Plus,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import Link from 'next/link';
import { addDays, addMonths, startOfMonth, endOfMonth } from 'date-fns';

export const metadata = { title: 'Compliance Calendar' };

type Filter = 'all' | 'overdue' | '30days' | '90days' | 'em' | 'jc' | 'az' | 'cms';

async function getCalendarEvents(
  facilityId: string,
  filter: Filter = 'all'
) {
  const now = new Date();
  const whereBase = { facilityId } as Record<string, unknown>;

  if (filter === 'overdue') {
    whereBase.dueDate = { lt: now };
    whereBase.completedDate = null;
    whereBase.status = { not: 'COMPLETED' };
  } else if (filter === '30days') {
    whereBase.dueDate = { gte: now, lte: addDays(now, 30) };
    whereBase.status = { notIn: ['COMPLETED', 'NA', 'WAIVED'] };
  } else if (filter === '90days') {
    whereBase.dueDate = { gte: now, lte: addDays(now, 90) };
    whereBase.status = { notIn: ['COMPLETED', 'NA', 'WAIVED'] };
  } else if (filter === 'em') {
    whereBase.regulatoryBody = 'JOINT_COMMISSION';
    whereBase.category = {
      in: [
        'EM_COMMITTEE_MEETING',
        'HVA_ASSESSMENT',
        'TABLETOP_EXERCISE',
        'FUNCTIONAL_DRILL',
        'FULL_SCALE_DRILL',
        'EM_PLAN_REVIEW',
      ],
    };
  } else if (filter === 'jc') {
    whereBase.regulatoryBody = 'JOINT_COMMISSION';
  } else if (filter === 'az') {
    whereBase.regulatoryBody = 'AZ_ADHS';
  } else if (filter === 'cms') {
    whereBase.regulatoryBody = 'CMS';
  } else {
    // all: show next 12 months
    whereBase.dueDate = { gte: now, lte: addMonths(now, 12) };
  }

  return prisma.calendarEvent.findMany({
    where: whereBase,
    orderBy: { dueDate: 'asc' },
  });
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { filter?: string; month?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const filter = (searchParams.filter ?? 'all') as Filter;

  const events = await getCalendarEvents(facilityId, filter);

  // Group events by month
  const groupedByMonth = events.reduce<Record<string, typeof events>>(
    (acc, event) => {
      const month = formatDate(event.dueDate, 'MMMM yyyy');
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    },
    {}
  );

  const filterOptions: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All (Next 12 Mo.)' },
    { value: 'overdue', label: '🔴 Overdue' },
    { value: '30days', label: '⚡ Due in 30 Days' },
    { value: '90days', label: '📅 Due in 90 Days' },
    { value: 'em', label: '🚨 Emergency Mgmt' },
    { value: 'jc', label: '🏥 Joint Commission' },
    { value: 'az', label: '🌵 AZ ADHS' },
    { value: 'cms', label: '🏛️ CMS' },
  ];

  const priorityBadge = (p: string) => {
    const map: Record<string, string> = {
      CRITICAL: 'bg-red-600 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-400 text-slate-900',
      LOW: 'bg-slate-200 text-slate-700',
    };
    return map[p] ?? map.MEDIUM;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-purple-600" />
            Compliance Calendar
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {events.length} events · Arizona regulatory compliance schedule
          </p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          <Link
            href="/api/compliance/generate-calendar"
            className="inline-flex items-center gap-1.5 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Auto-Generate {new Date().getFullYear() + 1}
          </Link>
          <button className="inline-flex items-center gap-1.5 text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <Link
            href="/calendar/new"
            className="inline-flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 bg-white rounded-xl border border-slate-200 p-3">
        <Filter className="w-4 h-4 text-slate-400 self-center mr-1" />
        {filterOptions.map((opt) => (
          <Link
            key={opt.value}
            href={`/calendar?filter=${opt.value}`}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              filter === opt.value
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Events by Month */}
      {Object.keys(groupedByMonth).length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No events found for this filter.</p>
          <p className="text-sm mt-1">
            Try a different filter or{' '}
            <Link href="/api/compliance/generate-calendar" className="text-purple-600 hover:underline">
              generate the compliance calendar
            </Link>{' '}
            from Arizona requirements.
          </p>
        </div>
      ) : (
        Object.entries(groupedByMonth).map(([month, monthEvents]) => (
          <div key={month} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">{month}</h2>
              <span className="text-xs text-slate-400">{monthEvents.length} events</span>
            </div>
            <div className="divide-y divide-slate-50">
              {monthEvents.map((event) => {
                const { label, className } = getDueDateStatus(event.dueDate);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Date bubble */}
                    <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-700 leading-none">
                        {formatDate(event.dueDate, 'd')}
                      </span>
                      <span className="text-[10px] text-purple-500 uppercase leading-none mt-0.5">
                        {formatDate(event.dueDate, 'MMM')}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800">
                          {event.title}
                        </p>
                        {event.isRecurring && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                            RECURRING
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-400">
                          {event.category.replace(/_/g, ' ')}
                        </span>
                        {event.regulatoryBody && (
                          <span className="text-xs text-slate-400">
                            {event.regulatoryBody.replace(/_/g, ' ')}
                          </span>
                        )}
                        {event.description && (
                          <span className="text-xs text-slate-400 truncate max-w-xs hidden md:block">
                            {event.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
                        {label}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityBadge(event.priority)}`}>
                        {event.priority}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${
                          event.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {event.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
