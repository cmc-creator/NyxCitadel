import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ALERT_SWEEP_LOG_TITLE, EXPORT_SUMMARY_LOG_TITLE } from '@/lib/notifications/preferences';

export const dynamic = 'force-dynamic';

function pct(part: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((part / total) * 100);
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const facilityId = session.user.facilityId;
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    activeUsers,
    totalUsers,
    complianceTotal,
    complianceDone,
    openCaps,
    overdueCaps,
    capsClosed30,
    incidents30,
    criticalIncidents30,
    trainingsRequired,
    trainingsCompleted,
    automationRuns,
  ] = await Promise.all([
    prisma.user.count({ where: { facilityId, isActive: true } }),
    prisma.user.count({ where: { facilityId } }),
    prisma.complianceItem.count({ where: { facilityId } }),
    prisma.complianceItem.count({ where: { facilityId, status: 'COMPLIANT' } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: { in: ['OPEN', 'IN_PROGRESS', 'OVERDUE'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, targetDate: { lt: new Date() }, status: { notIn: ['COMPLETED', 'VERIFIED'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, completedDate: { gte: last30 }, status: { in: ['COMPLETED', 'VERIFIED'] } } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: last30 } } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: last30 }, aiTriageSeverity: { in: ['HIGH', 'CRITICAL'] } } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: 'COMPLETED' } }),
    prisma.notification.findMany({
      where: {
        facilityId,
        type: 'SYSTEM',
        title: { in: [ALERT_SWEEP_LOG_TITLE, EXPORT_SUMMARY_LOG_TITLE] },
        createdAt: { gte: last30 },
      },
      orderBy: { createdAt: 'desc' },
      select: { title: true, message: true, createdAt: true },
      take: 100,
    }),
  ]);

  const automation = automationRuns.reduce(
    (acc, row) => {
      try {
        const parsed = JSON.parse(row.message) as { failures?: number; runType?: 'alerts' | 'exports' };
        acc.total += 1;
        if ((parsed.failures ?? 0) === 0) acc.successful += 1;
        if (parsed.runType === 'alerts') acc.alertRuns += 1;
        if (parsed.runType === 'exports') acc.exportRuns += 1;
      } catch {
        acc.total += 1;
      }
      return acc;
    },
    { total: 0, successful: 0, alertRuns: 0, exportRuns: 0 },
  );

  const payload = {
    staffActivationRate: pct(activeUsers, totalUsers),
    complianceCompletionRate: pct(complianceDone, complianceTotal),
    capOverdueRate: openCaps === 0 ? 0 : Math.round((overdueCaps / openCaps) * 100),
    trainingCompletionRate: pct(trainingsCompleted, trainingsRequired),
    automationReliabilityRate: pct(automation.successful, automation.total || 1),
    metrics: {
      activeUsers,
      totalUsers,
      complianceTotal,
      complianceDone,
      openCaps,
      overdueCaps,
      capsClosed30,
      incidents30,
      criticalIncidents30,
      trainingsRequired,
      trainingsCompleted,
      alertRuns30: automation.alertRuns,
      exportRuns30: automation.exportRuns,
      automationRuns30: automation.total,
    },
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(payload);
}
