import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const events = await prisma.calendarEvent.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { dueDate: 'asc' },
  });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    title, description, dueDate, category,
    regulatoryBody, priority, notes,
  } = body;

  if (!title || !dueDate || !category) {
    return NextResponse.json({ error: 'Title, due date and category are required.' }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      facilityId:     session.user.facilityId,
      title,
      description:    description ?? null,
      dueDate:        new Date(dueDate),
      category,
      regulatoryBody: regulatoryBody ?? null,
      priority:       priority ?? 'MEDIUM',
      notes:          notes ?? null,
      status:         'UPCOMING',
    },
  });

  return NextResponse.json(event, { status: 201 });
}
