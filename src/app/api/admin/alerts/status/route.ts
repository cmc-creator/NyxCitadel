import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  ALERT_SWEEP_LOG_TITLE,
  ALERT_SWEEP_STATUS_TITLE,
  EXPORT_SUMMARY_LOG_TITLE,
} from '@/lib/notifications/preferences';

export const dynamic = 'force-dynamic';

function nextComplianceRunIso(from = new Date()): string {
  const next = new Date(from);
  next.setUTCHours(6, 30, 0, 0);
  if (next <= from) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.toISOString();
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [statuses, historyRows] = await Promise.all([
    prisma.notification.findMany({
      where: {
        title: ALERT_SWEEP_STATUS_TITLE,
        type: 'SYSTEM',
        ...(session.user.role === 'SUPER_ADMIN' ? {} : { facilityId: session.user.facilityId }),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        facilityId: true,
        message: true,
        createdAt: true,
        facility: { select: { name: true } },
      },
    }),
    prisma.notification.findMany({
      where: {
        title: { in: [ALERT_SWEEP_LOG_TITLE, EXPORT_SUMMARY_LOG_TITLE] },
        type: 'SYSTEM',
        ...(session.user.role === 'SUPER_ADMIN' ? {} : { facilityId: session.user.facilityId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        title: true,
        message: true,
        createdAt: true,
        facilityId: true,
        facility: { select: { name: true } },
      },
    }),
  ]);

  const latestByFacility = new Map<string, {
    facilityId: string;
    facilityName: string;
    usersProcessed: number;
    notificationsCreated: number;
    digestsSent: number;
    failures: number;
    lastRunAt: string;
  }>();

  for (const row of statuses) {
    if (latestByFacility.has(row.facilityId)) continue;

    try {
      const parsed = JSON.parse(row.message) as {
        usersProcessed?: number;
        notificationsCreated?: number;
        digestsSent?: number;
        failures?: number;
        lastRunAt?: string;
      };

      latestByFacility.set(row.facilityId, {
        facilityId: row.facilityId,
        facilityName: row.facility.name,
        usersProcessed: parsed.usersProcessed ?? 0,
        notificationsCreated: parsed.notificationsCreated ?? 0,
        digestsSent: parsed.digestsSent ?? 0,
        failures: parsed.failures ?? 0,
        lastRunAt: parsed.lastRunAt ?? row.createdAt.toISOString(),
      });
    } catch {
      latestByFacility.set(row.facilityId, {
        facilityId: row.facilityId,
        facilityName: row.facility.name,
        usersProcessed: 0,
        notificationsCreated: 0,
        digestsSent: 0,
        failures: 1,
        lastRunAt: row.createdAt.toISOString(),
      });
    }
  }

  const rows = Array.from(latestByFacility.values());

  const history = historyRows.flatMap((row) => {
    try {
      const parsed = JSON.parse(row.message) as {
        runType?: 'alerts' | 'exports';
        mode?: 'daily' | 'weekly' | 'immediate';
        facilityName?: string;
        usersProcessed?: number;
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
        facilityId: row.facilityId,
        facilityName: parsed.facilityName ?? row.facility.name,
        usersProcessed: parsed.usersProcessed ?? 0,
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

  const totals = rows.reduce(
    (acc, row) => {
      acc.usersProcessed += row.usersProcessed;
      acc.notificationsCreated += row.notificationsCreated;
      acc.digestsSent += row.digestsSent;
      acc.failures += row.failures;
      return acc;
    },
    { usersProcessed: 0, notificationsCreated: 0, digestsSent: 0, failures: 0 },
  );

  return NextResponse.json({
    lastRuns: rows,
    history,
    totals,
    nextRunAt: nextComplianceRunIso(),
  });
}
