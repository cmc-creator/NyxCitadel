import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

  const users = await prisma.user.findMany({
    where: isSuperAdmin ? undefined : { facilityId: session.user.facilityId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      facility: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { userId?: string; isActive?: boolean; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 422 });
  }

  // ADMIN can only modify users in their own facility
  if (session.user.role === 'ADMIN') {
    const target = await prisma.user.findUnique({ where: { id: body.userId }, select: { facilityId: true } });
    if (!target || target.facilityId !== session.user.facilityId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    // ADMIN cannot promote to SUPER_ADMIN
    if (body.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot assign SUPER_ADMIN role' }, { status: 403 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: body.userId },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.role && { role: body.role as never }),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  await logAudit({ userId: session.user.id, action: 'UPDATE', entityType: 'User', entityId: updated.id, changes: { isActive: body.isActive, role: body.role }, req: req as unknown as import('next/server').NextRequest });
  return NextResponse.json(updated);
}
