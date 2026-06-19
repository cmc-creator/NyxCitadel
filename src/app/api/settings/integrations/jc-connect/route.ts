import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const facility = await prisma.facility.findUnique({
    where: { id: session.user.facilityId },
    select: { jcConnectEnabled: true },
  });

  return NextResponse.json({ enabled: facility?.jcConnectEnabled ?? false });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const enabled = Boolean(body.enabled);

  const facility = await prisma.facility.update({
    where: { id: session.user.facilityId },
    data: { jcConnectEnabled: enabled },
    select: { jcConnectEnabled: true },
  });

  return NextResponse.json({ enabled: facility.jcConnectEnabled });
}
