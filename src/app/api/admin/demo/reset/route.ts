import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { resetFacilityDemoData } from '@/lib/demo/reset';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (process.env.ENABLE_DEMO_TOOLS !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role) || !session.user.facilityId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await resetFacilityDemoData(session.user.facilityId);

  return NextResponse.json({
    ok: true,
    facilityId: session.user.facilityId,
    ...result,
  });
}
