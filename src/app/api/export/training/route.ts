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

  const rows = await prisma.trainingRecord.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { expiryDate: 'asc' },
  });

  const header = ['id', 'staffName', 'department', 'trainingName', 'category', 'status', 'completedDate', 'expiryDate', 'isRequired', 'provider'];
  const lines = [header.map(toCsvCell).join(',')];

  for (const row of rows) {
    lines.push([
      row.id,
      row.staffName,
      row.department ?? '',
      row.trainingName,
      row.category,
      row.status,
      row.completedDate?.toISOString() ?? '',
      row.expiryDate?.toISOString() ?? '',
      row.isRequired,
      row.provider ?? '',
    ].map(toCsvCell).join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="training-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
