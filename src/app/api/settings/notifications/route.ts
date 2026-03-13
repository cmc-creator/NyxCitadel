import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const DEFAULT_PREFS = {
  DEADLINE_REMINDER:  { enabled: true,  daysAhead: 14 },
  OVERDUE_ALERT:      { enabled: true,  daysAhead: 0  },
  TRAINING_EXPIRING:  { enabled: true,  daysAhead: 30 },
  INCIDENT_UPDATE:    { enabled: true,  daysAhead: 0  },
  POLICY_REVIEW_DUE:  { enabled: true,  daysAhead: 60 },
  SURVEY_ALERT:       { enabled: false, daysAhead: 30 },
  CAP_UPDATE:         { enabled: false, daysAhead: 7  },
  LICENSE_EXPIRING:   { enabled: true,  daysAhead: 90 },
  CS_DISCREPANCY:     { enabled: true,  daysAhead: 0  },
  TB_OVERDUE:         { enabled: true,  daysAhead: 0  },
  BREACH_REPORTABLE:  { enabled: true,  daysAhead: 0  },
  CAP_OVERDUE:        { enabled: true,  daysAhead: 0  },
  POLICY_OVERDUE:     { enabled: true,  daysAhead: 0  },
  SENTINEL_EVENT:     { enabled: true,  daysAhead: 0  },
};

// GET /api/settings/notifications
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { notificationPrefs: true },
  });

  const stored = (user?.notificationPrefs ?? {}) as Record<string, { enabled: boolean; daysAhead: number }>;
  // Merge stored prefs with defaults (stored values win)
  const merged = { ...DEFAULT_PREFS, ...stored };

  return NextResponse.json({ prefs: merged });
}

// PATCH /api/settings/notifications
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { prefs } = body;

  if (!prefs || typeof prefs !== 'object') {
    return NextResponse.json({ error: 'Invalid prefs payload.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id as string },
    data: { notificationPrefs: prefs },
  });

  return NextResponse.json({ ok: true });
}
