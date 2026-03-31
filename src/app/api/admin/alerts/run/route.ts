import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { runComplianceAlertSweep } from '@/lib/notifications/run-alerts';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/alerts/run
 * Manually trigger an alert sweep.
 * - SUPER_ADMIN: all facilities
 * - ADMIN: own facility only
 */
export async function POST() {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const result = await runComplianceAlertSweep(
    session.user.role === 'SUPER_ADMIN'
      ? { triggeredBy: 'admin', triggeredByUserId: session.user.id as string }
      : {
          facilityId: session.user.facilityId,
          triggeredBy: 'admin',
          triggeredByUserId: session.user.id as string,
        },
  );

  return NextResponse.json({
    ok: result.failures.length === 0,
    ...result,
  });
}
