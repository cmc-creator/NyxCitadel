import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getExportDeliveryList, saveExportDeliveryList } from '@/lib/notifications/preferences';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const facilities = await prisma.facility.findMany({
    where: session.user.role === 'SUPER_ADMIN' ? undefined : { id: session.user.facilityId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const rows = await Promise.all(
    facilities.map(async (facility) => ({
      facilityId: facility.id,
      facilityName: facility.name,
      ...(await getExportDeliveryList(facility.id)),
    })),
  );

  return NextResponse.json({ facilities: rows });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { facilityId?: string; emails?: string[]; frequency?: 'disabled' | 'daily' | 'weekly' | 'both' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const facilityId = session.user.role === 'SUPER_ADMIN' ? body.facilityId : session.user.facilityId;
  if (!facilityId) {
    return NextResponse.json({ error: 'facilityId required' }, { status: 422 });
  }

  if (session.user.role === 'ADMIN' && facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const saved = await saveExportDeliveryList(session.user.id as string, facilityId, {
    emails: body.emails ?? [],
    frequency: body.frequency,
  });
  return NextResponse.json({ ok: true, facilityId, ...saved });
}
