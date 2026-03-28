import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

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
  const { drillName, drillType, scheduledDate, location, objectives, scenario, participantCount, observer } = body;

  if (!drillName || !drillType || !scheduledDate) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const drill = await prisma.drill.create({
    data: {
      facilityId:      session.user.facilityId,
      drillName,
      drillType,
      scheduledDate:   new Date(scheduledDate),
      location:        location   || null,
      objectives:      objectives || null,
      scenario:        scenario   || null,
      participantCount: participantCount ? Number(participantCount) : null,
      observer:        observer   || null,
      status:          'SCHEDULED',
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'CREATE_DRILL',
    entityType: 'Drill',
    entityId: drill.id,
    changes: { drillName, drillType, scheduledDate },
    req,
  });

  return NextResponse.json(drill, { status: 201 });
}
