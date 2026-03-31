import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

export interface ComplianceHealthScore {
  overallScore: number;
  domains: {
    calendar: { score: number; label: string; color: string };
    training: { score: number; label: string; color: string };
    caps: { score: number; label: string; color: string };
    policies: { score: number; label: string; color: string };
    qapi: { score: number; label: string; color: string };
  };
  summary: {
    overdueItems: number;
    openCaps: number;
    incompleteTraining: number;
    expiredPolicies: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  lastCalculated: Date;
}

export async function calculateComplianceHealth(facilityId: string): Promise<ComplianceHealthScore> {
  const now = new Date();
  const in30Days = addDays(now, 30);
  const in60Days = addDays(now, 60);

  // Fetch all relevant compliance data
  const [
    totalCalendarEvents,
    completedCalendarEvents,
    overdueCalendarEvents,
    upcomingCalendarEvents,
    totalTrainingRecords,
    completedTrainingRecords,
    expiringTrainingRecords,
    totalCaps,
    completedCaps,
    overdueCaps,
    totalPolicies,
    currentPolicies,
    expiredPolicies,
    upcomingPolicyReview,
    qapiMetrics,
    incidentCount,
    capDueDate,
  ] = await Promise.all([
    prisma.calendarEvent.count({ where: { facilityId } }),
    prisma.calendarEvent.count({ where: { facilityId, status: 'COMPLETED' } }),
    prisma.calendarEvent.count({ where: { facilityId, dueDate: { lt: now }, status: { not: 'COMPLETED' } } }),
    prisma.calendarEvent.count({ where: { facilityId, dueDate: { gte: now, lte: in30Days }, status: { notIn: ['COMPLETED', 'NA'] } } }),
    
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: 'COMPLETED' } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, expiryDate: { gte: now, lte: in30Days } } }),
    
    prisma.correctiveActionPlan.count({ where: { facilityId } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: 'COMPLETED' } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, targetDate: { lt: now }, status: { notIn: ['COMPLETED', 'VERIFIED'] } } }),
    
    prisma.policy.count({ where: { facilityId } }),
    prisma.policy.count({ where: { facilityId, status: 'ACTIVE' } }),
    prisma.policy.count({ where: { facilityId, nextReviewDate: { lt: now }, status: 'ACTIVE' } }),
    prisma.policy.count({ where: { facilityId, nextReviewDate: { gte: now, lte: in60Days }, status: 'ACTIVE' } }),
    
    prisma.qapiMetric.findMany({ where: { facilityId, year: now.getFullYear() }, take: 5 }),
    prisma.incidentReport.count({ where: { facilityId, status: { notIn: ['CLOSED'] } } }),
    prisma.correctiveActionPlan.findFirst({ where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } }, orderBy: { targetDate: 'asc' } }),
  ]);

  // Calculate individual domain scores (0-100)
  const calendarScore = totalCalendarEvents > 0 
    ? Math.max(0, 100 - ((overdueCalendarEvents / totalCalendarEvents) * 50) - ((upcomingCalendarEvents > 0 ? 10 : 0)))
    : 100;

  const trainingScore = totalTrainingRecords > 0
    ? Math.max(0, 100 - ((totalTrainingRecords - completedTrainingRecords) / totalTrainingRecords * 40) - ((expiringTrainingRecords > 0 ? 15 : 0)))
    : 100;

  const capScore = totalCaps > 0
    ? Math.max(0, 100 - ((totalCaps - completedCaps) / totalCaps * 30) - ((overdueCaps > 0 ? 25 : 0)))
    : 100;

  const policyScore = totalPolicies > 0
    ? Math.max(0, 100 - ((expiredPolicies / totalPolicies) * 40) - ((upcomingPolicyReview > 0 ? 20 : 0)))
    : 100;

  const qapiScore = qapiMetrics.length > 0 ? 85 : 70; // If data exists, assume good compliance

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (calendarScore * 0.25) +
    (trainingScore * 0.20) +
    (capScore * 0.25) +
    (policyScore * 0.15) +
    (qapiScore * 0.15)
  );

  // Determine trend (would normally compare to previous calculation)
  const trend: 'improving' | 'stable' | 'declining' = overallScore >= 85 ? 'improving' : overallScore >= 70 ? 'stable' : 'declining';

  return {
    overallScore,
    domains: {
      calendar: {
        score: Math.round(calendarScore),
        label: 'Compliance Calendar',
        color: calendarScore >= 80 ? 'text-emerald-500' : calendarScore >= 60 ? 'text-amber-500' : 'text-red-500',
      },
      training: {
        score: Math.round(trainingScore),
        label: 'Staff Training',
        color: trainingScore >= 80 ? 'text-emerald-500' : trainingScore >= 60 ? 'text-amber-500' : 'text-red-500',
      },
      caps: {
        score: Math.round(capScore),
        label: 'Corrective Actions',
        color: capScore >= 80 ? 'text-emerald-500' : capScore >= 60 ? 'text-amber-500' : 'text-red-500',
      },
      policies: {
        score: Math.round(policyScore),
        label: 'Policies & Procedures',
        color: policyScore >= 80 ? 'text-emerald-500' : policyScore >= 60 ? 'text-amber-500' : 'text-red-500',
      },
      qapi: {
        score: Math.round(qapiScore),
        label: 'Quality Metrics',
        color: qapiScore >= 80 ? 'text-emerald-500' : qapiScore >= 60 ? 'text-amber-500' : 'text-red-500',
      },
    },
    summary: {
      overdueItems: overdueCalendarEvents + overdueCaps + expiredPolicies,
      openCaps: totalCaps - completedCaps,
      incompleteTraining: totalTrainingRecords - completedTrainingRecords,
      expiredPolicies,
    },
    trend,
    lastCalculated: new Date(),
  };
}

export function getHealthScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  return 'text-red-500 bg-red-500/10 border-red-500/20';
}

export function getHealthScoreBadgeColor(score: number): string {
  if (score >= 85) return 'bg-emerald-600';
  if (score >= 70) return 'bg-amber-600';
  return 'bg-red-600';
}
