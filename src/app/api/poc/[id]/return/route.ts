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

  const poc = await prisma.planOfCorrection.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!poc) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { note?: string };
  const note = typeof body.note === 'string' ? body.note.trim() : undefined;

  const historyEntry = {
    userId: session.user.id,
    actorName: session.user.name ?? session.user.email,
    action: 'RETURNED',
    timestamp: new Date().toISOString(),
    ...(note && { note }),
  };

  const existing = Array.isArray(poc.approvalHistory) ? poc.approvalHistory : [];

  const updated = await prisma.planOfCorrection.update({
    where: { id: params.id },
    data: {
      approvalStatus: 'RETURNED',
      reviewedBy: session.user.name ?? session.user.email,
      reviewedAt: new Date(),
      reviewNote: note ?? null,
      approvalHistory: [...existing, historyEntry],
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'RETURN_POC',
    entityType: 'PlanOfCorrection',
    entityId: params.id,
    changes: { approvalStatus: 'RETURNED', note },
    req,
  });

  return NextResponse.json(updated);
}
