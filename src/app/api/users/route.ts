import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

// GET /api/users - list all users in the facility
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId as string;
  const role = session.user.role as string;

  // Only ADMIN and SUPER_ADMIN can view user list
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { facilityId },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      title: true,
      department: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

// POST /api/users - create a new user in the facility
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId as string;
  const role = session.user.role as string;

  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    title?: string;
    department?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) {
    return NextResponse.json({ error: 'A user with that email already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name ?? null,
      passwordHash,
      role: (body.role as never) ?? 'STAFF',
      title: body.title ?? null,
      department: body.department ?? null,
      facilityId,
    },
    select: {
      id: true, name: true, email: true, role: true,
      title: true, department: true, isActive: true, createdAt: true,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'User', entityId: user.id, req });
  return NextResponse.json(user, { status: 201 });
}
