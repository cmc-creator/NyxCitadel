import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { GET, PATCH } from '@/app/api/training/compliance-lockout/route';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn(), update: vi.fn() },
    trainingRecord: { findMany: vi.fn(), count: vi.fn() },
  },
}));

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn().mockResolvedValue(undefined) }));

const ADMIN_SESSION = { user: { id: 'admin1', facilityId: 'f1', role: 'ADMIN' } };

describe('GET /api/training/compliance-lockout', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);

    const res = await GET(new NextRequest('http://localhost'));
    expect(res.status).toBe(401);
  });

  it('returns only users from the session facilityId', async () => {
    vi.mocked(auth).mockResolvedValueOnce(ADMIN_SESSION as any);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.trainingRecord.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.trainingRecord.count)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(8);

    const res = await GET(new NextRequest('http://localhost'));

    expect(res.status).toBe(200);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ facilityId: 'f1' }) }),
    );
  });
});

describe('PATCH /api/training/compliance-lockout', () => {
  it('rejects overrideNote shorter than 10 characters', async () => {
    vi.mocked(auth).mockResolvedValueOnce(ADMIN_SESSION as any);

    const req = { json: vi.fn().mockResolvedValue({ userId: 'u1', overrideNote: 'short' }) } as any;
    const res = await PATCH(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/10 characters/);
  });

  it('returns 404 when userId belongs to a different facility', async () => {
    vi.mocked(auth).mockResolvedValueOnce(ADMIN_SESSION as any);
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);

    const req = {
      json: vi.fn().mockResolvedValue({ userId: 'u-other', overrideNote: 'valid justification text here' }),
    } as any;
    const res = await PATCH(req);

    expect(res.status).toBe(404);
  });
});
