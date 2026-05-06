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

  const rows = await prisma.policy.findMany({
    where: { facilityId: session.user.facilityId, deletedAt: null },
    orderBy: { nextReviewDate: 'asc' },
  });

  const header = ['id', 'policyNumber', 'title', 'category', 'status', 'effectiveDate', 'nextReviewDate', 'lastReviewedDate', 'version', 'owner'];
  const lines = [header.map(toCsvCell).join(',')];

  for (const row of rows) {
    lines.push([
      row.id,
      row.policyNumber,
      row.title,
      row.category,
      row.status,
      row.effectiveDate.toISOString(),
      row.nextReviewDate.toISOString(),
      row.lastReviewedDate?.toISOString() ?? '',
      row.version,
      row.owner ?? '',
    ].map(toCsvCell).join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="policies-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
