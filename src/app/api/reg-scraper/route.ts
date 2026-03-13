import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { runScrape } from '@/lib/reg-scraper';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ADMIN_ROLES = ['ADMIN', 'COMPLIANCE_OFFICER'];

// ─── POST /api/reg-scraper  → trigger a scrape run ───────────────────────────

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const days = typeof body.days === 'number' ? Math.min(body.days, 365) : 90;

    const result = await runScrape(days);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Scrape failed' },
      { status: 500 },
    );
  }
}

// ─── GET /api/reg-scraper  → return latest updates ───────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [updates, unreadCount] = await Promise.all([
    prisma.regulatoryUpdate.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 100,
    }),
    prisma.regulatoryUpdate.count({ where: { isRead: false } }),
  ]);

  return NextResponse.json({ updates, unreadCount });
}
