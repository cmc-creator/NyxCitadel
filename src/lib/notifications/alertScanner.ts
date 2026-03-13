import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface AlertInput {
  userId: string;
  facilityId: string;
}

/**
 * Scans the database for compliance alert conditions and upserts
 * Notification records for the given user. Safe to call on every
 * polling interval — deduplication prevents duplicate alerts within 3 days.
 * Respects the user's notificationPrefs JSON settings.
 */
export async function generateComplianceAlerts({ userId, facilityId }: AlertInput): Promise<void> {
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const in30Days  = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const dedupWindow = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3-day dedupe window

  // Load user prefs — absence of a key means enabled by default
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationPrefs: true },
  });
  const prefs = (user?.notificationPrefs ?? {}) as Record<string, { enabled: boolean }>;
  function prefEnabled(key: string): boolean {
    return prefs[key]?.enabled !== false;
  }

  const alerts: { type: NotificationType; title: string; message: string; linkUrl: string }[] = [];

  // ── 1. Expiring provider licenses (within 90 days) ─────────────────────
  if (prefEnabled('LICENSE_EXPIRING')) {
    const expiringLicenses = await prisma.providerLicense.findMany({
      where: {
        provider: { facilityId },
        expiryDate: { lte: in90Days },
        status: { in: ['ACTIVE', 'PENDING_RENEWAL'] },
      },
      include: { provider: { select: { firstName: true, lastName: true, credentials: true } } },
    });
    for (const lic of expiringLicenses) {
      const daysLeft = Math.floor((lic.expiryDate.getTime() - now.getTime()) / 86400000);
      const providerName = `${lic.provider.firstName} ${lic.provider.lastName}, ${lic.provider.credentials}`;
      alerts.push({
        type: NotificationType.LICENSE_EXPIRING,
        title: `License Expiring: ${providerName}`,
        message: `${lic.licenseType} (${lic.licenseNumber}) expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} on ${lic.expiryDate.toLocaleDateString()}.`,
        linkUrl: '/credentialing/licenses',
      });
    }
  }

  // ── 2. Open CS discrepancies ────────────────────────────────────────────
  if (prefEnabled('CS_DISCREPANCY')) {
    const openDiscrepancies = await prisma.controlledSubstanceLog.findMany({
      where: { facilityId, status: 'DISCREPANCY_OPEN' },
      orderBy: { logDate: 'desc' },
      take: 5,
    });
    for (const cs of openDiscrepancies) {
      alerts.push({
        type: NotificationType.CS_DISCREPANCY,
        title: `CS Discrepancy: ${cs.medicationName}`,
        message: `Open controlled substance discrepancy (${cs.countDifference > 0 ? '+' : ''}${cs.countDifference}) reported on ${cs.logDate.toLocaleDateString()} — not yet resolved.`,
        linkUrl: '/trackers/compliance',
      });
    }
  }

  // ── 3. Overdue TB screenings ────────────────────────────────────────────
  if (prefEnabled('TB_OVERDUE')) {
    const overdueTb = await prisma.employeeHealthRecord.findMany({
      where: { facilityId, tbNextDueDate: { lt: now } },
    });
    for (const emp of overdueTb) {
      const daysOverdue = Math.floor((now.getTime() - (emp.tbNextDueDate?.getTime() ?? 0)) / 86400000);
      alerts.push({
        type: NotificationType.TB_OVERDUE,
        title: `TB Screening Overdue: ${emp.employeeName}`,
        message: `Annual TB screening for ${emp.employeeName} (${emp.department}) is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue.`,
        linkUrl: '/trackers/training',
      });
    }
  }

  // ── 4. Pending MOON notices ─────────────────────────────────────────────
  if (prefEnabled('MOON_MISSING')) {
    const pendingMoon = await prisma.moonNotice.findMany({
      where: { facilityId, status: 'PENDING' },
    });
    for (const moon of pendingMoon) {
      const hoursInObs = Math.floor((now.getTime() - moon.observationStartDate.getTime()) / 3600000);
      alerts.push({
        type: NotificationType.MOON_MISSING,
        title: `MOON Notice Pending: Patient ${moon.patientInitials}`,
        message: `Patient ${moon.patientInitials} has been on observation status for ${hoursInObs} hours. MOON notice required within 36 hours — not yet issued.`,
        linkUrl: '/trackers/compliance',
      });
    }
  }

  // ── 5. Overdue governance document reviews ─────────────────────────────
  if (prefEnabled('GOVERNANCE_DOC_OVERDUE')) {
    const overdueGovDocs = await prisma.governanceDocument.findMany({
      where: { facilityId, reviewDate: { lt: now }, status: 'ACTIVE' },
    });
    for (const doc of overdueGovDocs) {
      const daysOverdue = Math.floor((now.getTime() - (doc.reviewDate?.getTime() ?? 0)) / 86400000);
      alerts.push({
        type: NotificationType.GOVERNANCE_DOC_OVERDUE,
        title: `Governance Doc Review Overdue: ${doc.title}`,
        message: `${doc.title} (v${doc.version ?? 'N/A'}) review was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago.`,
        linkUrl: '/governance/documents',
      });
    }
  }

  // ── 6. High-risk HIPAA breaches not yet resolved ────────────────────────
  if (prefEnabled('BREACH_REPORTABLE')) {
    const highRiskBreaches = await prisma.hipaaBreachLog.findMany({
      where: {
        facilityId,
        riskAssessment: { in: ['HIGH', 'CONFIRMED'] },
        status: { notIn: ['CLOSED', 'REPORTED_TO_HHS'] },
      },
    });
    for (const breach of highRiskBreaches) {
      const daysSince = Math.floor((now.getTime() - breach.discoveryDate.getTime()) / 86400000);
      alerts.push({
        type: NotificationType.BREACH_REPORTABLE,
        title: `HIPAA Breach Requires Action: ${breach.incidentNumber}`,
        message: `${breach.incidentNumber} (${breach.breachType.replace(/_/g, ' ')}) has been open for ${daysSince} day${daysSince !== 1 ? 's' : ''} — potential 60-day HHS notification deadline.`,
        linkUrl: '/hipaa/breaches',
      });
    }
  }

  // ── 7. Overdue corrective action plans ─────────────────────────────────
  if (prefEnabled('CAP_OVERDUE')) {
    const overdueCaps = await prisma.correctiveActionPlan.findMany({
      where: {
        facilityId,
        targetCompletionDate: { lt: now },
        status: { notIn: ['COMPLETED', 'VERIFIED', 'CANCELLED'] },
      },
      take: 10,
      orderBy: { targetCompletionDate: 'asc' },
    });
    for (const cap of overdueCaps) {
      const daysOverdue = Math.floor((now.getTime() - (cap.targetCompletionDate?.getTime() ?? 0)) / 86400000);
      alerts.push({
        type: NotificationType.CAP_OVERDUE,
        title: `CAP Overdue: ${cap.title}`,
        message: `Corrective action plan "${cap.title}" was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago and is still ${cap.status.replace(/_/g, ' ').toLowerCase()}.`,
        linkUrl: '/trackers/caps',
      });
    }
  }

  // ── 8. Policies overdue for review ─────────────────────────────────────
  if (prefEnabled('POLICY_OVERDUE')) {
    const overduePolicies = await prisma.policy.findMany({
      where: {
        facilityId,
        nextReviewDate: { lt: now },
        status: 'ACTIVE',
      },
      take: 10,
      orderBy: { nextReviewDate: 'asc' },
    });
    for (const pol of overduePolicies) {
      const daysOverdue = Math.floor((now.getTime() - (pol.nextReviewDate?.getTime() ?? 0)) / 86400000);
      alerts.push({
        type: NotificationType.POLICY_OVERDUE,
        title: `Policy Review Overdue: ${pol.title}`,
        message: `"${pol.title}" (${pol.policyNumber ?? 'no number'}) review was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago.`,
        linkUrl: '/trackers/policies',
      });
    }
  }

  // ── 9. Expiring training records (within 30 days) ──────────────────────
  if (prefEnabled('TRAINING_EXPIRING')) {
    const expiringTraining = await prisma.trainingRecord.findMany({
      where: {
        facilityId,
        expiryDate: { gte: now, lte: in30Days },
        status: { not: 'EXEMPT' },
      },
      take: 10,
    });
    for (const tr of expiringTraining) {
      const daysLeft = Math.floor((tr.expiryDate!.getTime() - now.getTime()) / 86400000);
      alerts.push({
        type: NotificationType.TRAINING_EXPIRING,
        title: `Training Expiring: ${tr.trainingTitle}`,
        message: `"${tr.trainingTitle}" for ${tr.employeeName} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} on ${tr.expiryDate!.toLocaleDateString()}.`,
        linkUrl: '/trackers/training',
      });
    }
  }

  // ── 10. Open sentinel / serious safety events ──────────────────────────
  if (prefEnabled('SENTINEL_EVENT')) {
    const sentinels = await prisma.incidentReport.findMany({
      where: {
        facilityId,
        severity: 'SENTINEL',
        status: { not: 'CLOSED' },
      },
      take: 5,
    });
    for (const ir of sentinels) {
      alerts.push({
        type: NotificationType.SENTINEL_EVENT,
        title: `Open Sentinel Event: ${ir.reportNumber}`,
        message: `Sentinel event ${ir.reportNumber} (${ir.incidentType.replace(/_/g, ' ')}) on ${ir.incidentDate.toLocaleDateString()} is still open.`,
        linkUrl: '/trackers/ir-iad',
      });
    }
  }

  // ── 11. Overdue calendar events ────────────────────────────────────────
  if (prefEnabled('OVERDUE_ALERT')) {
    const overdueEvents = await prisma.calendarEvent.findMany({
      where: {
        facilityId,
        dueDate: { lt: now },
        completedDate: null,
        status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] },
      },
      take: 10,
      orderBy: { dueDate: 'asc' },
    });
    for (const ev of overdueEvents) {
      const daysOverdue = Math.floor((now.getTime() - ev.dueDate.getTime()) / 86400000);
      alerts.push({
        type: NotificationType.OVERDUE_ALERT,
        title: `Overdue: ${ev.title}`,
        message: `"${ev.title}" was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago and is not yet completed.`,
        linkUrl: '/calendar',
      });
    }
  }

  // ── 7. Unnotified regulatory updates ────────────────────────────────────
  // Find updates published after the last REGULATORY_UPDATE notification for this user.
  const lastRegNotif = await prisma.notification.findFirst({
    where: { userId, type: NotificationType.REGULATORY_UPDATE },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });

  const newUpdates = await prisma.regulatoryUpdate.findMany({
    where: {
      isActive: true,
      createdAt: lastRegNotif ? { gt: lastRegNotif.createdAt } : undefined,
    },
    orderBy: { createdAt: 'asc' },
  });

  const urgencyLabel: Record<string, string> = {
    CRITICAL:      '🚨 Critical',
    HIGH:          '⚠️ High Priority',
    MEDIUM:        'ℹ️ Medium',
    INFORMATIONAL: '📋 Informational',
  };

  for (const upd of newUpdates) {
    alerts.push({
      type: 'REGULATORY_UPDATE',
      title: `Regulatory Update: ${upd.title}`,
      message: `${urgencyLabel[upd.urgency] ?? upd.urgency} · ${upd.regulatoryBody}${upd.standardRef ? ` (${upd.standardRef})` : ''} — ${upd.summary.slice(0, 120)}${upd.summary.length > 120 ? '…' : ''}`,
      linkUrl: `/regulatory-updates/${upd.id}`,
    });
  }

  // ── Upsert (deduplicate within 3-day window) ────────────────────────────
  for (const alert of alerts) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: alert.type,
        title: alert.title,
        createdAt: { gte: dedupWindow },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          facilityId,
          title:   alert.title,
          message: alert.message,
          type:    alert.type,
          linkUrl: alert.linkUrl,
          isRead:  false,
        },
      });
    }
  }
}
