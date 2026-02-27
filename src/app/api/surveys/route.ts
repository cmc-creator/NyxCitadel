import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const surveys = await prisma.survey.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(surveys);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    surveyType,
    regulatoryBody,
    conductedDate,
    surveyorNames,
    status,
    responseDeadline,
    immediateJeopardy,
    conditionLevel,
    findingCount,
    notes,
  } = body;

  if (!surveyType || !regulatoryBody) {
    return NextResponse.json(
      { error: 'Missing required fields: surveyType, regulatoryBody.' },
      { status: 400 }
    );
  }

  const survey = await prisma.survey.create({
    data: {
      facilityId:       session.user.facilityId,
      surveyType,
      regulatoryBody,
      conductedDate:    conductedDate ? new Date(conductedDate) : null,
      surveyorNames:    surveyorNames ?? null,
      status:           status ?? 'SCHEDULED',
      responseDeadline: responseDeadline ? new Date(responseDeadline) : null,
      immediateJeopardy: immediateJeopardy === true,
      conditionLevel:   conditionLevel === true,
      findingCount:     findingCount != null ? Number(findingCount) : null,
      notes:            notes ?? null,
    },
  });

  return NextResponse.json(survey, { status: 201 });
}
