import { auth } from '@/lib/auth';
import { calculateComplianceHealth } from '@/lib/compliance-health';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const score = await calculateComplianceHealth(session.user.facilityId);
  return NextResponse.json(score);
}
