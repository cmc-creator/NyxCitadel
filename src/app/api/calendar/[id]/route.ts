import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/calendar/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const event = await prisma.calendarEvent.findUnique({ where: { id: params.id } });
  if (!event || event.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(event);
}

// PATCH /api/calendar/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const event = await prisma.calendarEvent.findUnique({ where: { id: params.id }, select: { facilityId: true } });
  if (!event || event.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json() as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (body.title !== undefined)          data.title          = body.title;
  if (body.description !== undefined)    data.description    = body.description;
  if (body.dueDate !== undefined)        data.dueDate        = new Date(body.dueDate as string);
  if (body.completedDate !== undefined)  data.completedDate  = body.completedDate ? new Date(body.completedDate as string) : null;
  if (body.category !== undefined)       data.category       = body.category;
  if (body.regulatoryBody !== undefined) data.regulatoryBody = body.regulatoryBody ?? null;
  if (body.priority !== undefined)       data.priority       = body.priority;
  if (body.status !== undefined)         data.status         = body.status;
  if (body.notes !== undefined)          data.notes          = body.notes ?? null;
  if (body.documentUrl !== undefined)    data.documentUrl    = body.documentUrl ?? null;

  const updated = await prisma.calendarEvent.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

// DELETE /api/calendar/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const event = await prisma.calendarEvent.findUnique({ where: { id: params.id }, select: { facilityId: true } });
  if (!event || event.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.calendarEvent.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
