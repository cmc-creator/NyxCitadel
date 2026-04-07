import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logAudit } from '@/lib/audit';

const CreateMockSurveySchema = z.object({
  title: z.string().min(1),
  surveyType: z.enum(['JC_FULL', 'JC_FOCUSED', 'JC_DISEASE_SPECIFIC', 'CMS_CONDITION_LEVEL', 'ADHS_LICENSING', 'INTERNAL_AUDIT']),
  surveyorName: z.string().optional(),
  scheduledDate: z.string(),
  chaptersScoped: z.array(z.string()).min(1),
  summaryNotes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateMockSurveySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, surveyType, surveyorName, scheduledDate, chaptersScoped, summaryNotes } = parsed.data;

  const survey = await prisma.mockSurvey.create({
    data: {
      facilityId: session.user.facilityId,
      title,
      surveyType,
      surveyorName,
      scheduledDate: new Date(scheduledDate),
      chaptersScoped,
      summaryNotes,
      status: 'SCHEDULED',
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'MockSurvey', entityId: survey.id, req });
  return NextResponse.json(survey, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const surveys = await prisma.mockSurvey.findMany({
    where: { facilityId: session.user.facilityId },
    include: { findings: { select: { score: true } } },
    orderBy: { scheduledDate: 'desc' },
  });

  return NextResponse.json(surveys);
}
