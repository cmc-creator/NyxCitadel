import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const item = await prisma.qapiProject.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.qapiProject.update({
    where: { id: params.id },
    data: {
      ...body,
      startDate:     body.startDate     ? new Date(body.startDate)     : undefined,
      targetDate:    body.targetDate    ? new Date(body.targetDate)    : undefined,
      completedDate: body.completedDate ? new Date(body.completedDate) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.qapiProject.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
