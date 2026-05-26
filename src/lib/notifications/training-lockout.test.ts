import { describe, it, expect, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { runTrainingLockoutSweep, checkAndAutoUnlock } from '@/lib/notifications/training-lockout';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    trainingRecord: { findMany: vi.fn(), count: vi.fn() },
    user: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    notification: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

describe('runTrainingLockoutSweep', () => {
  it('locks user when overdue required training exists', async () => {
    vi.mocked(prisma.trainingRecord.findMany).mockResolvedValueOnce([
      { staffEmail: 'alice@test.com', facilityId: 'f1', trainingName: 'Fire Safety' } as any,
    ]);
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({ id: 'u1', scheduleBlocked: false } as any);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);
    vi.mocked(prisma.notification.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.notification.create).mockResolvedValueOnce({} as any);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);

    await runTrainingLockoutSweep();

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: expect.objectContaining({ scheduleBlocked: true }),
      }),
    );
  });

  it('does not lock when no overdue required training records exist', async () => {
    vi.mocked(prisma.trainingRecord.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);

    await runTrainingLockoutSweep();

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('auto-unlocks blocked user when all required training is completed', async () => {
    vi.mocked(prisma.trainingRecord.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
      { id: 'u3', email: 'carol@test.com', facilityId: 'f1' } as any,
    ]);
    vi.mocked(prisma.trainingRecord.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

    await runTrainingLockoutSweep();

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u3' },
        data: expect.objectContaining({ scheduleBlocked: false }),
      }),
    );
  });

  it('does not unlock blocked user when required training is still overdue', async () => {
    vi.mocked(prisma.trainingRecord.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
      { id: 'u4', email: 'dave@test.com', facilityId: 'f1' } as any,
    ]);
    vi.mocked(prisma.trainingRecord.count).mockResolvedValueOnce(2);

    await runTrainingLockoutSweep();

    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe('checkAndAutoUnlock', () => {
  it('unlocks user when all required training completed', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
      id: 'u1', scheduleBlocked: true, scheduleOverrideNote: null,
    } as any);
    vi.mocked(prisma.trainingRecord.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({} as any);

    await checkAndAutoUnlock('alice@test.com', 'f1');

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: expect.objectContaining({ scheduleBlocked: false }),
      }),
    );
  });

  it('does not unlock when required training still overdue', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
      id: 'u1', scheduleBlocked: true, scheduleOverrideNote: null,
    } as any);
    vi.mocked(prisma.trainingRecord.count).mockResolvedValueOnce(1);

    await checkAndAutoUnlock('alice@test.com', 'f1');

    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
