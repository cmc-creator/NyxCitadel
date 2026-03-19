import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const record = await prisma.advanceDirectiveRecord.findUnique({ where: { id: params.id } });
  if (!record || record.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(record);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const record = await prisma.advanceDirectiveRecord.findUnique({ where: { id: params.id } });
  if (!record || record.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = { ...body };
  if (data.admitDate)      data.admitDate      = new Date(data.admitDate as string);
  if (data.documentedDate) data.documentedDate = new Date(data.documentedDate as string);

  const updated = await prisma.advanceDirectiveRecord.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const record = await prisma.advanceDirectiveRecord.findUnique({ where: { id: params.id } });
  if (!record || record.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.advanceDirectiveRecord.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
