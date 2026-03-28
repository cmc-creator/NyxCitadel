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

  const rows = await prisma.drill.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { scheduledDate: 'desc' },
  });

  const header = ['id', 'drillName', 'drillType', 'status', 'scheduledDate', 'conductedDate', 'location', 'participantCount', 'observer'];
  const lines = [header.map(toCsvCell).join(',')];

  for (const row of rows) {
    lines.push([
      row.id,
      row.drillName,
      row.drillType,
      row.status,
      row.scheduledDate.toISOString(),
      row.conductedDate?.toISOString() ?? '',
      row.location ?? '',
      row.participantCount ?? '',
      row.observer ?? '',
    ].map(toCsvCell).join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="drills-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
