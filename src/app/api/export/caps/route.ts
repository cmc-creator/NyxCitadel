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

  const rows = await prisma.correctiveActionPlan.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { targetDate: 'asc' },
    include: { assignee: { select: { name: true, email: true } } },
  });

  const header = ['id', 'capNumber', 'title', 'source', 'status', 'priority', 'targetDate', 'assignee', 'regulatoryBody'];
  const lines = [header.map(toCsvCell).join(',')];

  for (const row of rows) {
    lines.push([
      row.id,
      row.capNumber,
      row.title,
      row.source,
      row.status,
      row.priority,
      row.targetDate.toISOString(),
      row.assignee?.name ?? row.assignee?.email ?? '',
      row.regulatoryBody ?? '',
    ].map(toCsvCell).join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="caps-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
