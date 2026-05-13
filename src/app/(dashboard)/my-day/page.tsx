import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { addDays, startOfDay, endOfDay, isToday, isPast, format } from 'date-fns';
import { DailyChecklistClient } from '@/components/daily/DailyChecklistClient';
import type { DailyTask } from '@/components/daily/DailyChecklistClient';
import {
  CalendarDays,
  CheckSquare,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Day' };

function urgency(dueDate: Date): DailyTask['urgency'] {
  if (isPast(endOfDay(dueDate))) return 'overdue';
  if (isToday(dueDate)) return 'today';
  return 'week';
}

async function getMyDayTasks(facilityId: string): Promise<DailyTask[]> {
  const now  = new Date();
  const in7  = addDays(now, 7);
  const tasks: DailyTask[] = [];

  const [
    overduePocs,
    todayPocs,
    weekPocs,
    overdueQoc,
    todayQoc,
    weekQoc,
    overdueGrievAck,
    todayGrievAck,
    overdueGrievRes,
    todayGrievRes,
    weekGrievRes,
    overdueCaps,
    todayCaps,
    weekCaps,
    overduePolicies,
    todayPolicies,
    weekPolicies,
    overdueResponses,
    todayResponses,
    weekResponses,
    overdueCalendar,
    todayCalendar,
    weekCalendar,
    overdueAdhs,
    todayAdhs,
    weekAdhs,
    overdueQapiProjects,
    todayQapiProjects,
    weekQapiProjects,
  ] = await Promise.all([
    // ── Plans of Correction ──────────────────────────────────────────────
    prisma.planOfCorrection.findMany({
      where: { facilityId, responseDeadline: { lt: startOfDay(now) }, status: { notIn: ['SUBMITTED', 'ACCEPTED', 'CLOSED'] } },
      select: { id: true, pocNumber: true, title: true, responseDeadline: true, regulatoryBody: true },
      orderBy: { responseDeadline: 'asc' }, take: 20,
    }),
    prisma.planOfCorrection.findMany({
      where: { facilityId, responseDeadline: { gte: startOfDay(now), lte: endOfDay(now) }, status: { notIn: ['SUBMITTED', 'ACCEPTED', 'CLOSED'] } },
      select: { id: true, pocNumber: true, title: true, responseDeadline: true, regulatoryBody: true },
    }),
    prisma.planOfCorrection.findMany({
      where: { facilityId, responseDeadline: { gt: endOfDay(now), lte: in7 }, status: { notIn: ['SUBMITTED', 'ACCEPTED', 'CLOSED'] } },
      select: { id: true, pocNumber: true, title: true, responseDeadline: true, regulatoryBody: true },
      orderBy: { responseDeadline: 'asc' },
    }),

    // ── QOC / LOI ────────────────────────────────────────────────────────
    prisma.qocComplaint.findMany({
      where: { facilityId, responseDueDate: { lt: startOfDay(now) }, responseSubmittedDate: null, status: 'LOI_RECEIVED' },
      select: { id: true, qocNumber: true, allegationSummary: true, responseDueDate: true, investigationType: true },
      orderBy: { responseDueDate: 'asc' }, take: 20,
    }),
    prisma.qocComplaint.findMany({
      where: { facilityId, responseDueDate: { gte: startOfDay(now), lte: endOfDay(now) }, responseSubmittedDate: null, status: 'LOI_RECEIVED' },
      select: { id: true, qocNumber: true, allegationSummary: true, responseDueDate: true, investigationType: true },
    }),
    prisma.qocComplaint.findMany({
      where: { facilityId, responseDueDate: { gt: endOfDay(now), lte: in7 }, responseSubmittedDate: null, status: 'LOI_RECEIVED' },
      select: { id: true, qocNumber: true, allegationSummary: true, responseDueDate: true, investigationType: true },
      orderBy: { responseDueDate: 'asc' },
    }),

    // ── Grievances — Acknowledgment ───────────────────────────────────────
    prisma.grievanceRecord.findMany({
      where: { facilityId, acknowledgmentDate: null, acknowledgmentDueDate: { lt: startOfDay(now) }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
      select: { id: true, grievanceNumber: true, complainantName: true, summary: true, acknowledgmentDueDate: true },
      orderBy: { acknowledgmentDueDate: 'asc' }, take: 20,
    }),
    prisma.grievanceRecord.findMany({
      where: { facilityId, acknowledgmentDate: null, acknowledgmentDueDate: { gte: startOfDay(now), lte: endOfDay(now) }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
      select: { id: true, grievanceNumber: true, complainantName: true, summary: true, acknowledgmentDueDate: true },
    }),

    // ── Grievances — Resolution ───────────────────────────────────────────
    prisma.grievanceRecord.findMany({
      where: { facilityId, resolutionDate: null, resolutionDueDate: { lt: startOfDay(now) }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
      select: { id: true, grievanceNumber: true, complainantName: true, summary: true, resolutionDueDate: true },
      orderBy: { resolutionDueDate: 'asc' }, take: 20,
    }),
    prisma.grievanceRecord.findMany({
      where: { facilityId, resolutionDate: null, resolutionDueDate: { gte: startOfDay(now), lte: endOfDay(now) }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
      select: { id: true, grievanceNumber: true, complainantName: true, summary: true, resolutionDueDate: true },
    }),
    prisma.grievanceRecord.findMany({
      where: { facilityId, resolutionDate: null, resolutionDueDate: { gt: endOfDay(now), lte: in7 }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
      select: { id: true, grievanceNumber: true, complainantName: true, summary: true, resolutionDueDate: true },
      orderBy: { resolutionDueDate: 'asc' },
    }),

    // ── Corrective Action Plans ───────────────────────────────────────────
    prisma.correctiveActionPlan.findMany({
      where: { facilityId, targetDate: { lt: startOfDay(now) }, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
      select: { id: true, capNumber: true, title: true, targetDate: true, priority: true, source: true },
      orderBy: { targetDate: 'asc' }, take: 20,
    }),
    prisma.correctiveActionPlan.findMany({
      where: { facilityId, targetDate: { gte: startOfDay(now), lte: endOfDay(now) }, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
      select: { id: true, capNumber: true, title: true, targetDate: true, priority: true, source: true },
    }),
    prisma.correctiveActionPlan.findMany({
      where: { facilityId, targetDate: { gt: endOfDay(now), lte: in7 }, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
      select: { id: true, capNumber: true, title: true, targetDate: true, priority: true, source: true },
      orderBy: { targetDate: 'asc' },
    }),

    // ── Policies ─────────────────────────────────────────────────────────
    prisma.policy.findMany({
      where: { facilityId, nextReviewDate: { lt: startOfDay(now) }, status: { in: ['ACTIVE', 'OVERDUE_REVIEW'] } },
      select: { id: true, policyNumber: true, title: true, nextReviewDate: true, category: true },
      orderBy: { nextReviewDate: 'asc' }, take: 20,
    }),
    prisma.policy.findMany({
      where: { facilityId, nextReviewDate: { gte: startOfDay(now), lte: endOfDay(now) }, status: { in: ['ACTIVE', 'OVERDUE_REVIEW'] } },
      select: { id: true, policyNumber: true, title: true, nextReviewDate: true, category: true },
    }),
    prisma.policy.findMany({
      where: { facilityId, nextReviewDate: { gt: endOfDay(now), lte: in7 }, status: { in: ['ACTIVE', 'OVERDUE_REVIEW'] } },
      select: { id: true, policyNumber: true, title: true, nextReviewDate: true, category: true },
      orderBy: { nextReviewDate: 'asc' },
    }),

    // ── Generated Responses ───────────────────────────────────────────────
    prisma.generatedResponse.findMany({
      where: { facilityId, dueDate: { lt: startOfDay(now) }, status: { notIn: ['SENT', 'FILED'] } },
      select: { id: true, title: true, subject: true, dueDate: true, category: true, sourceRef: true },
      orderBy: { dueDate: 'asc' }, take: 20,
    }),
    prisma.generatedResponse.findMany({
      where: { facilityId, dueDate: { gte: startOfDay(now), lte: endOfDay(now) }, status: { notIn: ['SENT', 'FILED'] } },
      select: { id: true, title: true, subject: true, dueDate: true, category: true, sourceRef: true },
    }),
    prisma.generatedResponse.findMany({
      where: { facilityId, dueDate: { gt: endOfDay(now), lte: in7 }, status: { notIn: ['SENT', 'FILED'] } },
      select: { id: true, title: true, subject: true, dueDate: true, category: true, sourceRef: true },
      orderBy: { dueDate: 'asc' },
    }),

    // ── Calendar Events ───────────────────────────────────────────────────
    prisma.calendarEvent.findMany({
      where: { facilityId, dueDate: { lt: startOfDay(now) }, completedDate: null, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } },
      select: { id: true, title: true, dueDate: true, category: true, regulatoryBody: true },
      orderBy: { dueDate: 'asc' }, take: 20,
    }),
    prisma.calendarEvent.findMany({
      where: { facilityId, dueDate: { gte: startOfDay(now), lte: endOfDay(now) }, completedDate: null, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } },
      select: { id: true, title: true, dueDate: true, category: true, regulatoryBody: true },
    }),
    prisma.calendarEvent.findMany({
      where: { facilityId, dueDate: { gt: endOfDay(now), lte: in7 }, completedDate: null, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } },
      select: { id: true, title: true, dueDate: true, category: true, regulatoryBody: true },
      orderBy: { dueDate: 'asc' },
    }),

    // ── ADHS Reportable Incidents ─────────────────────────────────────────
    prisma.incidentReport.findMany({
      where: { facilityId, adhsReportable: true, adhsReported: false, adhsReportDue: { lt: startOfDay(now) } },
      select: { id: true, irNumber: true, briefDescription: true, adhsReportDue: true },
      orderBy: { adhsReportDue: 'asc' }, take: 20,
    }),
    prisma.incidentReport.findMany({
      where: { facilityId, adhsReportable: true, adhsReported: false, adhsReportDue: { gte: startOfDay(now), lte: endOfDay(now) } },
      select: { id: true, irNumber: true, briefDescription: true, adhsReportDue: true },
    }),
    prisma.incidentReport.findMany({
      where: { facilityId, adhsReportable: true, adhsReported: false, adhsReportDue: { gt: endOfDay(now), lte: in7 } },
      select: { id: true, irNumber: true, briefDescription: true, adhsReportDue: true },
      orderBy: { adhsReportDue: 'asc' },
    }),

    // ── QAPI Projects ─────────────────────────────────────────────────────
    prisma.qapiProject.findMany({
      where: { facilityId, targetDate: { lt: startOfDay(now) }, status: 'ACTIVE' },
      select: { id: true, projectNumber: true, title: true, targetDate: true, category: true },
      orderBy: { targetDate: 'asc' }, take: 10,
    }),
    prisma.qapiProject.findMany({
      where: { facilityId, targetDate: { gte: startOfDay(now), lte: endOfDay(now) }, status: 'ACTIVE' },
      select: { id: true, projectNumber: true, title: true, targetDate: true, category: true },
    }),
    prisma.qapiProject.findMany({
      where: { facilityId, targetDate: { gt: endOfDay(now), lte: in7 }, status: 'ACTIVE' },
      select: { id: true, projectNumber: true, title: true, targetDate: true, category: true },
      orderBy: { targetDate: 'asc' },
    }),
  ]);

  // ── Map results to DailyTask ───────────────────────────────────────────────

  // POC
  for (const p of [...overduePocs, ...todayPocs, ...weekPocs]) {
    if (!p.responseDeadline) continue;
    tasks.push({
      id: `poc-${p.id}`,
      type: 'POC',
      label: 'POC',
      title: `${p.pocNumber}: ${p.title}`,
      subtitle: `POC response deadline · ${p.regulatoryBody?.replace(/_/g, ' ') ?? 'Regulatory'}`,
      dueDate: p.responseDeadline.toISOString(),
      urgency: urgency(p.responseDeadline),
      href: `/quality/poc/${p.id}`,
      regulatoryNote: 'Submit POC to surveying agency before deadline',
    });
  }

  // QOC / LOI
  for (const q of [...overdueQoc, ...todayQoc, ...weekQoc]) {
    if (!q.responseDueDate) continue;
    const isIJ = q.investigationType === 'IMMEDIATE_JEOPARDY';
    tasks.push({
      id: `qoc-${q.id}`,
      type: 'QOC',
      label: isIJ ? 'QOC · IJ' : 'QOC',
      title: `${q.qocNumber}: ${q.allegationSummary.slice(0, 60)}${q.allegationSummary.length > 60 ? '…' : ''}`,
      subtitle: `LOI response due · CMS 42 CFR 488 · 10 business-day window`,
      dueDate: q.responseDueDate.toISOString(),
      urgency: urgency(q.responseDueDate),
      href: `/trackers/qoc/${q.id}`,
      regulatoryNote: isIJ ? '⚠ Immediate Jeopardy — expedited response required' : undefined,
    });
  }

  // Grievance — Acknowledgment
  for (const g of [...overdueGrievAck, ...todayGrievAck]) {
    tasks.push({
      id: `griev-ack-${g.id}`,
      type: 'GRIEVANCE',
      label: 'Grievance · Ack',
      title: `${g.grievanceNumber}: ${g.complainantName}`,
      subtitle: `Acknowledgment letter due · CMS 482.13(e) · 7 calendar days`,
      dueDate: g.acknowledgmentDueDate.toISOString(),
      urgency: urgency(g.acknowledgmentDueDate),
      href: `/trackers/grievances/${g.id}`,
    });
  }

  // Grievance — Resolution
  for (const g of [...overdueGrievRes, ...todayGrievRes, ...weekGrievRes]) {
    tasks.push({
      id: `griev-res-${g.id}`,
      type: 'GRIEVANCE',
      label: 'Grievance · Resolution',
      title: `${g.grievanceNumber}: ${g.complainantName}`,
      subtitle: `Resolution letter due · CMS 482.13(e) · 30 calendar days`,
      dueDate: g.resolutionDueDate.toISOString(),
      urgency: urgency(g.resolutionDueDate),
      href: `/trackers/grievances/${g.id}`,
    });
  }

  // CAPs
  for (const c of [...overdueCaps, ...todayCaps, ...weekCaps]) {
    tasks.push({
      id: `cap-${c.id}`,
      type: 'CAP',
      label: 'CAP',
      title: `${c.capNumber}: ${c.title}`,
      subtitle: `Target date · Priority: ${c.priority} · Source: ${c.source.replace(/_/g, ' ')}`,
      dueDate: c.targetDate.toISOString(),
      urgency: urgency(c.targetDate),
      href: `/trackers/caps/${c.id}`,
    });
  }

  // Policies
  for (const p of [...overduePolicies, ...todayPolicies, ...weekPolicies]) {
    if (!p.nextReviewDate) continue;
    tasks.push({
      id: `policy-${p.id}`,
      type: 'POLICY',
      label: 'Policy Review',
      title: `${p.policyNumber ?? ''} ${p.title}`.trim(),
      subtitle: `Annual review due · ${p.category?.replace(/_/g, ' ') ?? 'Policy & Procedures'}`,
      dueDate: p.nextReviewDate.toISOString(),
      urgency: urgency(p.nextReviewDate),
      href: `/trackers/policies/${p.id}`,
      regulatoryNote: 'Review, revise, and obtain approval per policy lifecycle',
    });
  }

  // Responses
  for (const r of [...overdueResponses, ...todayResponses, ...weekResponses]) {
    if (!r.dueDate) continue;
    tasks.push({
      id: `resp-${r.id}`,
      type: 'RESPONSE',
      label: 'Response Letter',
      title: r.title,
      subtitle: `${r.category.replace(/_/g, ' ')}${r.sourceRef ? ` · Ref: ${r.sourceRef}` : ''}`,
      dueDate: r.dueDate.toISOString(),
      urgency: urgency(r.dueDate),
      href: `/quality/responses/${r.id}`,
    });
  }

  // Calendar Events
  for (const e of [...overdueCalendar, ...todayCalendar, ...weekCalendar]) {
    if (!e.dueDate) continue;
    tasks.push({
      id: `cal-${e.id}`,
      type: 'CALENDAR',
      label: 'Compliance Event',
      title: e.title,
      subtitle: `${e.category.replace(/_/g, ' ')}${e.regulatoryBody ? ` · ${e.regulatoryBody.replace(/_/g, ' ')}` : ''}`,
      dueDate: e.dueDate.toISOString(),
      urgency: urgency(e.dueDate),
      href: `/calendar`,
    });
  }

  // ADHS Reports
  for (const i of [...overdueAdhs, ...todayAdhs, ...weekAdhs]) {
    if (!i.adhsReportDue) continue;
    tasks.push({
      id: `adhs-${i.id}`,
      type: 'ADHS',
      label: 'ADHS Report',
      title: `${i.irNumber}: ${i.briefDescription.slice(0, 60)}${i.briefDescription.length > 60 ? '…' : ''}`,
      subtitle: `ADHS IAD report required · ARS 36-2402 · 24/72 hr window`,
      dueDate: i.adhsReportDue.toISOString(),
      urgency: urgency(i.adhsReportDue),
      href: `/trackers/ir-iad/${i.id}`,
      regulatoryNote: '⚠ Failure to report is a regulatory violation',
    });
  }

  // QAPI Projects
  for (const q of [...overdueQapiProjects, ...todayQapiProjects, ...weekQapiProjects]) {
    tasks.push({
      id: `qapi-${q.id}`,
      type: 'QAPI',
      label: 'QAPI Project',
      title: `${q.projectNumber}: ${q.title}`,
      subtitle: `Target completion · ${q.category.replace(/_/g, ' ')}`,
      dueDate: q.targetDate.toISOString(),
      urgency: urgency(q.targetDate),
      href: `/quality/projects/${q.id}`,
    });
  }

  // Sort within each urgency bucket: overdue by how old (oldest first), others by nearest first
  return tasks.sort((a, b) => {
    const urgencyOrder = { overdue: 0, today: 1, week: 2 };
    if (a.urgency !== b.urgency) return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export default async function MyDayPage() {
  const session = await auth();
  if (!session) redirect('/login');
  const facilityId = session.user.facilityId;

  const [tasks, facility] = await Promise.all([
    getMyDayTasks(facilityId),
    prisma.facility.findUnique({ where: { id: facilityId }, select: { name: true } }),
  ]);

  const overdueCount = tasks.filter(t => t.urgency === 'overdue').length;
  const todayCount   = tasks.filter(t => t.urgency === 'today').length;
  const weekCount    = tasks.filter(t => t.urgency === 'week').length;

  const today = new Date();
  const dayLabel = format(today, 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-teal-400" />
            My Day
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{dayLabel} · {facility?.name}</p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-teal-400 border border-teal-800/50 bg-teal-950/30 hover:bg-teal-950/60 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Layers className="w-3.5 h-3.5" /> Full Dashboard
        </Link>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`rounded-xl border p-3 text-center ${overdueCount > 0 ? 'bg-red-950/40 border-red-700/40' : 'bg-card border-border/50'}`}>
          <p className={`text-2xl font-bold ${overdueCount > 0 ? 'text-red-400' : 'text-muted-foreground'}`}>{overdueCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Overdue</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${todayCount > 0 ? 'bg-amber-950/40 border-amber-700/40' : 'bg-card border-border/50'}`}>
          <p className={`text-2xl font-bold ${todayCount > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>{todayCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Due Today</p>
        </div>
        <div className={`rounded-xl border p-3 text-center ${weekCount > 0 ? 'bg-teal-950/40 border-teal-700/40' : 'bg-card border-border/50'}`}>
          <p className={`text-2xl font-bold ${weekCount > 0 ? 'text-teal-400' : 'text-muted-foreground'}`}>{weekCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">This Week</p>
        </div>
      </div>

      {/* Context */}
      <div className="bg-card/50 border border-border/40 rounded-xl px-4 py-3 text-xs text-muted-foreground/70 flex items-start gap-2">
        <CalendarDays className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-teal-400/70" />
        <span>
          Tasks are sourced from your open POCs, QOC/LOI letters, grievances, CAPs, policy reviews, scheduled
          calendar events, ADHS reports, and QAPI projects. Check off items as you action them — the list
          refreshes daily and shows anything due within the next 7 days.
        </span>
      </div>

      {/* Checklist */}
      <DailyChecklistClient tasks={tasks} />
    </div>
  );
}
