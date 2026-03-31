import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { generateComplianceAlerts } from '@/lib/notifications/alertScanner';
import { sendNotificationEmail } from '@/lib/notifications/email';
import { getComplianceDigestEmail } from '@/lib/notifications/email-templates';
import {
  ALERT_SWEEP_STATUS_TITLE,
  getNotificationPreferences,
  NOTIFICATION_PREFS_TITLE,
  recordAutomationHistory,
  SYSTEM_NOTIFICATION_TITLES,
} from '@/lib/notifications/preferences';

type SweepScope = {
  facilityId?: string;
  forceDigestMode?: 'immediate' | 'daily';
  triggeredBy?: 'cron' | 'admin';
  triggeredByUserId?: string;
};

type FacilityStatus = {
  usersProcessed: number;
  notificationsCreated: number;
  digestsSent: number;
  failures: number;
  lastRunAt: string;
};

const ALERT_ROLES: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.COMPLIANCE_OFFICER,
  UserRole.RISK_MANAGER,
  UserRole.EM_COORDINATOR,
  UserRole.QUALITY,
  UserRole.EDUCATION,
  UserRole.STAFF,
];

function buildDigestText(name: string | null, alerts: Array<{ title: string; message: string; linkUrl: string | null; createdAt: Date }>): string {
  const headerName = name ?? 'Team';
  const intro = `Daily compliance digest for ${headerName}.\n\nYou have ${alerts.length} new alert${alerts.length === 1 ? '' : 's'} in the last 24 hours.\n`;
  const items = alerts
    .slice(0, 20)
    .map((a, i) => `${i + 1}. ${a.title}\n   ${a.message}${a.linkUrl ? `\n   Link: ${a.linkUrl}` : ''}`)
    .join('\n\n');

  const footer = '\n\nOpen NyxCitadel for full details and remediation workflows.';
  return `${intro}\n${items}${footer}`;
}

function getLocalParts(date: Date, timezone: string): { weekday: number; hour: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date);

  const weekdayToken = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hourToken = parts.find((p) => p.type === 'hour')?.value ?? '0';

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    weekday: weekdayMap[weekdayToken] ?? 1,
    hour: Number(hourToken),
  };
}

function inQuietHours(hour: number, startHour: number, endHour: number): boolean {
  if (startHour === endHour) return true;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}

function shouldSuppressEmail(now: Date, prefs: Awaited<ReturnType<typeof getNotificationPreferences>>): boolean {
  const { weekday, hour } = getLocalParts(now, prefs.quietHours.timezone);

  if (prefs.suppressWeekends && (weekday === 0 || weekday === 6)) {
    return true;
  }

  if (prefs.quietHours.enabled && inQuietHours(hour, prefs.quietHours.startHour, prefs.quietHours.endHour)) {
    return true;
  }

  return false;
}

async function saveFacilityRunStatus(
  facilityId: string,
  representativeUserId: string,
  status: FacilityStatus,
): Promise<void> {
  const existing = await prisma.notification.findFirst({
    where: {
      facilityId,
      userId: representativeUserId,
      title: ALERT_SWEEP_STATUS_TITLE,
      type: 'SYSTEM',
    },
    select: { id: true },
  });

  const payload = JSON.stringify(status);

  if (existing) {
    await prisma.notification.update({
      where: { id: existing.id },
      data: {
        message: payload,
        readAt: new Date(),
        isRead: true,
      },
    });
    return;
  }

  await prisma.notification.create({
    data: {
      facilityId,
      userId: representativeUserId,
      title: ALERT_SWEEP_STATUS_TITLE,
      message: payload,
      type: 'SYSTEM',
      isRead: true,
      readAt: new Date(),
    },
  });
}

