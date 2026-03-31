import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from '@/lib/notifications/preferences';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preferences = await getNotificationPreferences(session.user.id, session.user.facilityId);
  return NextResponse.json({ preferences });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const preferences = await saveNotificationPreferences(session.user.id, session.user.facilityId, body);
  return NextResponse.json({ ok: true, preferences });
}
