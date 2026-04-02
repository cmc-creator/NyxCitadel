import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { JC_STANDARDS, getChapter } from '@/lib/jc-standards';
import { TracerClient } from '@/components/mock-survey/tracer-client';

export const dynamic = 'force-dynamic';

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const survey = await prisma.mockSurvey.findFirst({ where: { id: params.id }, select: { title: true } });
  return { title: survey ? `Tracer: ${survey.title}` : 'Mock Survey Tracer' };
}

export default async function TracerPage({ params }: Props) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const survey = await prisma.mockSurvey.findFirst({
    where: { id: params.id, facilityId },
    include: { findings: { orderBy: { createdAt: 'asc' } } },
  });

  if (!survey) notFound();

  // Build chapters relevant to this survey
  const chapters = survey.chaptersScoped
    .map(code => JC_STANDARDS.find(ch => ch.code === code))
    .filter(Boolean) as typeof JC_STANDARDS;

  return (
    <TracerClient
      survey={{
        id: survey.id,
        title: survey.title,
        surveyType: survey.surveyType,
        surveyorName: survey.surveyorName,
        scheduledDate: survey.scheduledDate.toISOString(),
        status: survey.status,
        metCount: survey.metCount,
        notMetCount: survey.notMetCount,
        naCount: survey.naCount,
        overallScore: survey.overallScore,
        chaptersScoped: survey.chaptersScoped,
      }}
      chapters={chapters}
      savedFindings={survey.findings.map(f => ({
        id: f.id,
        standardRef: f.standardRef,
        epNumber: f.epNumber ?? undefined,
        score: f.score,
        surveyorNotes: f.surveyorNotes ?? '',
        evidence: f.evidence ?? '',
        pocCreated: f.pocCreated,
        pocId: f.pocId ?? undefined,
      }))}
    />
  );
}
