import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.emergencyPlan.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.emergencyPlan.update({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...body,
      effectiveDate:    body.effectiveDate    ? new Date(body.effectiveDate)    : undefined,
      nextReviewDate:   body.nextReviewDate   ? new Date(body.nextReviewDate)   : undefined,
      lastReviewedDate: body.lastReviewedDate ? new Date(body.lastReviewedDate) : undefined,
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

  await prisma.emergencyPlan.delete({ where: { id: params.id, facilityId: session.user.facilityId } });
  return NextResponse.json({ success: true });
}
