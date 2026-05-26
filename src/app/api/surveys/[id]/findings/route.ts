import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const findings = await prisma.surveyFinding.findMany({
    where: { facilityId: session.user.facilityId, surveyId: params.id },
    include: { cap: { select: { id: true, capNumber: true, status: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(findings);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { tagNumber, condition, description, severity, status, targetDate, capId, notes } = body;

  if (!description?.trim()) return NextResponse.json({ error: 'Description is required' }, { status: 400 });

  const survey = await prisma.survey.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!survey) return NextResponse.json({ error: 'Survey not found' }, { status: 404 });

  const finding = await prisma.surveyFinding.create({
    data: {
      facilityId: session.user.facilityId,
      surveyId: params.id,
      tagNumber: tagNumber || null,
      condition: condition || null,
      description,
      severity: severity || null,
      status: status || 'OPEN',
      targetDate: targetDate ? new Date(targetDate) : null,
      capId: capId || null,
      notes: notes || null,
    },
    include: { cap: { select: { id: true, capNumber: true, status: true } } },
  });

  await logAudit({
    userId: session.user.id,
    action: 'CREATE_SURVEY_FINDING',
    entityType: 'SurveyFinding',
    entityId: finding.id,
    changes: { surveyId: params.id, tagNumber, description },
  });

  return NextResponse.json(finding, { status: 201 });
}
