import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.governanceDocument.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { reviewDate: 'asc' },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const record = await prisma.governanceDocument.create({
    data: {
      facilityId: session.user.facilityId,
      ...body,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
