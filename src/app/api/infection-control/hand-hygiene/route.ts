import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.handHygieneAudit.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { auditDate: 'desc' },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { opportunities, compliant, ...rest } = body;
  const complianceRate = opportunities > 0 ? (compliant / opportunities) * 100 : 0;

  const record = await prisma.handHygieneAudit.create({
    data: {
      facilityId: session.user.facilityId,
      opportunities,
      compliant,
      complianceRate,
      ...rest,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
