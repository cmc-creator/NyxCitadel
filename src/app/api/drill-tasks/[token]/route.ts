import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/drill-tasks/[token] - get task info for QR scan page (no auth, token is the secret)
export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const task = await prisma.drillKillTask.findUnique({
    where: { qrToken: params.token },
    include: {
      drill: { select: { drillName: true, status: true, drillType: true } },
    },
  });

  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

  return NextResponse.json({
    id:              task.id,
    taskName:        task.taskName,
    assignedRole:    task.assignedRole,
    locationLabel:   task.locationLabel,
    timeLimitMinutes: task.timeLimitMinutes,
    completedAt:     task.completedAt,
    completedBy:     task.completedBy,
    isMissed:        task.isMissed,
    drillName:       task.drill.drillName,
    drillStatus:     task.drill.status,
    drillType:       task.drill.drillType,
  });
}

// POST /api/drill-tasks/[token] - mark task complete via QR scan
export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const task = await prisma.drillKillTask.findUnique({
    where: { qrToken: params.token },
    include: { drill: true },
  });

  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
  if (task.completedAt) return NextResponse.json({ error: 'Task already completed.', completedBy: task.completedBy }, { status: 409 });
  if (task.drill.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Drill is not currently active.' }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const completedBy: string = body.completedBy ?? 'Staff (QR Scan)';

  // Check if over the time limit
  const drillStart = task.drill.drillStartedAt ?? task.drill.conductedDate ?? task.createdAt;
  const elapsedMinutes = (Date.now() - new Date(drillStart).getTime()) / 60000;
  const isMissed = elapsedMinutes > task.timeLimitMinutes;

  const updated = await prisma.drillKillTask.update({
    where: { qrToken: params.token },
    data: {
      completedAt: new Date(),
      completedBy,
      isMissed,
    },
  });

  return NextResponse.json({
    success: true,
    taskName:  task.taskName,
    isMissed,
    completedBy,
    completedAt: updated.completedAt,
  });
}
