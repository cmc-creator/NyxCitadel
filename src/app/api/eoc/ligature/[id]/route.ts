import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const item = await prisma.ligatureRiskItem.findFirst({
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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.ligatureRiskItem.update({
    where: { id: params.id },
    data: {
      ...body,
      identifiedDate: body.identifiedDate ? new Date(body.identifiedDate) : undefined,
      targetDate:     body.targetDate     ? new Date(body.targetDate)     : undefined,
      resolvedDate:   body.resolvedDate   ? new Date(body.resolvedDate)   : undefined,
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

  await prisma.ligatureRiskItem.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
