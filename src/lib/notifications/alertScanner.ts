import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { sendNotificationEmail } from '@/lib/notifications/email';
import { getNotificationPreferences } from '@/lib/notifications/preferences';

interface AlertInput {
  userId: string;
  facilityId: string;
  deliverEmail?: boolean;
}

/**
 * Scans the database for compliance alert conditions and upserts
 * Notification records for the given user. Safe to call on every
 * polling interval ΓÇö deduplication prevents duplicate alerts within 3 days.
 * Respects the user's notificationPrefs JSON settings.
 */
export async function generateComplianceAlerts({ userId, facilityId, deliverEmail = true }: AlertInput): Promise<number> {
  const now = new Date();
  const dedupWindow = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3-day dedupe window
  const prefs = await getNotificationPreferences(userId, facilityId);

  function prefEnabled(key: string): boolean {
    return prefs.rules[key]?.enabled ?? true;
  }

  function prefDaysAhead(key: string, fallback: number): number {
    const configured = prefs.rules[key]?.daysAhead;
    if (typeof configured !== 'number') return fallback;
    return Math.max(0, Math.floor(configured));
  }

  const alerts: { type: NotificationType; title: string; message: string; linkUrl: string }[] = [];
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

  // ΓöÇΓöÇ 1. Expiring provider licenses (within 90 days) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (prefEnabled('LICENSE_EXPIRING')) {
    const inDays = new Date(now.getTime() + prefDaysAhead('LICENSE_EXPIRING', 90) * 24 * 60 * 60 * 1000);
    const expiringLicenses = await prisma.providerLicense.findMany({
      where: {
        provider: { facilityId },
        expiryDate: { lte: inDays },
        status: { in: ['ACTIVE', 'PENDING_RENEWAL'] },
      },
      include: { provider: { select: { firstName: true, lastName: true, credentials: true } } },
    });
    for (const lic of expiringLicenses) {
      const daysLeft = Math.floor((lic.expiryDate.getTime() - now.getTime()) / 86400000);
      const providerName = `${lic.provider.firstName} ${lic.provider.lastName}, ${lic.provider.credentials}`;
      alerts.push({
        type: NotificationType.DEADLINE_REMINDER,
        title: `License Expiring: ${providerName}`,
        message: `${lic.licenseType} (${lic.licenseNumber}) expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} on ${lic.expiryDate.toLocaleDateString()}.`,
        linkUrl: '/credentialing/licenses',
      });
    }
  }

  // ΓöÇΓöÇ 2. Open CS discrepancies ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (prefEnabled('CS_DISCREPANCY')) {
    const openDiscrepancies = await prisma.controlledSubstanceLog.findMany({
      where: { facilityId, status: 'DISCREPANCY_OPEN' },
      orderBy: { logDate: 'desc' },
      take: 5,
    });
    for (const cs of openDiscrepancies) {
      alerts.push({
        type: NotificationType.INCIDENT_UPDATE,
        title: `CS Discrepancy: ${cs.medicationName}`,
        message: `Open controlled substance discrepancy (${cs.countDifference > 0 ? '+' : ''}${cs.countDifference}) reported on ${cs.logDate.toLocaleDateString()} ΓÇö not yet resolved.`,
        linkUrl: '/trackers/compliance',
      });
    }
  }

  // ΓöÇΓöÇ 3. Overdue TB screenings ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (prefEnabled('TB_OVERDUE')) {
    const overdueTb = await prisma.employeeHealthRecord.findMany({
      where: { facilityId, tbNextDueDate: { lt: now } },
    });
    for (const emp of overdueTb) {
      const daysOverdue = Math.floor((now.getTime() - (emp.tbNextDueDate?.getTime() ?? 0)) / 86400000);
      alerts.push({
        type: NotificationType.DEADLINE_REMINDER,
        title: `TB Screening Overdue: ${emp.employeeName}`,
        message: `Annual TB screening for ${emp.employeeName} (${emp.department}) is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue.`,
        linkUrl: '/trackers/training',
      });
    }
  }

  // ΓöÇΓöÇ 4. Pending MOON notices ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (prefEnabled('MOON_MISSING')) {
    const pendingMoon = await prisma.moonNotice.findMany({
      where: { facilityId, status: 'PENDING' },
    });
    for (const moon of pendingMoon) {
      const hoursInObs = Math.floor((now.getTime() - moon.observationStartDate.getTime()) / 3600000);
      alerts.push({
        type: NotificationType.DEADLINE_REMINDER,
        title: `MOON Notice Pending: Patient ${moon.patientInitials}`,
        message: `Patient ${moon.patientInitials} has been on observation status for ${hoursInObs} hours. MOON notice required within 36 hours ΓÇö not yet issued.`,
        linkUrl: '/trackers/compliance',
      });
    }
  }

  // ΓöÇΓöÇ 5. Overdue governance document reviews ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (prefEnabled('GOVERNANCE_DOC_OVERDUE')) {
    const overdueGovDocs = await prisma.governanceDocument.findMany({
      where: { facilityId, reviewDate: { lt: now }, status: 'ACTIVE' },
    });
    for (const doc of overdueGovDocs) {
      const daysOverdue = Math.floor((now.getTime() - (doc.reviewDate?.getTime() ?? 0)) / 86400000);
      alerts.push({
        type: NotificationType.POLICY_REVIEW_DUE,
        title: `Governance Doc Review Overdue: ${doc.title}`,
        message: `${doc.title} (v${doc.version ?? 'N/A'}) review was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago.`,
        linkUrl: '/governance/documents',
      });
    }
  }

  // ΓöÇΓöÇ 6. High-risk HIPAA breaches not yet resolved ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
        type: NotificationType.INCIDENT_UPDATE,
        title: `HIPAA Breach Requires Action: ${breach.incidentNumber}`,
        message: `${breach.incidentNumber} (${breach.breachType.replace(/_/g, ' ')}) has been open for ${daysSince} day${daysSince !== 1 ? 's' : ''} ΓÇö potential 60-day HHS notification deadline.`,
        linkUrl: '/hipaa/breaches',
      });
    }
  }

  // ΓöÇΓöÇ 7. Overdue corrective action plans ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (prefEnabled('CAP_OVERDUE')) {
    const overdueCaps = await prisma.correctiveActionPlan.findMany({
      where: {
        facilityId,
        targetDate: { lt: now },
        status: { notIn: ['COMPLETED', 'VERIFIED'] },
      },
      take: 10,
      orderBy: { targetDate: 'asc' },
    });
    for (const cap of overdueCaps) {
  const daysOverdue = Math.floor((now.getTime() - (cap.targetDate?.getTime() ?? 0)) / 86400000);
      alerts.push({
        type: NotificationType.CAP_UPDATE,
        title: `CAP Overdue: ${cap.title}`,
        message: `Corrective action plan "${cap.title}" was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago and is still ${cap.status.replace(/_/g, ' ').toLowerCase()}.`,
        linkUrl: '/trackers/caps',
      });
    }
  }

  // ΓöÇΓöÇ 8. Policies overdue for review ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
        type: NotificationType.POLICY_REVIEW_DUE,
        title: `Policy Review Overdue: ${pol.title}`,
        message: `"${pol.title}" (${pol.policyNumber ?? 'no number'}) review was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago.`,
        linkUrl: '/trackers/policies',
      });
    }
  }

  // ΓöÇΓöÇ 9. Expiring training records (within 30 days) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  if (prefEnabled('TRAINING_EXPIRING')) {
    const inDays = new Date(now.getTime() + prefDaysAhead('TRAINING_EXPIRING', 30) * 24 * 60 * 60 * 1000);
    const expiringTraining = await prisma.trainingRecord.findMany({
      where: {
        facilityId,
        expiryDate: { gte: now, lte: inDays },
        status: { not: 'EXEMPT' },
      },
      take: 10,
    });
    for (const tr of expiringTraining) {
      const daysLeft = Math.floor((tr.expiryDate!.getTime() - now.getTime()) / 86400000);
      alerts.push({
        type: NotificationType.TRAINING_EXPIRING,
        title: `Training Expiring: ${tr.trainingName}`,
        message: `"${tr.trainingName}" for ${tr.staffName} expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} on ${tr.expiryDate!.toLocaleDateString()}.`,
        linkUrl: '/trackers/training',
      });
    }
  }

  // ΓöÇΓöÇ 10. Open sentinel / serious safety events ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
  type: NotificationType.INCIDENT_UPDATE,
        title: `Open Sentinel Event: ${ir.irNumber}`,
        message: `Sentinel event ${ir.irNumber} (${ir.incidentType.replace(/_/g, ' ')}) on ${ir.incidentDate.toLocaleDateString()} is still open.`,
        linkUrl: '/trackers/ir-iad',
      });
    }
  }

  // ΓöÇΓöÇ 11. Overdue calendar events ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ─── 12. New high-urgency regulatory updates (within last 7 days) ────────────
  if (prefEnabled('REG_UPDATE_NEW')) {
    const since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newUpdates = await prisma.regulatoryUpdate.findMany({
      where: {
        isActive: true,
        createdAt: { gte: since },
        urgency: { in: ['CRITICAL', 'HIGH'] },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
    for (const update of newUpdates) {
      alerts.push({
        type: NotificationType.REGULATORY_UPDATE,
        title: `New Regulatory Update: ${update.title}`,
        message: `${update.regulatoryBody} — ${update.summary.slice(0, 200)}${update.summary.length > 200 ? '…' : ''}`,
        linkUrl: '/regulatory-updates',
      });
    }
  }

  // ΓöÇΓöÇ Upsert (deduplicate within 3-day window) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  let createdCount = 0;

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

      createdCount += 1;

      if (deliverEmail && user?.email) {
        await sendNotificationEmail({
          to: user.email,
          subject: `[NyxCitadel] ${alert.title}`,
          text: `${alert.message}\n\nOpen in NyxCitadel: ${alert.linkUrl}`,
        });
      }
    }
  }

  return createdCount;
}
