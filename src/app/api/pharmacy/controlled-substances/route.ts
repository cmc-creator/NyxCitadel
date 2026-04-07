import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.controlledSubstanceLog.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { logDate: 'desc' },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const countDifference = (body.amountCounted ?? 0) - (body.amountExpected ?? 0);
  const discrepancyFound = countDifference !== 0;

  const record = await prisma.controlledSubstanceLog.create({
    data: {
      facilityId: session.user.facilityId,
      countDifference,
      discrepancyFound,
      ...body,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'ControlledSubstanceLog', entityId: record.id, req });
  return NextResponse.json(record, { status: 201 });
}
