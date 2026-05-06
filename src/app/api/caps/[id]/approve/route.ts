import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const cap = await prisma.correctiveActionPlan.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!cap) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { note?: string };
  const note = typeof body.note === 'string' ? body.note.trim() : undefined;

  const historyEntry = {
    userId: session.user.id,
    actorName: session.user.name ?? session.user.email,
    action: 'APPROVED',
    timestamp: new Date().toISOString(),
    ...(note && { note }),
  };

  const existing = Array.isArray(cap.approvalHistory) ? cap.approvalHistory : [];

  const updated = await prisma.correctiveActionPlan.update({
    where: { id: params.id },
    data: {
      approvalStatus: 'APPROVED',
      reviewedBy: session.user.name ?? session.user.email,
      reviewedAt: new Date(),
      reviewNote: note ?? null,
      approvalHistory: [...existing, historyEntry],
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'APPROVE_CAP',
    entityType: 'CorrectiveActionPlan',
    entityId: params.id,
    changes: { approvalStatus: 'APPROVED', note },
    req,
  });

  return NextResponse.json(updated);
}
