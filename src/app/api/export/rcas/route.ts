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

  const rows = await prisma.rootCauseAnalysis.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { eventDate: 'desc' },
  });

  const header = ['id', 'rcaNumber', 'eventDate', 'eventType', 'status', 'conductedDate', 'completedBy', 'preventabilityRating', 'systemChangesRequired'];
  const lines = [header.map(toCsvCell).join(',')];

  for (const row of rows) {
    lines.push([
      row.id,
      row.rcaNumber,
      row.eventDate.toISOString(),
      row.eventType,
      row.status,
      row.conductedDate?.toISOString() ?? '',
      row.completedBy ?? '',
      row.preventabilityRating ?? '',
      row.systemChangesRequired ? 'Yes' : 'No',
    ].map(toCsvCell).join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rcas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
