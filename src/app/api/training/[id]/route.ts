import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const record = await prisma.trainingRecord.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });

  if (!record) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.trainingRecord.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const body = await req.json();
  const {
    status, completedDate, expiryDate, score, passingScore,
    provider, notes, certificateUrl, sourceType, sourceId, assignedBy, assignedReason,
  } = body;

  const record = await prisma.trainingRecord.update({
    where: { id: params.id },
    data: {
      ...(status         != null && { status }),
      ...(completedDate  != null && { completedDate: new Date(completedDate) }),
      ...(expiryDate     != null && { expiryDate: new Date(expiryDate) }),
      ...(score          != null && { score: Number(score) }),
      ...(passingScore   != null && { passingScore: Number(passingScore) }),
      ...(provider       != null && { provider }),
      ...(sourceType     != null && { sourceType }),
      ...(sourceId       != null && { sourceId }),
      ...(assignedBy     != null && { assignedBy }),
      ...(assignedReason != null && { assignedReason }),
      ...(notes          != null && { notes }),
      ...(certificateUrl != null && { certificateUrl }),
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'UPDATE_TRAINING_RECORD',
    entityType: 'TrainingRecord',
    entityId: params.id,
    changes: body,
    req,
  });

  return NextResponse.json(record);
}
