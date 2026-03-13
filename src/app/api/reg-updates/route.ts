import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ─── GET /api/reg-updates → list updates with optional filters ────────────────

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const agency   = searchParams.get('agency') ?? undefined;
  const impact   = searchParams.get('impact') ?? undefined;
  const unread   = searchParams.get('unread') === 'true' ? true : undefined;
  const page     = Math.max(1, Number(searchParams.get('page') ?? 1));
  const pageSize = 50;

  const where: Record<string, unknown> = {};
  if (agency)         where.agency = agency;
  if (impact)         where.impactLevel = impact;
  if (unread === true) where.isRead = false;

  const [total, items] = await Promise.all([
    prisma.regulatoryUpdate.count({ where }),
    prisma.regulatoryUpdate.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

// ─── POST /api/reg-updates  → mark-all-read ───────────────────────────────────

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { count } = await prisma.regulatoryUpdate.updateMany({
    where: { isRead: false },
    data:  { isRead: true },
  });

  return NextResponse.json({ marked: count });
}
