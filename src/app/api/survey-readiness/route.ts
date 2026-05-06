import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getSurveyReadinessScore } from '@/lib/survey-readiness';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await getSurveyReadinessScore(session.user.facilityId);
  return NextResponse.json(result);
}
