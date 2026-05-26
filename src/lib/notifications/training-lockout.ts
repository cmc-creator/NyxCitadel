import { prisma } from '@/lib/prisma';

export async function runTrainingLockoutSweep() {
  const now = new Date();

  // Phase 1: Lock employees with expired/overdue required training
  const overdueRecords = await prisma.trainingRecord.findMany({
    where: {
      isRequired: true,
      expiryDate: { lt: now },
      status: { in: ['EXPIRED', 'OVERDUE'] },
      staffEmail: { not: null },
    },
    select: {
      staffEmail: true,
      facilityId: true,
      trainingName: true,
    },
  });

  // Group by email+facility to avoid duplicate locks
  const toBlock = new Map<string, { staffEmail: string; facilityId: string; trainingName: string }>();
  for (const rec of overdueRecords) {
    if (!rec.staffEmail) continue;
    const key = `${rec.staffEmail}:${rec.facilityId}`;
    if (!toBlock.has(key)) {
      toBlock.set(key, { staffEmail: rec.staffEmail, facilityId: rec.facilityId, trainingName: rec.trainingName });
    }
  }

  for (const { staffEmail, facilityId, trainingName } of toBlock.values()) {
    const user = await prisma.user.findFirst({
      where: { email: staffEmail, facilityId, isActive: true },
    });
    if (!user || user.scheduleBlocked) continue;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        scheduleBlocked: true,
        scheduleBlockedAt: now,
        scheduleBlockReason: `Required training not completed: ${trainingName}`,
        scheduleUnblockedAt: null,
        scheduleUnblockedBy: null,
        scheduleOverrideNote: null,
      },
    });

    // Check for existing lockout notification in last 24 hours
    const existing = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'TRAINING_LOCKOUT',
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });
    if (!existing) {
      await prisma.notification.create({
        data: {
          facilityId,
          userId: user.id,
          type: 'TRAINING_LOCKOUT',
          title: 'Scheduling lockout activated',
          message: `Your scheduling access has been blocked because required training "${trainingName}" is past due. Complete all required training to restore access.`,
          linkUrl: '/education/training',
        },
      });
    }
  }

  // Phase 2: Auto-unlock users who are system-locked (no HR override) and now compliant
  const blockedUsers = await prisma.user.findMany({
    where: {
      scheduleBlocked: true,
      scheduleOverrideNote: null,
      isActive: true,
    },
    select: { id: true, email: true, facilityId: true },
  });

  for (const user of blockedUsers) {
    const incompleteRequired = await prisma.trainingRecord.count({
      where: {
        staffEmail: user.email,
        facilityId: user.facilityId,
        isRequired: true,
        status: { notIn: ['COMPLETED', 'EXEMPT'] },
      },
    });
    if (incompleteRequired === 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          scheduleBlocked: false,
          scheduleUnblockedAt: now,
        },
      });
    }
  }
}

export async function checkAndAutoUnlock(staffEmail: string, facilityId: string) {
  const user = await prisma.user.findFirst({
    where: { email: staffEmail, facilityId, isActive: true },
    select: { id: true, scheduleBlocked: true, scheduleOverrideNote: true },
  });
  if (!user?.scheduleBlocked) return;

  const incompleteRequired = await prisma.trainingRecord.count({
    where: {
      staffEmail,
      facilityId,
      isRequired: true,
      status: { notIn: ['COMPLETED', 'EXEMPT'] },
    },
  });

  if (incompleteRequired === 0) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        scheduleBlocked: false,
        scheduleUnblockedAt: new Date(),
      },
    });
  }
}
