import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cap = await prisma.correctiveActionPlan.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      incidents: { select: { id: true, incidentType: true, dateOccurred: true, severity: true } },
      surveys:   { select: { id: true, surveyType: true, conductedDate: true, regulatoryBody: true } },
    },
  });

  if (!cap) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(cap);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.correctiveActionPlan.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const body = await req.json();
  const {
    status, priority, targetDate, completedDate, followUpDate, followUpNotes,
    assigneeId, description, rootCause, correctionPlan, measureOfSuccess,
    isPdsa, pdsaPlan, pdsaDo, pdsaStudy, pdsaAct,
    vigilanceDays, vigilanceStatus, vigilanceBreaches,
  } = body;

  const cap = await prisma.correctiveActionPlan.update({
    where: { id: params.id },
    data: {
      ...(status            != null && { status }),
      ...(priority          != null && { priority }),
      ...(targetDate        != null && { targetDate: new Date(targetDate) }),
      ...(completedDate     != null && { completedDate: new Date(completedDate) }),
      ...(followUpDate      != null && { followUpDate: new Date(followUpDate) }),
      ...(followUpNotes     != null && { followUpNotes }),
      ...(assigneeId        != null && { assigneeId }),
      ...(description       != null && { description }),
      ...(rootCause         != null && { rootCause }),
      ...(correctionPlan    != null && { correctionPlan }),
      ...(measureOfSuccess  != null && { measureOfSuccess }),
      ...(isPdsa            != null && { isPdsa }),
      ...(pdsaPlan          != null && { pdsaPlan }),
      ...(pdsaDo            != null && { pdsaDo }),
      ...(pdsaStudy         != null && { pdsaStudy }),
      ...(pdsaAct           != null && { pdsaAct }),
      ...(vigilanceDays     != null && { vigilanceDays: Number(vigilanceDays) }),
      ...(vigilanceStatus   != null && { vigilanceStatus }),
      ...(vigilanceBreaches != null && { vigilanceBreaches: Number(vigilanceBreaches) }),
    },
  });

  return NextResponse.json(cap);
}
