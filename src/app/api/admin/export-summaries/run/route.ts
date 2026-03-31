import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { runLeadershipExportSummaries } from '@/lib/notifications/export-summaries';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { mode?: 'daily' | 'weekly' } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const mode = body.mode === 'daily' ? 'daily' : 'weekly';
  const result = await runLeadershipExportSummaries(mode, {
    facilityId: session.user.role === 'SUPER_ADMIN' ? undefined : session.user.facilityId,
    triggeredBy: 'admin',
    triggeredByUserId: session.user.id as string,
  });

  return NextResponse.json({
    ok: result.failures.length === 0,
    ...result,
  });
}