export async function runComplianceAlertSweep(scope: SweepScope = {}) {
  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      role: { in: ALERT_ROLES },
      ...(scope.facilityId ? { facilityId: scope.facilityId } : {}),
    },
    select: {
      id: true,
      facilityId: true,
      email: true,
      name: true,
    },
  });

  let usersProcessed = 0;
  let notificationsCreated = 0;
  let digestsSent = 0;
  const failures: { userId: string; error: string }[] = [];
  const byFacility = new Map<string, {
    representativeUserId: string;
    usersProcessed: number;
    notificationsCreated: number;
    digestsSent: number;
    failures: number;
  }>();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  for (const user of users) {
    try {
      const prefs = await getNotificationPreferences(user.id, user.facilityId);
      const mode = scope.forceDigestMode ?? prefs.digestMode;
      const suppressEmails = shouldSuppressEmail(new Date(), prefs);

      const existingFacility = byFacility.get(user.facilityId) ?? {
        representativeUserId: user.id,
        usersProcessed: 0,
        notificationsCreated: 0,
        digestsSent: 0,
        failures: 0,
      };

      if (mode === 'daily') {
        const created = await generateComplianceAlerts({
          userId: user.id,
          facilityId: user.facilityId,
          deliverEmail: false,
        });

        notificationsCreated += created;
        existingFacility.notificationsCreated += created;

        if (created > 0 && user.email && !suppressEmails) {
          const recent = await prisma.notification.findMany({
            where: {
              userId: user.id,
              createdAt: { gte: since },
              title: { notIn: [...SYSTEM_NOTIFICATION_TITLES] },
            },
            orderBy: { createdAt: 'desc' },
            select: {
              title: true,
              message: true,
              linkUrl: true,
              createdAt: true,
            },
            take: 20,
          });

          if (recent.length > 0) {
            const digestEmail = getComplianceDigestEmail({
              recipientName: user.name,
              alerts: recent,
            });
            await sendNotificationEmail({
              to: user.email,
              subject: digestEmail.subject,
              text: buildDigestText(user.name, recent),
              html: digestEmail.html,
            });
            digestsSent += 1;
            existingFacility.digestsSent += 1;
          }
        }
      } else {
        const created = await generateComplianceAlerts({
          userId: user.id,
          facilityId: user.facilityId,
          deliverEmail: !suppressEmails,
        });
        notificationsCreated += created;
        existingFacility.notificationsCreated += created;
      }

      usersProcessed += 1;
      existingFacility.usersProcessed += 1;
      byFacility.set(user.facilityId, existingFacility);
    } catch (err) {
      failures.push({
        userId: user.id,
        error: err instanceof Error ? err.message : String(err),
      });

      const existingFacility = byFacility.get(user.facilityId) ?? {
        representativeUserId: user.id,
        usersProcessed: 0,
        notificationsCreated: 0,
        digestsSent: 0,
        failures: 0,
      };
      existingFacility.failures += 1;
      byFacility.set(user.facilityId, existingFacility);
    }
  }

  const lastRunAt = new Date().toISOString();
  for (const [facilityId, stat] of byFacility.entries()) {
    await saveFacilityRunStatus(facilityId, stat.representativeUserId, {
      usersProcessed: stat.usersProcessed,
      notificationsCreated: stat.notificationsCreated,
      digestsSent: stat.digestsSent,
      failures: stat.failures,
      lastRunAt,
    });

    await recordAutomationHistory(stat.representativeUserId, facilityId, {
      runType: 'alerts',
      mode: scope.forceDigestMode ?? 'immediate',
      facilityId,
      usersProcessed: stat.usersProcessed,
      notificationsCreated: stat.notificationsCreated,
      digestsSent: stat.digestsSent,
      failures: stat.failures,
      triggeredBy: scope.triggeredBy ?? 'cron',
      triggeredByUserId: scope.triggeredByUserId,
      createdAt: lastRunAt,
    });
  }

  return {
    usersScanned: users.length,
    usersProcessed,
    notificationsCreated,
    digestsSent,
    failures,
  };
}
