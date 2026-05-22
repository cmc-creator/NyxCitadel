import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = 50;
  const skip = (page - 1) * limit;
  const action = searchParams.get('action') ?? undefined;
  const entityType = searchParams.get('entityType') ?? undefined;
  const userId = searchParams.get('userId') ?? undefined;

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

  let userIdFilter: string[] | undefined;
  if (!isSuperAdmin) {
    const facilityUsers = await prisma.user.findMany({
      where: { facilityId: session.user.facilityId },
      select: { id: true },
    });
    userIdFilter = facilityUsers.map((u) => u.id);
  }

  const where = {
    ...(userIdFilter ? { userId: { in: userIdFilter } } : {}),
    ...(action ? { action: { contains: action, mode: 'insensitive' as const } } : {}),
    ...(entityType ? { entityType } : {}),
    ...(userId ? { userId } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, limit, pages: Math.ceil(total / limit) });
}
