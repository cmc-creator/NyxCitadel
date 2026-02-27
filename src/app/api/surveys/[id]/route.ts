import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/surveys/[id]
// Body: { satisfactionScore: number (0-100), pushToQapi?: boolean }
// When pushToQapi is true (default), upserts a QapiMetric for patient_satisfaction
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { satisfactionScore, pushToQapi = true } = body;

  if (satisfactionScore == null || isNaN(Number(satisfactionScore))) {
    return NextResponse.json({ error: 'satisfactionScore is required (0-100).' }, { status: 400 });
  }

  const score = Math.min(100, Math.max(0, Number(satisfactionScore)));

  // Verify the survey belongs to this facility
  const existing = await prisma.survey.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Survey not found.' }, { status: 404 });

  // Update the survey record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma.survey as any).update({
    where: { id: params.id },
    data: { satisfactionScore: score },
  });

  // Push to QAPI patient_satisfaction metric for the survey's conducted month/year
  if (pushToQapi) {
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
      // Non-fatal — survey was updated, QAPI push failed silently
    }
  }

  return NextResponse.json({ ...updated, _qapiPushed: pushToQapi });
}
