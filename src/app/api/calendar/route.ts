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
    regulatoryBody, priority, frequency, assignedTo, notes,
  } = body;

  if (!title || !dueDate) {
    return NextResponse.json({ error: 'Title and due date are required.' }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      facilityId:     session.user.facilityId,
      createdById:    session.user.id,
      title,
      description:    description ?? null,
      dueDate:        new Date(dueDate),
      category:       category ?? 'OTHER',
      regulatoryBody: regulatoryBody ?? null,
      priority:       priority ?? 'MEDIUM',
      frequency:      frequency ?? 'ONCE',
      assignedTo:     assignedTo ?? null,
      notes:          notes ?? null,
      status:         'PENDING',
    },
  });

  return NextResponse.json(event, { status: 201 });
}
