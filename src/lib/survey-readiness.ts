import { prisma } from '@/lib/prisma';
import { subDays } from 'date-fns';

export interface ReadinessDomain {
  label: string;
  score: number;
  maxScore: number;
  pct: number;
  detail: string;
}

export interface SurveyReadinessResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  domains: Record<string, ReadinessDomain>;
  computedAt: string;
}

function gradeFromScore(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export async function getSurveyReadinessScore(facilityId: string): Promise<SurveyReadinessResult> {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const [
    totalActivePolicies,
    overduePolicies,
    totalCaps,
    overdueHighCaps,
    totalGrievancesLast90,
    resolvedWithin30,
    sentinelMajorIncidents,
    incidentsWithRca,
    totalRequired,
    completedRequired,
  ] = await Promise.all([
    // Policies
    prisma.policy.count({ where: { facilityId, status: 'ACTIVE' } }),
    prisma.policy.count({ where: { facilityId, status: 'ACTIVE', nextReviewDate: { lt: now } } }),

    // CAPs: penalize overdue HIGH/CRITICAL
    prisma.correctiveActionPlan.count({
      where: { facilityId, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
    }),
    prisma.correctiveActionPlan.count({
      where: {
        facilityId,
        status: { notIn: ['COMPLETED', 'VERIFIED'] },
        priority: { in: ['HIGH', 'CRITICAL'] },
        targetDate: { lt: now },
      },
    }),

    // Grievance resolution compliance (last 90 days)
    prisma.grievanceRecord.count({
      where: { facilityId, dateReceived: { gte: subDays(now, 90) } },
    }),
    prisma.grievanceRecord.count({
      where: {
        facilityId,
        dateReceived: { gte: subDays(now, 90) },
        resolutionDate: { not: null },
        // Resolved within 30 days: resolutionDate <= dateReceived + 30d
        // We approximate: resolutionDate is set, and grievance is closed
        status: { in: ['CLOSED', 'RESOLVED'] },
      },
    }),

    // Incident follow-up - sentinel/major that need RCA
    prisma.incident.count({
      where: { facilityId, severity: { in: ['SENTINEL', 'MAJOR'] } },
    }),
    prisma.incident.count({
      where: {
        facilityId,
        severity: { in: ['SENTINEL', 'MAJOR'] },
        rootCauseAnalysis: { not: null },
      },
    }),

    // Training compliance
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: { not: 'EXEMPT' } } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: 'COMPLETED' } }),
  ]);

  // ── Domain 1: Policy Currency (weight 20) ──────────────────────────────────
  const policyScore = totalActivePolicies === 0
    ? 20
    : Math.round(((totalActivePolicies - overduePolicies) / totalActivePolicies) * 20);
  const policyDomain: ReadinessDomain = {
    label: 'Policy Currency',
    score: policyScore,
    maxScore: 20,
    pct: Math.round((policyScore / 20) * 100),
    detail: totalActivePolicies === 0
      ? 'No active policies'
      : `${totalActivePolicies - overduePolicies}/${totalActivePolicies} policies current`,
  };

  // ── Domain 2: CAP Compliance (weight 25) ───────────────────────────────────
  // Start at 25, deduct 5 per overdue HIGH/CRITICAL CAP (floor 0)
  const capScore = Math.max(0, 25 - (overdueHighCaps * 5));
  const capDomain: ReadinessDomain = {
    label: 'CAP Completion',
    score: capScore,
    maxScore: 25,
    pct: Math.round((capScore / 25) * 100),
    detail: overdueHighCaps === 0
      ? `${totalCaps} total open - no overdue high-priority`
      : `${overdueHighCaps} overdue high/critical CAP${overdueHighCaps > 1 ? 's' : ''}`,
  };

  // ── Domain 3: Grievance Compliance (weight 20) ─────────────────────────────
  const grievanceScore = totalGrievancesLast90 === 0
    ? 20
    : Math.round((resolvedWithin30 / totalGrievancesLast90) * 20);
  const grievanceDomain: ReadinessDomain = {
    label: 'Grievance Resolution',
    score: grievanceScore,
    maxScore: 20,
    pct: Math.round((grievanceScore / 20) * 100),
    detail: totalGrievancesLast90 === 0
      ? 'No grievances in last 90 days'
      : `${resolvedWithin30}/${totalGrievancesLast90} resolved (90d window)`,
  };

  // ── Domain 4: Incident Follow-up (weight 20) ───────────────────────────────
  const incidentScore = sentinelMajorIncidents === 0
    ? 20
    : Math.round((incidentsWithRca / sentinelMajorIncidents) * 20);
  const incidentDomain: ReadinessDomain = {
    label: 'Incident Follow-up',
    score: incidentScore,
    maxScore: 20,
    pct: Math.round((incidentScore / 20) * 100),
    detail: sentinelMajorIncidents === 0
      ? 'No sentinel/major incidents'
      : `${incidentsWithRca}/${sentinelMajorIncidents} sentinel/major have RCA`,
  };

  // ── Domain 5: Training Compliance (weight 15) ──────────────────────────────
  const trainingScore = totalRequired === 0
    ? 15
    : Math.round((completedRequired / totalRequired) * 15);
  const trainingDomain: ReadinessDomain = {
    label: 'Training Compliance',
    score: trainingScore,
    maxScore: 15,
    pct: Math.round((trainingScore / 15) * 100),
    detail: totalRequired === 0
      ? 'No required trainings on record'
      : `${completedRequired}/${totalRequired} required trainings complete`,
  };

  const totalScore = policyScore + capScore + grievanceScore + incidentScore + trainingScore;

  return {
    score: totalScore,
    grade: gradeFromScore(totalScore),
    domains: {
      policy: policyDomain,
      caps: capDomain,
      grievances: grievanceDomain,
      incidents: incidentDomain,
      training: trainingDomain,
    },
    computedAt: now.toISOString(),
  };
}
