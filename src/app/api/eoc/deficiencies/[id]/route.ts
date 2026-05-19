import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const record = await prisma.eocDeficiency.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: { round: { select: { roundNumber: true, roundType: true } } },
  });
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const updated = await prisma.eocDeficiency.update({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...body,
      dueDate:      body.dueDate      ? new Date(body.dueDate)      : undefined,
      closedDate:   body.closedDate   ? new Date(body.closedDate)   : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await prisma.eocDeficiency.delete({ where: { id: params.id, facilityId: session.user.facilityId } });
  return new NextResponse(null, { status: 204 });
}
