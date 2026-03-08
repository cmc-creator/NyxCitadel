import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.oppeRecord.findMany({
    where: { provider: { facilityId: session.user.facilityId } },
    include: { provider: { select: { firstName: true, lastName: true, credentials: true, specialty: true } } },
    orderBy: { periodEnd: 'desc' },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const provider = await prisma.provider.findFirst({
    where: { id: body.providerId, facilityId: session.user.facilityId },
  });
  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

  const record = await prisma.oppeRecord.create({ data: body });

  return NextResponse.json(record, { status: 201 });
}
