import { NextResponse } from 'next/server';
import { runComplianceAlertSweep } from '@/lib/notifications/run-alerts';

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
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
  }
  const authHeader = req.headers.get('authorization') ?? '';
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runComplianceAlertSweep();

  return NextResponse.json({
    ok: result.failures.length === 0,
    ...result,
  });
}
