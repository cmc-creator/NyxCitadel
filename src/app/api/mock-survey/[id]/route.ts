import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface Params { params: { id: string } }

const UpsertFindingSchema = z.object({
  chapter: z.string(),
  standardRef: z.string(),
  epNumber: z.string().optional(),
  epText: z.string(),
  score: z.enum(['MET', 'NOT_MET', 'NOT_APPLICABLE', 'NOT_EVALUATED']),
  surveyorNotes: z.string().optional(),
  evidence: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const survey = await prisma.mockSurvey.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const parsed = UpsertFindingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { chapter, standardRef, epNumber, epText, score, surveyorNotes, evidence } = parsed.data;

  // Upsert: one finding per survey + standardRef + epNumber
  const existing = await prisma.mockSurveyFinding.findFirst({
    where: { mockSurveyId: params.id, standardRef, epNumber: epNumber ?? null },
  });

  let finding;
  if (existing) {
    finding = await prisma.mockSurveyFinding.update({
      where: { id: existing.id },
      data: { score, surveyorNotes, evidence },
    });
  } else {
    finding = await prisma.mockSurveyFinding.create({
      data: {
        mockSurveyId: params.id,
        chapter,
        standardRef,
        epNumber,
        epText,
        score,
        surveyorNotes,
        evidence,
      },
    });
  }

  // Recalculate running totals
  const allFindings = await prisma.mockSurveyFinding.findMany({
    where: { mockSurveyId: params.id },
    select: { score: true },
  });
  const metCount = allFindings.filter(f => f.score === 'MET').length;
  const notMetCount = allFindings.filter(f => f.score === 'NOT_MET').length;
  const naCount = allFindings.filter(f => f.score === 'NOT_APPLICABLE').length;
  const scored = metCount + notMetCount;
  const overallScore = scored > 0 ? Math.round((metCount / scored) * 100) : null;

  await prisma.mockSurvey.update({
    where: { id: params.id },
    data: {
      metCount,
      notMetCount,
      naCount,
      overallScore,
      status: 'IN_PROGRESS',
    },
  });

  return NextResponse.json(finding);
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const survey = await prisma.mockSurvey.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: { findings: { orderBy: { createdAt: 'asc' } } },
  });
  if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(survey);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const survey = await prisma.mockSurvey.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!survey) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.mockSurvey.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(updated);
}
