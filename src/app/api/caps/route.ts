import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCapNumber } from '@/lib/utils';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const caps = await prisma.correctiveActionPlan.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(caps);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, source, priority, assignedTo, dueDate, targetMeasure } = body;

  if (!title || !source || !priority) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const cap = await prisma.correctiveActionPlan.create({
    data: {
      facilityId:    session.user.facilityId,
      createdById:   session.user.id,
      capNumber:     generateCapNumber(),
      title,
      description:   description ?? null,
      source,
      priority,
      assignedTo:    assignedTo ?? null,
      dueDate:       dueDate ? new Date(dueDate) : null,
      targetMeasure: targetMeasure ?? null,
      status:        'OPEN',
    },
  });

  return NextResponse.json(cap, { status: 201 });
}
