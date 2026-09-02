import { NextResponse } from 'next/server';
import { runComplianceAlertSweep } from '@/lib/notifications/run-alerts';
import { generateTrainingMilestoneAlerts } from '@/lib/notifications/alertScanner';
import { runTrainingLockoutSweep } from '@/lib/notifications/training-lockout';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/compliance-alerts
 *
 * Daily scheduled job that generates compliance notifications and emails for active users.
 * Protected by CRON_SECRET (Bearer token).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;

  // Fail closed - refuse all requests if CRON_SECRET is not configured.
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runComplianceAlertSweep();

  // Training milestone notifications (60/30/15-day warnings per facility)
  const facilities = await prisma.facility.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  for (const facility of facilities) {
    await generateTrainingMilestoneAlerts(facility.id);
  }

  // Compliance Gatekeeper: lock/unlock employees based on required training status
  await runTrainingLockoutSweep();

  return NextResponse.json({
    ok: result.failures.length === 0,
    ...result,
  });
}
