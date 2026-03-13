import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateComplianceAlerts } from '@/lib/notifications/alertScanner';
import { runScrape } from '@/lib/reg-scraper';

// ── Auto-scrape: fires in background when last fetch is > 24 h old ────────────
const SCRAPE_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SCRAPE_ROLES       = new Set(['ADMIN', 'COMPLIANCE_OFFICER']);
let   _scrapeInFlight    = false; // module-level guard: only one concurrent run

async function maybeAutoScrape(role: string) {
  if (!SCRAPE_ROLES.has(role) || _scrapeInFlight) return;

  const latest = await prisma.regulatoryUpdate.findFirst({
    orderBy: { createdAt: 'desc' },
    select:  { createdAt: true },
  });

  const stale = !latest || Date.now() - latest.createdAt.getTime() > SCRAPE_INTERVAL_MS;
  if (!stale) return;

  // Fire-and-forget — does not block the notification response
  _scrapeInFlight = true;
  void runScrape(90).finally(() => { _scrapeInFlight = false; });
}

// GET /api/notifications — current user's notifications (most recent 30)
// Also triggers compliance alert generation so the bell stays current.
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id as string;
  const facilityId = session.user.facilityId as string;

  // Scan for new compliance alerts (deduped — safe on every poll)
  try {
    await generateComplianceAlerts({ userId, facilityId });
  } catch {
    // Non-fatal — don't block notification delivery if alert scan fails
  }

  // Auto-scrape regulatory feeds if data is stale (runs silently in background)
  try {
    await maybeAutoScrape(session.user.role as string);
  } catch {
    // Non-fatal
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      readAt: true,
      linkUrl: true,
      createdAt: true,
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/notifications — mark ALL unread as read
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id as string;

  const body = await req.json().catch(() => ({})) as { ids?: string[] };

  if (body.ids && Array.isArray(body.ids)) {
    // Mark specific IDs as read
    await prisma.notification.updateMany({
      where: { userId, id: { in: body.ids }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  } else {
    // Mark all unread as read
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  return NextResponse.json({ success: true });
}
