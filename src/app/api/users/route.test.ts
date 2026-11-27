import { describe, it, expect, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { GET, POST } from '@/app/api/users/route';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), count: vi.fn() },
    facility: { findUnique: vi.fn() },
  },
}));

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn().mockResolvedValue(undefined) }));

describe('GET /api/users', () => {
  it('returns 403 for STAFF role', async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'u1', facilityId: 'f1', role: 'STAFF' },
    } as any);

    const res = await GET();
    expect(res.status).toBe(403);
  });

  it('returns users scoped to session facilityId', async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'admin1', facilityId: 'f1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([
      { id: 'u1', name: 'Alice', email: 'alice@f1.com' } as any,
    ]);

    const res = await GET();

    expect(res.status).toBe(200);
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { facilityId: 'f1' } }),
    );
  });
});

describe('POST /api/users', () => {
  it('creates user scoped to session facilityId', async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'admin1', facilityId: 'f1', role: 'ADMIN' },
    } as any);
    // Plan cap check runs first: a facility with no subscription is in
    // trial state (cap 20) and this facility is well under it.
    vi.mocked(prisma.facility.findUnique).mockResolvedValueOnce({
      subscriptionPlan: null, subscriptionStatus: null, stripeSubscriptionId: null,
    } as any);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.user.create).mockResolvedValueOnce({
      id: 'u-new', name: 'Bob', email: 'bob@f1.com', role: 'STAFF',
      title: null, department: null, isActive: true, createdAt: new Date(),
    } as any);

    const req = {
      json: vi.fn().mockResolvedValue({ email: 'bob@f1.com', password: 'secret123' }),
    } as any;
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ facilityId: 'f1', email: 'bob@f1.com' }),
      }),
    );
  });

  it('returns 409 for duplicate email', async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'admin1', facilityId: 'f1', role: 'ADMIN' },
    } as any);
    vi.mocked(prisma.facility.findUnique).mockResolvedValueOnce({
      subscriptionPlan: null, subscriptionStatus: null, stripeSubscriptionId: null,
    } as any);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'existing', email: 'dup@f1.com',
    } as any);

    const req = {
      json: vi.fn().mockResolvedValue({ email: 'dup@f1.com', password: 'secret123' }),
    } as any;
    const res = await POST(req);

    expect(res.status).toBe(409);
  });

  it('returns 403 when the facility is at its plan user cap', async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: 'admin1', facilityId: 'f1', role: 'ADMIN' },
    } as any);
    // Starter plan with a live subscription caps at 5 active users,
    // and this facility already has 5.
    vi.mocked(prisma.facility.findUnique).mockResolvedValueOnce({
      subscriptionPlan: 'starter', subscriptionStatus: 'active', stripeSubscriptionId: 'sub_123',
    } as any);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(5);

    const req = {
      json: vi.fn().mockResolvedValue({ email: 'extra@f1.com', password: 'secret123' }),
    } as any;
    const res = await POST(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('Plan limit reached');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
