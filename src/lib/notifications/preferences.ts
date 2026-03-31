import { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  buildDefaultNotificationPreferences,
  NotificationPreferences,
} from '@/lib/notifications/preferences-schema';

export const NOTIFICATION_PREFS_TITLE = '__NOTIFICATION_PREFS__';
export const ALERT_SWEEP_STATUS_TITLE = '__ALERT_SWEEP_STATUS__';
export const ALERT_SWEEP_LOG_TITLE = '__ALERT_SWEEP_LOG__';
export const EXPORT_DELIVERY_LIST_TITLE = '__EXPORT_DELIVERY_LIST__';
export const EXPORT_SUMMARY_LOG_TITLE = '__EXPORT_SUMMARY_LOG__';

export const SYSTEM_NOTIFICATION_TITLES = [
  NOTIFICATION_PREFS_TITLE,
  ALERT_SWEEP_STATUS_TITLE,
  ALERT_SWEEP_LOG_TITLE,
  EXPORT_DELIVERY_LIST_TITLE,
  EXPORT_SUMMARY_LOG_TITLE,
] as const;

export type ExportDeliveryList = {
  emails: string[];
  frequency: 'disabled' | 'daily' | 'weekly' | 'both';
};

export type AutomationHistoryEntry = {
  runType: 'alerts' | 'exports';
  mode?: 'daily' | 'weekly' | 'immediate';
  facilityId: string;
  facilityName?: string;
  usersProcessed?: number;
  notificationsCreated?: number;
  digestsSent?: number;
  recipients?: number;
  sent?: number;
  skipped?: number;
  failures: number;
  triggeredBy: 'cron' | 'admin';
  triggeredByUserId?: string;
  createdAt: string;
};

function normalizePreferences(input: unknown): NotificationPreferences {
  const defaults = buildDefaultNotificationPreferences();
  if (!input || typeof input !== 'object') return defaults;

  const raw = input as {
    digestMode?: string;
    suppressWeekends?: boolean;
    quietHours?: {
      enabled?: boolean;
      startHour?: number;
      endHour?: number;
      timezone?: string;
    };
    exportEmails?: {
      enabled?: boolean;
      frequency?: string;
    };
    rules?: Record<string, { enabled?: boolean; daysAhead?: number }>;
  };

  const digestMode = raw.digestMode === 'daily' ? 'daily' : 'immediate';
  const suppressWeekends = raw.suppressWeekends ?? defaults.suppressWeekends;

  const quietHours = {
    enabled: raw.quietHours?.enabled ?? defaults.quietHours.enabled,
    startHour:
      typeof raw.quietHours?.startHour === 'number'
        ? Math.min(23, Math.max(0, Math.floor(raw.quietHours.startHour)))
        : defaults.quietHours.startHour,
    endHour:
      typeof raw.quietHours?.endHour === 'number'
        ? Math.min(23, Math.max(0, Math.floor(raw.quietHours.endHour)))
        : defaults.quietHours.endHour,
    timezone:
      typeof raw.quietHours?.timezone === 'string' && raw.quietHours.timezone.trim().length > 0
        ? raw.quietHours.timezone
        : defaults.quietHours.timezone,
  };

  const exportEmails = {
    enabled: raw.exportEmails?.enabled ?? defaults.exportEmails.enabled,
    frequency:
      raw.exportEmails?.frequency === 'daily' || raw.exportEmails?.frequency === 'weekly'
        ? raw.exportEmails.frequency
        : defaults.exportEmails.frequency,
  };

  const rules = { ...defaults.rules };
  if (raw.rules && typeof raw.rules === 'object') {
    for (const [key, value] of Object.entries(raw.rules)) {
      if (!value || typeof value !== 'object') continue;
      if (!rules[key]) continue;
      rules[key] = {
        enabled: value.enabled ?? rules[key].enabled,
        daysAhead: typeof value.daysAhead === 'number' ? Math.max(0, Math.floor(value.daysAhead)) : rules[key].daysAhead,
      };
    }
  }

  return {
    digestMode,
    suppressWeekends,
    quietHours,
    exportEmails,
    rules,
  };
}

