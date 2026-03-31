import {
  ALERT_SWEEP_LOG_TITLE,
  EXPORT_SUMMARY_LOG_TITLE,
} from '@/lib/notifications/preferences';
import { prisma } from '@/lib/prisma';

type TrendPoint = {
  label: string;
  incidentCount: number;
  capClosures: number;
  trainingCompletions: number;
};

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

function addUtcMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1, 0, 0, 0, 0));
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function pctDelta(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round(((current - previous) / previous) * 100);
}

async function countRange<T>(model: { count(args: { where: T }): Promise<number> }, where: T): Promise<number> {
  return model.count({ where });
}

export async function getBoardReportSummary(facilityId: string) {
  const since180 = startOfUtcMonth(addUtcMonths(new Date(), -5));
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const previous90Start = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const in90 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const monthStarts = Array.from({ length: 6 }, (_, index) => addUtcMonths(since180, index));

  const [
    facility,
    incidentCount90,
    criticalIncidentCount,
    openCaps,
    overdueCaps,
    trainingAll,
    trainingCompleted,
    grievancesOpen,
    expiringLicenses90,
    openHipaaBreaches,
    csDiscrepanciesOpen,
    upcomingPolicies,
    currentIncident90,
    previousIncident90,
    currentCritical90,
    previousCritical90,
    currentCapClosures90,
    previousCapClosures90,
    currentTrainingCompletions90,
    previousTrainingCompletions90,
    recentAutomation,
    ...trendCounts
  ] = await Promise.all([
    prisma.facility.findUnique({
      where: { id: facilityId },
      select: { name: true, city: true, state: true, facilityType: true, bedCount: true, licenseNumber: true },
    }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: since90 } } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: since90 }, aiTriageSeverity: { in: ['CRITICAL', 'HIGH'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: { in: ['OPEN', 'IN_PROGRESS', 'OVERDUE'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, targetDate: { lt: now }, status: { notIn: ['COMPLETED', 'VERIFIED'] } } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: 'COMPLETED' } }),
    prisma.grievanceRecord.count({ where: { facilityId, status: { in: ['OPEN', 'UNDER_REVIEW', 'ACKNOWLEDGMENT_SENT', 'PENDING_RESOLUTION'] } } }),
    prisma.providerLicense.count({ where: { provider: { facilityId }, expiryDate: { lte: in90 }, status: 'ACTIVE' } }),
    prisma.hipaaBreachLog.count({ where: { facilityId, status: { notIn: ['CLOSED', 'REPORTED_TO_HHS'] } } }),
    prisma.controlledSubstanceLog.count({ where: { facilityId, status: 'DISCREPANCY_OPEN' } }),
    prisma.policy.count({ where: { facilityId, nextReviewDate: { lte: in90 }, status: 'ACTIVE' } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: since90 } } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: previous90Start, lt: since90 } } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: since90 }, aiTriageSeverity: { in: ['CRITICAL', 'HIGH'] } } }),
    prisma.incidentReport.count({ where: { facilityId, incidentDate: { gte: previous90Start, lt: since90 }, aiTriageSeverity: { in: ['CRITICAL', 'HIGH'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, completedDate: { gte: since90 }, status: { in: ['COMPLETED', 'VERIFIED'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, completedDate: { gte: previous90Start, lt: since90 }, status: { in: ['COMPLETED', 'VERIFIED'] } } }),
    prisma.trainingRecord.count({ where: { facilityId, completedDate: { gte: since90 }, status: 'COMPLETED' } }),
    prisma.trainingRecord.count({ where: { facilityId, completedDate: { gte: previous90Start, lt: since90 }, status: 'COMPLETED' } }),
    prisma.notification.findMany({
      where: {
        facilityId,
        type: 'SYSTEM',
        title: { in: [ALERT_SWEEP_LOG_TITLE, EXPORT_SUMMARY_LOG_TITLE] },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { title: true, message: true, createdAt: true },
    }),
    ...monthStarts.flatMap((start) => {
      const end = addUtcMonths(start, 1);
      return [
        countRange(prisma.incidentReport, { facilityId, incidentDate: { gte: start, lt: end } }),
        countRange(prisma.correctiveActionPlan, { facilityId, completedDate: { gte: start, lt: end }, status: { in: ['COMPLETED', 'VERIFIED'] } }),
        countRange(prisma.trainingRecord, { facilityId, completedDate: { gte: start, lt: end }, status: 'COMPLETED' }),
      ];
    }),
  ]);

  const trends: TrendPoint[] = monthStarts.map((start, index) => ({
    label: monthLabel(start),
    incidentCount: Number(trendCounts[index * 3] ?? 0),
    capClosures: Number(trendCounts[index * 3 + 1] ?? 0),
    trainingCompletions: Number(trendCounts[index * 3 + 2] ?? 0),
  }));

  const automationHistory = recentAutomation.flatMap((row) => {
    try {
      const parsed = JSON.parse(row.message) as {
        runType?: 'alerts' | 'exports';
        mode?: 'daily' | 'weekly' | 'immediate';
        notificationsCreated?: number;
        digestsSent?: number;
        recipients?: number;
        sent?: number;
        failures?: number;
        triggeredBy?: 'cron' | 'admin';
        createdAt?: string;
      };
      return [{
        runType: parsed.runType ?? (row.title === ALERT_SWEEP_LOG_TITLE ? 'alerts' : 'exports'),
        mode: parsed.mode ?? 'immediate',
        notificationsCreated: parsed.notificationsCreated ?? 0,
        digestsSent: parsed.digestsSent ?? 0,
        recipients: parsed.recipients ?? 0,
        sent: parsed.sent ?? 0,
        failures: parsed.failures ?? 0,
        triggeredBy: parsed.triggeredBy ?? 'cron',
        createdAt: parsed.createdAt ?? row.createdAt.toISOString(),
      }];
    } catch {
      return [];
    }
  });

  const trainingPct = trainingAll > 0 ? Math.round((trainingCompleted / trainingAll) * 100) : 100;
  let resilience = trainingPct * 0.4;
  const irRate = incidentCount90 === 0 ? 100 : incidentCount90 <= 3 ? 80 : incidentCount90 <= 7 ? 60 : 40;
  resilience += irRate * 0.3;
  const capRate = openCaps === 0 ? 100 : openCaps <= 3 ? 85 : 70;
  resilience += capRate * 0.2;
  const grievanceRate = grievancesOpen === 0 ? 100 : grievancesOpen <= 2 ? 80 : 60;
  resilience += grievanceRate * 0.1;
  const resilienceScore = Math.round(resilience);
  const resilienceGrade = resilienceScore >= 90 ? 'A' : resilienceScore >= 80 ? 'B' : resilienceScore >= 70 ? 'C' : resilienceScore >= 60 ? 'D' : 'F';

  const highlights = [
    overdueCaps > 0 ? `${overdueCaps} corrective action plan${overdueCaps === 1 ? '' : 's'} overdue` : null,
    trainingPct < 80 ? `training compliance below target at ${trainingPct}%` : null,
    criticalIncidentCount > 0 ? `${criticalIncidentCount} critical/high incident${criticalIncidentCount === 1 ? '' : 's'} in the last 90 days` : null,
    openHipaaBreaches > 0 ? `${openHipaaBreaches} open HIPAA breach case${openHipaaBreaches === 1 ? '' : 's'}` : null,
    expiringLicenses90 > 0 ? `${expiringLicenses90} provider license${expiringLicenses90 === 1 ? '' : 's'} expiring within 90 days` : null,
  ].filter(Boolean) as string[];

  return {
    generatedAt: now,
    facility,
    resilienceScore,
    resilienceGrade,
    trainingPct,
    comparisons: {
      incidentsDeltaPct: pctDelta(currentIncident90, previousIncident90),
      criticalIncidentsDeltaPct: pctDelta(currentCritical90, previousCritical90),
      capClosuresDeltaPct: pctDelta(currentCapClosures90, previousCapClosures90),
      trainingCompletionsDeltaPct: pctDelta(currentTrainingCompletions90, previousTrainingCompletions90),
    },
    trends,
    automationHistory,
    metrics: {
      incidentCount90,
      criticalIncidentCount,
      openCaps,
      overdueCaps,
      trainingAll,
      trainingCompleted,
      grievancesOpen,
      expiringLicenses90,
      openHipaaBreaches,
      csDiscrepanciesOpen,
      upcomingPolicies,
    },
    highlights,
  };
}
