import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const record = await prisma.drill.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
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
  const updated = await prisma.drill.update({
    where: { id: params.id },
    data: {
      ...body,
      scheduledDate:  body.scheduledDate  ? new Date(body.scheduledDate)  : undefined,
      conductedDate:  body.conductedDate  ? new Date(body.conductedDate)  : undefined,
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
  await prisma.drill.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
