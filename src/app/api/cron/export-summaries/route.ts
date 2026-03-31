import { NextResponse } from 'next/server';
import { runLeadershipExportSummaries } from '@/lib/notifications/export-summaries';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/cron/export-summaries
 * Daily run sends daily summaries; Sunday additionally sends weekly summaries.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;

  if (secret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const daily = await runLeadershipExportSummaries('daily');
  const isSundayUtc = new Date().getUTCDay() === 0;
  const weekly = isSundayUtc ? await runLeadershipExportSummaries('weekly') : null;

  return NextResponse.json({
    ok: daily.failures.length === 0 && (!weekly || weekly.failures.length === 0),
    daily,
    weekly,
  });
}
