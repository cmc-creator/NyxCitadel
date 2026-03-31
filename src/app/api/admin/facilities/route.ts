import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
