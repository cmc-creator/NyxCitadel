import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/drill-muster/[token] — get entry info for QR scan page
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const entry = await prisma.drillMusterEntry.findUnique({
    where: { qrToken: params.token },
    include: {
      drill: { select: { drillName: true, status: true, drillType: true } },
    },
  });

  if (!entry) return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });

  return NextResponse.json({
    id:          entry.id,
    staffName:   entry.staffName,
    staffRole:   entry.staffRole,
    department:  entry.department,
    musterPoint: entry.musterPoint,
    status:      entry.status,
    checkedInAt: entry.checkedInAt,
    drillName:   entry.drill.drillName,
    drillStatus: entry.drill.status,
  });
}

// POST /api/drill-muster/[token] — staff checks in at muster point
export async function POST(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const entry = await prisma.drillMusterEntry.findUnique({
    where: { qrToken: params.token },
    include: { drill: { select: { status: true, drillName: true } } },
  });

  if (!entry) return NextResponse.json({ error: 'Muster entry not found.' }, { status: 404 });
  if (entry.status === 'PRESENT') {
    return NextResponse.json({ alreadyCheckedIn: true, checkedInAt: entry.checkedInAt, staffName: entry.staffName });
  }
  if (entry.drill.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Drill is not currently active.' }, { status: 400 });
  }

  const updated = await prisma.drillMusterEntry.update({
    where: { qrToken: params.token },
    data: { status: 'PRESENT', checkedInAt: new Date() },
  });

  return NextResponse.json({
    success:     true,
    staffName:   entry.staffName,
    musterPoint: entry.musterPoint,
    checkedInAt: updated.checkedInAt,
    drillName:   entry.drill.drillName,
  });
}
