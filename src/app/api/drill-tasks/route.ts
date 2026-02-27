import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/drill-tasks?drillId=xxx
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const drillId = req.nextUrl.searchParams.get('drillId');
  if (!drillId) return NextResponse.json({ error: 'drillId required' }, { status: 400 });

  const tasks = await prisma.drillKillTask.findMany({
    where: { drillId, facilityId: session.user.facilityId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(tasks);
}

// POST /api/drill-tasks — create a kill task
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { drillId, taskName, assignedRole, locationLabel, timeLimitMinutes, isRequired } = body;

  if (!drillId || !taskName || !assignedRole || !locationLabel) {
    return NextResponse.json({ error: 'drillId, taskName, assignedRole, locationLabel required.' }, { status: 400 });
  }

  const drill = await prisma.drill.findFirst({
    where: { id: drillId, facilityId: session.user.facilityId },
  });
  if (!drill) return NextResponse.json({ error: 'Drill not found.' }, { status: 404 });

  const task = await prisma.drillKillTask.create({
    data: {
      drillId,
      facilityId: session.user.facilityId,
      taskName,
      assignedRole,
      locationLabel,
      timeLimitMinutes: timeLimitMinutes ?? 3,
      isRequired: isRequired ?? true,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