export async function getNotificationPreferences(userId: string, facilityId: string): Promise<NotificationPreferences> {
  const row = await prisma.notification.findFirst({
    where: {
      userId,
      facilityId,
      type: NotificationType.SYSTEM,
      title: NOTIFICATION_PREFS_TITLE,
    },
    orderBy: { createdAt: 'desc' },
    select: { message: true },
  });

  if (!row?.message) return buildDefaultNotificationPreferences();

  try {
    const parsed = JSON.parse(row.message) as unknown;
    return normalizePreferences(parsed);
  } catch {
    return buildDefaultNotificationPreferences();
  }
}

export async function saveNotificationPreferences(
  userId: string,
  facilityId: string,
  input: unknown,
): Promise<NotificationPreferences> {
  const normalized = normalizePreferences(input);
  const payload = JSON.stringify(normalized);

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      facilityId,
      type: NotificationType.SYSTEM,
      title: NOTIFICATION_PREFS_TITLE,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.notification.update({
      where: { id: existing.id },
      data: {
        message: payload,
        isRead: true,
        readAt: new Date(),
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId,
        facilityId,
        type: NotificationType.SYSTEM,
        title: NOTIFICATION_PREFS_TITLE,
        message: payload,
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  return normalized;
}

function normalizeDeliveryList(input: unknown): ExportDeliveryList {
  if (!input || typeof input !== 'object') return { emails: [], frequency: 'weekly' };
  const raw = input as { emails?: unknown; frequency?: unknown };
  if (!Array.isArray(raw.emails)) {
    return {
      emails: [],
      frequency:
        raw.frequency === 'disabled' || raw.frequency === 'daily' || raw.frequency === 'weekly' || raw.frequency === 'both'
          ? raw.frequency
          : 'weekly',
    };
  }

  const emails = Array.from(
    new Set(
      raw.emails
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim().toLowerCase())
        .filter((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)),
    ),
  );

  return {
    emails,
    frequency:
      raw.frequency === 'disabled' || raw.frequency === 'daily' || raw.frequency === 'weekly' || raw.frequency === 'both'
        ? raw.frequency
        : 'weekly',
  };
}

export async function getExportDeliveryList(facilityId: string): Promise<ExportDeliveryList> {
  const row = await prisma.notification.findFirst({
    where: {
      facilityId,
      type: NotificationType.SYSTEM,
      title: EXPORT_DELIVERY_LIST_TITLE,
    },
    orderBy: { createdAt: 'desc' },
    select: { message: true },
  });

  if (!row?.message) return { emails: [], frequency: 'weekly' };

  try {
    return normalizeDeliveryList(JSON.parse(row.message) as unknown);
  } catch {
    return { emails: [], frequency: 'weekly' };
  }
}

export async function saveExportDeliveryList(userId: string, facilityId: string, input: unknown): Promise<ExportDeliveryList> {
  const normalized = normalizeDeliveryList(input);
  const payload = JSON.stringify(normalized);

  const existing = await prisma.notification.findFirst({
    where: {
      facilityId,
      type: NotificationType.SYSTEM,
      title: EXPORT_DELIVERY_LIST_TITLE,
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });

  if (existing) {
    await prisma.notification.update({
      where: { id: existing.id },
      data: {
        userId,
        message: payload,
        isRead: true,
        readAt: new Date(),
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId,
        facilityId,
        type: NotificationType.SYSTEM,
        title: EXPORT_DELIVERY_LIST_TITLE,
        message: payload,
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  return normalized;
}

export async function recordAutomationHistory(userId: string, facilityId: string, entry: AutomationHistoryEntry): Promise<void> {
  const title = entry.runType === 'alerts' ? ALERT_SWEEP_LOG_TITLE : EXPORT_SUMMARY_LOG_TITLE;
  await prisma.notification.create({
    data: {
      userId,
      facilityId,
      type: NotificationType.SYSTEM,
      title,
      message: JSON.stringify(entry),
      isRead: true,
      readAt: new Date(),
    },
  });
}
