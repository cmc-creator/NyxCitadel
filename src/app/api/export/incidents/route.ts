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

  const rows = await prisma.incident.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { dateOccurred: 'desc' },
  });

  const header = ['id', 'incidentNumber', 'dateOccurred', 'incidentType', 'severity', 'status', 'location', 'reportableToState', 'reportedToState'];
  const lines = [header.map(toCsvCell).join(',')];

  for (const row of rows) {
    lines.push([
      row.id,
      row.incidentNumber,
      row.dateOccurred.toISOString(),
      row.incidentType,
      row.severity,
      row.status,
      row.location ?? '',
      row.reportableToState,
      row.reportedToState,
    ].map(toCsvCell).join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="incidents-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
