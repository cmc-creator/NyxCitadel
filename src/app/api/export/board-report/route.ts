import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const facilityId = session.user.facilityId;
  const now = new Date();
  const in30 = addDays(now, 30);
  const in90 = addDays(now, 90);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    facility,
    overdueEvents,
    upcomingEvents30,
    openCaps,
    overdueCaps,
    openGrievances,
    overdueGrievanceAck,
    overdueGrievanceRes,
    openIrIad,
    sentinelOpen,
    adhsOverdue,
    openQoc,
    qocImmediateJeopardy,
    overduePolicies,
    totalRequired,
    completedRequired,
    expiringTraining30,
    expiredTraining,
    licensesExpiring90,
    csDiscrepancies,
    openHipaaBreaches,
    restraintDeathsYtd,
    eocOpenDeficiencies,
    eocOverdueDeficiencies,
    drillsYtd,
    recentSentinels,
    overdueCAPList,
  ] = await Promise.all([
    prisma.facility.findUnique({ where: { id: facilityId }, select: { name: true } }),
    prisma.calendarEvent.count({ where: { facilityId, dueDate: { lt: now }, completedDate: null, status: { not: 'COMPLETED' } } }),
    prisma.calendarEvent.count({ where: { facilityId, dueDate: { gte: now, lte: in30 }, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, targetDate: { lt: now }, status: { notIn: ['COMPLETED', 'VERIFIED'] } } }),
    prisma.grievanceRecord.count({ where: { facilityId, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
    prisma.grievanceRecord.count({ where: { facilityId, acknowledgmentDate: null, acknowledgmentDueDate: { lt: now }, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
    prisma.grievanceRecord.count({ where: { facilityId, resolutionDate: null, resolutionDueDate: { lt: now }, status: { notIn: ['CLOSED', 'RESOLVED'] } } }),
    prisma.incidentReport.count({ where: { facilityId, status: { not: 'CLOSED' } } }),
    prisma.incidentReport.count({ where: { facilityId, severity: 'SENTINEL', status: { not: 'CLOSED' } } }),
    prisma.incidentReport.count({ where: { facilityId, adhsReportable: true, adhsReported: false, adhsReportDue: { lt: now } } }),
    prisma.qocComplaint.count({ where: { facilityId, status: { notIn: ['CLOSED', 'UNSUBSTANTIATED'] } } }),
    prisma.qocComplaint.count({ where: { facilityId, investigationType: 'IMMEDIATE_JEOPARDY', status: { notIn: ['CLOSED', 'UNSUBSTANTIATED'] } } }),
    prisma.policy.count({ where: { facilityId, nextReviewDate: { lt: now }, status: 'ACTIVE' } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: { not: 'EXEMPT' } } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: 'COMPLETED' } }),
    prisma.trainingRecord.count({ where: { facilityId, expiryDate: { gte: now, lte: in30 }, status: { not: 'EXEMPT' } } }),
    prisma.trainingRecord.count({ where: { facilityId, expiryDate: { lt: now }, status: { notIn: ['EXEMPT', 'COMPLETED'] } } }),
    prisma.providerLicense.count({ where: { provider: { facilityId }, expiryDate: { lte: in90 }, status: 'ACTIVE' } }),
    prisma.controlledSubstanceLog.count({ where: { facilityId, status: 'DISCREPANCY_OPEN' } }),
    prisma.hipaaBreachLog.count({ where: { facilityId, status: { notIn: ['CLOSED', 'REPORTED_TO_HHS'] } } }),
    prisma.restraintEvent.count({ where: { facilityId, deathOccurred: true, eventDate: { gte: yearStart } } }),
    prisma.eocDeficiency.count({ where: { facilityId, status: 'OPEN' } }),
    prisma.eocDeficiency.count({ where: { facilityId, status: 'OPEN', dueDate: { lt: now } } }),
    prisma.drill.findMany({ where: { facilityId, scheduledDate: { gte: yearStart } }, select: { drillType: true, status: true } }),
    prisma.incidentReport.findMany({
      where: { facilityId, severity: 'SENTINEL' },
      orderBy: { incidentDate: 'desc' }, take: 5,
      select: { irNumber: true, incidentType: true, incidentDate: true, status: true },
    }),
    prisma.correctiveActionPlan.findMany({
      where: { facilityId, targetDate: { lt: now }, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
      orderBy: { targetDate: 'asc' }, take: 5,
      select: { capNumber: true, title: true, targetDate: true, priority: true },
    }),
  ]);

  const trainingPct = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : null;
  const fireDrills = drillsYtd.filter((d: { drillType: string; status: string }) => d.drillType === 'FIRE_EVACUATION' && d.status === 'COMPLETED').length;
  const tabletops  = drillsYtd.filter((d: { drillType: string; status: string }) => d.drillType === 'TABLETOP' && d.status === 'COMPLETED').length;
  const functional = drillsYtd.filter((d: { drillType: string; status: string }) => ['FUNCTIONAL_DRILL', 'FULL_SCALE'].includes(d.drillType) && d.status === 'COMPLETED').length;

  return NextResponse.json({
    generatedAt: now.toISOString(),
    facilityName: facility?.name ?? 'Unknown Facility',
    reportYear: now.getFullYear(),
    overview: { overdueEvents, upcomingEvents30, openCaps, overdueCaps },
    grievances: { open: openGrievances, overdueAck: overdueGrievanceAck, overdueRes: overdueGrievanceRes },
    incidents: { open: openIrIad, sentinelOpen, adhsOverdue },
    qoc: { open: openQoc, immediateJeopardy: qocImmediateJeopardy },
    policies: { overdue: overduePolicies },
    training: { pct: trainingPct, expiring30: expiringTraining30, expired: expiredTraining },
    workforce: { licensesExpiring90, csDiscrepancies, openHipaaBreaches },
    safety: { restraintDeathsYtd, eocOpenDeficiencies, eocOverdueDeficiencies },
    drills: { fire: fireDrills, tabletop: tabletops, functional },
    recentSentinels,
    overdueCAPList,
  });
}
