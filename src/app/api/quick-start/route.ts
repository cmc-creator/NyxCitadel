import { auth } from '@/lib/auth';
import { applyQuickStartTemplates } from '@/lib/quick-start-templates';
import { NextResponse } from 'next/server';

export async function POST() {
  if (process.env.ENABLE_DEMO_TOOLS !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden — Admin role required' }, { status: 403 });
  }

  const result = await applyQuickStartTemplates(session.user.facilityId);
  return NextResponse.json({ ok: true, ...result });
}
