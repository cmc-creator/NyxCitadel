import { NextResponse } from 'next/server';
import { runScrape } from '@/lib/reg-scraper';

export const dynamic  = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro allows up to 300s; 60s is safe

/**
 * GET /api/cron/scrape
 *
 * Called by Vercel Cron every day at 06:00 UTC (see vercel.json).
 * Also callable manually:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://<your-domain>/api/cron/scrape
 *
 * The CRON_SECRET env var must be set in Vercel → Settings → Environment Variables.
 * Vercel injects the same secret automatically when invoking scheduled crons.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;

  // Fail closed - if CRON_SECRET is not configured, refuse all requests.
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runScrape(2); // look back 2 days on daily runs
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[cron/scrape]', err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
