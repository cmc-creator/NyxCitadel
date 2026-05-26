import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function toCsvCell(value: unknown): string {
  const v = value == null ? '' : String(value);
  return `"${v.replace(/"/g, '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId;

  const lockedUsers = await prisma.user.findMany({
    where: { facilityId, scheduleBlocked: true, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      scheduleBlockedAt: true,
      scheduleBlockReason: true,
      scheduleOverrideNote: true,
      scheduleUnblockedAt: true,
    },
    orderBy: { scheduleBlockedAt: 'desc' },
  });

  const header = [
    'name', 'email', 'department',
    'blockedAt', 'reason', 'overrideNote', 'unblockedAt',
  ];
  const lines = [header.map(toCsvCell).join(',')];

  for (const u of lockedUsers) {
    lines.push([
      u.name ?? '',
      u.email,
      u.department ?? '',
      u.scheduleBlockedAt?.toISOString() ?? '',
      u.scheduleBlockReason ?? '',
      u.scheduleOverrideNote ?? '',
      u.scheduleUnblockedAt?.toISOString() ?? '',
    ].map(toCsvCell).join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="scheduling-lockouts-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
