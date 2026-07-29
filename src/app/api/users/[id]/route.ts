import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - fetch a single user
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId as string;
  const role = session.user.role as string;
  const selfId = session.user.id as string;

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(role);
  if (!isAdmin && params.id !== selfId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true, name: true, email: true, role: true,
      title: true, department: true, isActive: true,
      lastLoginAt: true, createdAt: true, facilityId: true,
    },
  });

  if (!user || user.facilityId !== facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH /api/users/[id] - update a user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId as string;
  const role = session.user.role as string;
  const selfId = session.user.id as string;

  // Admin can edit any; staff can only edit their own non-role fields
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(role);
  if (!isAdmin && params.id !== selfId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { facilityId: true } });
  if (!target || target.facilityId !== facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json() as {
    name?: string;
    email?: string;
    role?: string;
    title?: string;
    department?: string;
    isActive?: boolean;
    password?: string;
  };

  const data: Record<string, unknown> = {};
  if (body.name !== undefined)       data.name       = body.name;
  if (body.title !== undefined)      data.title      = body.title;
  if (body.department !== undefined) data.department = body.department;
  // Only admins can change email, role, and isActive
  if (isAdmin) {
    if (body.email !== undefined) {
      // Check uniqueness before accepting
      const existing = await prisma.user.findUnique({ where: { email: body.email }, select: { id: true } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'That email address is already in use.' }, { status: 409 });
      }
      data.email = body.email;
    }
    if (body.role !== undefined)     data.role     = body.role;
    if (body.isActive !== undefined) data.isActive = body.isActive;
  }
  // Password reset
  if (body.password) {
    data.passwordHash = await bcrypt.hash(body.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: {
      id: true, name: true, email: true, role: true,
      title: true, department: true, isActive: true, lastLoginAt: true, createdAt: true,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/users/[id] - deactivate (soft delete) a user
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId as string;
  const role = session.user.role as string;
  const selfId = session.user.id as string;

  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (params.id === selfId) {
    return NextResponse.json({ error: 'Cannot deactivate yourself' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { facilityId: true } });
  if (!target || target.facilityId !== facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Soft delete - just deactivate
  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
