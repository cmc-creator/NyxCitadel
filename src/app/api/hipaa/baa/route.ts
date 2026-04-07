import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.baaTracker.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { vendorName: 'asc' },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const record = await prisma.baaTracker.create({
    data: {
      facilityId: session.user.facilityId,
      ...body,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'BaaTracker', entityId: record.id, req });
  return NextResponse.json(record, { status: 201 });
}
