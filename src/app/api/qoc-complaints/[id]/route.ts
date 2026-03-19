import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const qoc = await prisma.qocComplaint.findUnique({ where: { id: params.id } });
  if (!qoc || qoc.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(qoc);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const qoc = await prisma.qocComplaint.findUnique({ where: { id: params.id } });
  if (!qoc || qoc.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = { ...body };

  const dateFields = [
    'dateReceived', 'loiReceivedDate', 'responseDueDate', 'responseSubmittedDate',
    'surveyDate', 'closedDate',
  ];
  for (const f of dateFields) {
    if (data[f]) data[f] = new Date(data[f] as string);
    else if (data[f] === null || data[f] === '') data[f] = null;
  }

  // Auto-set closedDate when status moves to CLOSED
  if (body.status === 'CLOSED' && !qoc.closedDate) {
    data.closedDate = new Date();
  }

  const updated = await prisma.qocComplaint.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const qoc = await prisma.qocComplaint.findUnique({ where: { id: params.id } });
  if (!qoc || qoc.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.qocComplaint.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
