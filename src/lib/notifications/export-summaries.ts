import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendNotificationEmail } from '@/lib/notifications/email';
import { getExportSummaryEmail } from '@/lib/notifications/email-templates';
import {
  getExportDeliveryList,
  getNotificationPreferences,
  recordAutomationHistory,
} from '@/lib/notifications/preferences';

const LEADERSHIP_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.COMPLIANCE_OFFICER,
  UserRole.RISK_MANAGER,
  UserRole.QUALITY,
];

type SummarySchedule = 'daily' | 'weekly';

type SummaryRunOptions = {
  facilityId?: string;
  triggeredBy?: 'cron' | 'admin';
  triggeredByUserId?: string;
};

function appBaseUrl(): string {
  return process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
}

function buildSummaryText(facilityName: string, mode: SummarySchedule): string {
  const base = appBaseUrl();
  const periodLabel = mode === 'weekly' ? 'weekly' : 'daily';

  return [
    `${facilityName} ${periodLabel} CSV export package is ready.`,
    '',
    'Download reports:',
    `- CAPs: ${base}/api/export/caps`,
    `- Incidents: ${base}/api/export/incidents`,
    `- RCAs: ${base}/api/export/rcas`,
    `- Training: ${base}/api/export/training`,
    `- Drills: ${base}/api/export/drills`,
    `- Policies: ${base}/api/export/policies`,
    '',
    'Tip: save all CSV files into your board/audit folder for this reporting period.',
  ].join('\n');
}

export async function runLeadershipExportSummaries(mode: SummarySchedule, options: SummaryRunOptions = {}) {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: LEADERSHIP_ROLES },
      ...(options.facilityId ? { facilityId: options.facilityId } : {}),
    },
    select: {
      id: true,
      email: true,
      facilityId: true,
      facility: { select: { name: true } },
    },
  });

  let sent = 0;
  let totalRecipients = 0;
  const skipped: string[] = [];
  const failures: { userId: string; error: string }[] = [];
  const facilityRecipients = new Map<string, { facilityName: string; adminUserId: string; emails: Set<string> }>();

  for (const user of users) {
    try {
      const facilityBucket = facilityRecipients.get(user.facilityId) ?? {
        facilityName: user.facility.name,
        adminUserId: user.id,
        emails: new Set<string>(),
      };

      const prefs = await getNotificationPreferences(user.id, user.facilityId);
      if (!prefs.exportEmails.enabled) {
        skipped.push(user.id);
        facilityRecipients.set(user.facilityId, facilityBucket);
        continue;
      }
      if (prefs.exportEmails.frequency !== mode) {
        skipped.push(user.id);
        facilityRecipients.set(user.facilityId, facilityBucket);
        continue;
      }

      facilityBucket.emails.add(user.email.toLowerCase());
      facilityRecipients.set(user.facilityId, facilityBucket);
    } catch (err) {
      failures.push({
        userId: user.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  for (const [facilityId, recipientInfo] of facilityRecipients.entries()) {
    try {
      const extras = await getExportDeliveryList(facilityId);
      const includeExternalRecipients =
        extras.frequency === 'both' ||
        extras.frequency === mode;

      for (const email of includeExternalRecipients ? extras.emails : []) {
        recipientInfo.emails.add(email.toLowerCase());
      }

      const recipients = Array.from(recipientInfo.emails);
      if (recipients.length === 0) continue;
      totalRecipients += recipients.length;

      const email = getExportSummaryEmail({
        facilityName: recipientInfo.facilityName,
        frequency: mode,
      });

      for (const recipient of recipients) {
        await sendNotificationEmail({
          to: recipient,
          subject: email.subject,
          text: buildSummaryText(recipientInfo.facilityName, mode),
          html: email.html,
        });
        sent += 1;
      }

      await recordAutomationHistory(recipientInfo.adminUserId, facilityId, {
        runType: 'exports',
        mode,
        facilityId,
        facilityName: recipientInfo.facilityName,
        recipients: recipients.length,
        sent: recipients.length,
        skipped: 0,
        failures: 0,
        triggeredBy: options.triggeredBy ?? 'cron',
        triggeredByUserId: options.triggeredByUserId,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      failures.push({
        userId: recipientInfo.adminUserId,
        error: err instanceof Error ? err.message : String(err),
      });

      await recordAutomationHistory(recipientInfo.adminUserId, facilityId, {
        runType: 'exports',
        mode,
        facilityId,
        facilityName: recipientInfo.facilityName,
        recipients: 0,
        sent: 0,
        skipped: 0,
        failures: 1,
        triggeredBy: options.triggeredBy ?? 'cron',
        triggeredByUserId: options.triggeredByUserId,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return {
    mode,
    recipients: totalRecipients,
    sent,
    skipped: skipped.length,
    failures,
  };
}
