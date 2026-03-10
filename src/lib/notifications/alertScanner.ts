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
 */
export async function generateComplianceAlerts({ userId, facilityId }: AlertInput): Promise<void> {
  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const dedupWindow = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 day window

  const alerts: {
    type: string;
    title: string;
    message: string;
    linkUrl: string;
  }[] = [];

  // ── 1. Expiring provider licenses (within 90 days) ─────────────────────
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
      type: 'LICENSE_EXPIRING',
      title: `License Expiring: ${providerName}`,
      message: `${lic.licenseType} (${lic.licenseNumber}) expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} on ${lic.expiryDate.toLocaleDateString()}.`,
      linkUrl: '/dashboard/trackers/compliance',
    });
  }

  // ── 2. Open CS discrepancies ────────────────────────────────────────────
  const openDiscrepancies = await prisma.controlledSubstanceLog.findMany({
    where: { facilityId, status: 'DISCREPANCY_OPEN' },
    orderBy: { logDate: 'desc' },
    take: 5,
  });

  for (const cs of openDiscrepancies) {
    alerts.push({
      type: 'CS_DISCREPANCY',
      title: `CS Discrepancy: ${cs.medicationName}`,
      message: `Open controlled substance discrepancy (${cs.countDifference > 0 ? '+' : ''}${cs.countDifference}) reported on ${cs.logDate.toLocaleDateString()} — not yet resolved.`,
      linkUrl: '/dashboard/trackers/compliance',
    });
  }

  // ── 3. Overdue TB screenings ────────────────────────────────────────────
  const overdueTb = await prisma.employeeHealthRecord.findMany({
    where: {
      facilityId,
      tbNextDueDate: { lt: now },
    },
  });

  for (const emp of overdueTb) {
    const daysOverdue = Math.floor((now.getTime() - (emp.tbNextDueDate?.getTime() ?? 0)) / 86400000);
    alerts.push({
      type: 'TB_OVERDUE',
      title: `TB Screening Overdue: ${emp.employeeName}`,
      message: `Annual TB screening for ${emp.employeeName} (${emp.department}) is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue.`,
      linkUrl: '/dashboard/trackers/training',
    });
  }

  // ── 4. Pending MOON notices ─────────────────────────────────────────────
  const pendingMoon = await prisma.moonNotice.findMany({
    where: { facilityId, status: 'PENDING' },
  });

  for (const moon of pendingMoon) {
    const hoursInObs = Math.floor((now.getTime() - moon.observationStartDate.getTime()) / 3600000);
    alerts.push({
      type: 'MOON_MISSING',
      title: `MOON Notice Pending: Patient ${moon.patientInitials}`,
      message: `Patient ${moon.patientInitials} has been on observation status for ${hoursInObs} hours. MOON notice required within 36 hours — not yet issued.`,
      linkUrl: '/dashboard/trackers/compliance',
    });
  }

  // ── 5. Overdue governance document reviews ─────────────────────────────
  const overdueGovDocs = await prisma.governanceDocument.findMany({
    where: {
      facilityId,
      reviewDate: { lt: now },
      status: 'ACTIVE', // already flagged UNDER_REVIEW ones are being worked on
    },
  });

  for (const doc of overdueGovDocs) {
    const daysOverdue = Math.floor((now.getTime() - (doc.reviewDate?.getTime() ?? 0)) / 86400000);
    alerts.push({
      type: 'GOVERNANCE_DOC_OVERDUE',
      title: `Governance Doc Review Overdue: ${doc.title}`,
      message: `${doc.title} (v${doc.version ?? 'N/A'}) review was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago.`,
      linkUrl: '/dashboard/trackers/compliance',
    });
  }

  // ── 6. High-risk HIPAA breaches not yet resolved ────────────────────────
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
      type: 'BREACH_REPORTABLE',
      title: `HIPAA Breach Requires Action: ${breach.incidentNumber}`,
      message: `${breach.incidentNumber} (${breach.breachType.replace(/_/g, ' ')}) has been open for ${daysSince} day${daysSince !== 1 ? 's' : ''} — potential 60-day HHS notification deadline.`,
      linkUrl: '/dashboard/trackers/compliance',
    });
  }

  // ── Upsert (deduplicate within 3-day window) ────────────────────────────
  for (const alert of alerts) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: alert.type as NotificationType,
        title: alert.title,
        createdAt: { gte: dedupWindow },
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId,
          facilityId,
          title: alert.title,
          message: alert.message,
          type: alert.type as NotificationType,
          linkUrl: alert.linkUrl,
          isRead: false,
        },
      });
    }
  }
}
