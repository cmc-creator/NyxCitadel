import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const item = await prisma.ligatureRiskItem.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.ligatureRiskItem.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const {
    location, unit, itemDescription, riskLevel, status,
    identifiedDate, identifiedBy, mitigationPlan, targetDate,
    resolvedDate, resolvedBy, verifiedBy, notes,
  } = body;

  const updated = await prisma.ligatureRiskItem.update({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...(location        !== undefined && { location }),
      ...(unit            !== undefined && { unit }),
      ...(itemDescription !== undefined && { itemDescription }),
      ...(riskLevel       !== undefined && { riskLevel }),
      ...(status          !== undefined && { status }),
      ...(identifiedDate  !== undefined && { identifiedDate: new Date(identifiedDate) }),
      ...(identifiedBy    !== undefined && { identifiedBy }),
      ...(mitigationPlan  !== undefined && { mitigationPlan }),
      ...(targetDate      !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
      ...(resolvedDate    !== undefined && { resolvedDate: resolvedDate ? new Date(resolvedDate) : null }),
      ...(resolvedBy      !== undefined && { resolvedBy }),
      ...(verifiedBy      !== undefined && { verifiedBy }),
      ...(notes           !== undefined && { notes }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.ligatureRiskItem.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.ligatureRiskItem.delete({ where: { id: params.id, facilityId: session.user.facilityId } });
  return NextResponse.json({ success: true });
}
