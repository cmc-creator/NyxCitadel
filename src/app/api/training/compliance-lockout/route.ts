import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { facilityId } = session.user;

  const [blockedUsers, atRiskRecords] = await Promise.all([
    prisma.user.findMany({
      where: { facilityId, scheduleBlocked: true, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        scheduleBlockedAt: true,
        scheduleBlockReason: true,
        scheduleOverrideNote: true,
        scheduleUnblockedAt: true,
      },
      orderBy: { scheduleBlockedAt: 'desc' },
    }),
    prisma.trainingRecord.findMany({
      where: {
        facilityId,
        isRequired: true,
        status: { notIn: ['COMPLETED', 'EXEMPT'] },
        expiryDate: { gte: new Date(), lte: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000) },
        staffEmail: { not: null },
      },
      select: {
        id: true,
        staffName: true,
        staffEmail: true,
        department: true,
        trainingName: true,
        status: true,
        expiryDate: true,
      },
      orderBy: { expiryDate: 'asc' },
    }),
  ]);

  // Count active overrides (unlocked via HR note, not by compliance)
  const activeOverrides = await prisma.user.count({
    where: {
      facilityId,
      scheduleBlocked: false,
      scheduleOverrideNote: { not: null },
      scheduleUnblockedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  // Facility compliance %: required training completed / total required
  const [totalRequired, totalCompleted] = await Promise.all([
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true } }),
    prisma.trainingRecord.count({ where: { facilityId, isRequired: true, status: 'COMPLETED' } }),
  ]);

  return NextResponse.json({
    blockedUsers,
    atRiskRecords,
    activeOverrides,
    compliancePct: totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 100,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { userId, overrideNote } = body as { userId?: string; overrideNote?: string };

  if (!userId || !overrideNote) {
    return NextResponse.json({ error: 'userId and overrideNote are required.' }, { status: 400 });
  }
  if (overrideNote.trim().length < 10) {
    return NextResponse.json({ error: 'Override justification must be at least 10 characters.' }, { status: 400 });
  }

  const target = await prisma.user.findFirst({
    where: { id: userId, facilityId: session.user.facilityId },
    select: { id: true, scheduleBlocked: true },
  });
  if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  if (!target.scheduleBlocked) return NextResponse.json({ error: 'User is not currently blocked.' }, { status: 409 });

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      scheduleBlocked: false,
      scheduleUnblockedAt: new Date(),
      scheduleUnblockedBy: session.user.id,
      scheduleOverrideNote: overrideNote.trim(),
    },
    select: { id: true, name: true, email: true, scheduleBlocked: true },
  });

  await logAudit({
    userId: session.user.id,
    action: 'TRAINING_LOCKOUT_OVERRIDE',
    entityType: 'User',
    entityId: userId,
    changes: { overrideNote },
    req,
  });

  return NextResponse.json(updated);
}
