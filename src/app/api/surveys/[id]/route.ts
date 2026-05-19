import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const survey = await prisma.survey.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: {
      cap: { select: { id: true, capNumber: true, title: true, status: true } },
      plansOfCorrection: { select: { id: true, status: true, findings: { select: { status: true } } } },
    },
  });

  if (!survey) return NextResponse.json({ error: 'Survey not found.' }, { status: 404 });
  return NextResponse.json(survey);
}

// PATCH /api/surveys/[id]
// Body: general survey fields, or { satisfactionScore, pushToQapi } for QAPI push
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.survey.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Survey not found.' }, { status: 404 });

  const body = await req.json();
  const {
    satisfactionScore, pushToQapi = true,
    status, outcome, conductedDate, surveyorNames,
    findingCount, immediateJeopardy, conditionLevel,
    responseDeadline, responseSubmitted, reportUrl, notes, capId,
  } = body;

  const score = satisfactionScore != null
    ? Math.min(100, Math.max(0, Number(satisfactionScore)))
    : undefined;

  // Update the survey record
  const updated = await prisma.survey.update({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...(score              != null && { satisfactionScore: score }),
      ...(status             != null && { status }),
      ...(outcome            != null && { outcome }),
      ...(conductedDate      != null && { conductedDate: new Date(conductedDate) }),
      ...(surveyorNames      != null && { surveyorNames }),
      ...(findingCount       != null && { findingCount: Number(findingCount) }),
      ...(immediateJeopardy  != null && { immediateJeopardy }),
      ...(conditionLevel     != null && { conditionLevel }),
      ...(responseDeadline   != null && { responseDeadline: new Date(responseDeadline) }),
      ...(responseSubmitted  != null && { responseSubmitted: new Date(responseSubmitted) }),
      ...(reportUrl          != null && { reportUrl }),
      ...(notes              != null && { notes }),
      ...(capId              != null && { capId }),
    },
  });

  // Push to QAPI patient_satisfaction metric when satisfactionScore is provided
  if (score != null && pushToQapi) {
    const refDate = existing.conductedDate ?? existing.createdAt;
    const month = refDate.getMonth() + 1; // 1-12
    const year  = refDate.getFullYear();

    try {
      // Upsert: numerator=score, denominator=100, value=score (calcType:'pct' => num/den*100 = score)
      await prisma.qapiMetric.upsert({
        where: {
          facilityId_metricKey_month_year: {
            facilityId: session.user.facilityId,
            metricKey: 'patient_satisfaction',
            month,
            year,
          },
        },
        create: {
          facilityId:  session.user.facilityId,
          metricName:  'Patient Satisfaction',
          metricKey:   'patient_satisfaction',
          category:    'PATIENT_EXPERIENCE',
          month,
          year,
          value:       score,
          target:      85,
          unit:        '%',
          numerator:   score,
          denominator: 100,
          notes:       `Auto-pushed from Survey ID ${params.id} on ${new Date().toLocaleDateString()}`,
        },
        update: {
          value:      score,
          numerator:  score,
          denominator: 100,
          notes:      `Auto-pushed from Survey ID ${params.id} on ${new Date().toLocaleDateString()}`,
        },
      });
    } catch {
      // Non-fatal - survey was updated, QAPI push failed silently
    }
  }

  return NextResponse.json({ ...updated, _qapiPushed: pushToQapi });
}
