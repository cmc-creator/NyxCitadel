import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

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
  const existing = await prisma.drill.findFirst({ where: { id: params.id, facilityId: session.user.facilityId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.drill.update({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...body,
      scheduledDate:  body.scheduledDate  ? new Date(body.scheduledDate)  : undefined,
      conductedDate:  body.conductedDate  ? new Date(body.conductedDate)  : undefined,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'UPDATE_DRILL',
    entityType: 'Drill',
    entityId: params.id,
    changes: body,
    req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await prisma.drill.findFirst({ where: { id: params.id, facilityId: session.user.facilityId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.drill.delete({ where: { id: params.id, facilityId: session.user.facilityId } });

  await logAudit({
    userId: session.user.id,
    action: 'DELETE_DRILL',
    entityType: 'Drill',
    entityId: params.id,
    changes: { drillName: existing.drillName, drillType: existing.drillType },
    req: _req,
  });

  return new NextResponse(null, { status: 204 });
}
