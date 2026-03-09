import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const record = await (prisma as any)['icOutbreak'].update({ where: { id: params.id, facilityId: session.user.facilityId }, data: body });
  return NextResponse.json(record);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await (prisma as any)['icOutbreak'].delete({ where: { id: params.id, facilityId: session.user.facilityId } });
  return new NextResponse(null, { status: 204 });
}
