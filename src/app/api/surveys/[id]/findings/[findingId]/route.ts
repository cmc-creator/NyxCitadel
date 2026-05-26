import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: { id: string; findingId: string } }) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const existing = await prisma.surveyFinding.findFirst({
    where: { id: params.findingId, facilityId: session.user.facilityId, surveyId: params.id },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.surveyFinding.update({
    where: { id: params.findingId },
    data: {
      ...(body.tagNumber !== undefined && { tagNumber: body.tagNumber || null }),
      ...(body.condition !== undefined && { condition: body.condition || null }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.severity !== undefined && { severity: body.severity || null }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.targetDate !== undefined && { targetDate: body.targetDate ? new Date(body.targetDate) : null }),
      ...(body.capId !== undefined && { capId: body.capId || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
    },
    include: { cap: { select: { id: true, capNumber: true, status: true } } },
  });

  await logAudit({
    userId: session.user.id,
    action: 'UPDATE_SURVEY_FINDING',
    entityType: 'SurveyFinding',
    entityId: params.findingId,
    changes: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; findingId: string } }) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.surveyFinding.findFirst({
    where: { id: params.findingId, facilityId: session.user.facilityId, surveyId: params.id },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.surveyFinding.delete({ where: { id: params.findingId } });

  await logAudit({
    userId: session.user.id,
    action: 'DELETE_SURVEY_FINDING',
    entityType: 'SurveyFinding',
    entityId: params.findingId,
    changes: {},
  });

  return NextResponse.json({ deleted: true });
}
