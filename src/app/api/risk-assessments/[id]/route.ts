import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const item = await prisma.riskAssessment.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: { items: { orderBy: { riskScore: 'desc' } } },
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { items: _items, ...data } = body;

  const updated = await prisma.riskAssessment.update({
    where: { id: params.id },
    data: {
      ...data,
      conductedDate:  data.conductedDate  ? new Date(data.conductedDate)  : undefined,
      nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
    },
    include: { items: { orderBy: { riskScore: 'desc' } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.riskAssessment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
