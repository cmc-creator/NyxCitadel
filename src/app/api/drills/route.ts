import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addDays } from 'date-fns';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const drills = await prisma.drill.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { scheduledDate: 'asc' },
  });
  return NextResponse.json(drills);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, drillType, scheduledDate, shift, location, objectives, facilitator } = body;

  if (!title || !drillType || !scheduledDate || !shift) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const scheduled = new Date(scheduledDate);

  const drill = await prisma.drill.create({
    data: {
      facilityId:    session.user.facilityId,
      createdById:   session.user.id,
      title,
      drillType,
      scheduledDate: scheduled,
      shift,
      location:      location ?? null,
      objectives:    objectives ?? null,
      facilitator:   facilitator ?? null,
      // AAR due 30 days after drill per JC EM.04.01.01
      aarDueDate:    addDays(scheduled, 30),
      status:        'SCHEDULED',
    },
  });

  return NextResponse.json(drill, { status: 201 });
}
