import { describe, it, expect, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { GET } from '@/app/api/export/training/lockouts/route';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findMany: vi.fn() },
  },
}));

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));

describe('GET /api/export/training/lockouts', () => {
  it('returns CSV with correct column headers', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { facilityId: 'f1' } } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/csv');
    const text = await res.text();
    const headerRow = text.split('\n')[0];
    expect(headerRow).toContain('"name"');
    expect(headerRow).toContain('"email"');
    expect(headerRow).toContain('"department"');
    expect(headerRow).toContain('"blockedAt"');
    expect(headerRow).toContain('"reason"');
  });

  it('queries only users from the session facilityId', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { facilityId: 'f1' } } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);

    await GET();

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ facilityId: 'f1' }) }),
    );
  });
});
