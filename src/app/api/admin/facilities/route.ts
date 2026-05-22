import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

  const facilities = await prisma.facility.findMany({
    where: isSuperAdmin ? undefined : { id: session.user.facilityId },
    select: {
      id: true,
      name: true,
      facilityType: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          users: true,
          complianceItems: true,
          capItems: true,
          incidentReports: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(facilities);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as {
    name?: string;
    facilityType?: string;
    city?: string;
    state?: string;
    address?: string;
    phone?: string;
    licenseNumber?: string;
    bedCount?: number;
    adminName?: string;
    adminEmail?: string;
    adminPassword?: string;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Facility name is required.' }, { status: 400 });
  }

  const facility = await prisma.facility.create({
    data: {
      name: body.name.trim(),
      facilityType: (body.facilityType as never) ?? 'ACUTE_PSYCH',
      city: body.city ?? null,
      state: body.state ?? 'AZ',
      address: body.address ?? null,
      phone: body.phone ?? null,
      licenseNumber: body.licenseNumber ?? null,
      bedCount: body.bedCount ?? null,
    },
  });

  let adminUser = null;
  if (body.adminEmail && body.adminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: body.adminEmail } });
    if (existing) {
      return NextResponse.json({ error: 'A user with that email already exists.', facilityId: facility.id }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(body.adminPassword, 10);
    adminUser = await prisma.user.create({
      data: {
        email: body.adminEmail,
        name: body.adminName ?? null,
        passwordHash,
        role: 'ADMIN',
        facilityId: facility.id,
      },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  await logAudit({
    userId: session.user.id,
    action: 'CREATE_FACILITY',
    entityType: 'Facility',
    entityId: facility.id,
    req,
  });

  return NextResponse.json({ facility, adminUser }, { status: 201 });
}
