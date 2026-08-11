import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import HvaEditForm from './HvaEditForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { year: string } }) {
  return { title: `${params.year} HVA - Edit` };
}

export default async function HvaEditPage({ params }: { params: { year: string } }) {
  const session = await auth();
  if (!session?.user?.facilityId) redirect('/login');

  const facilityId = session.user.facilityId;
  const year = parseInt(params.year, 10);
  if (isNaN(year) || year < 2000 || year > 2100) redirect('/emergency/hva');

  const [assessment, prevAssessment] = await Promise.all([
    prisma.hvaAssessment.findUnique({
      where: { facilityId_assessmentYear: { facilityId, assessmentYear: year } },
      include: { hazards: { orderBy: { riskScore: 'desc' } } },
    }),
    prisma.hvaAssessment.findUnique({
      where: { facilityId_assessmentYear: { facilityId, assessmentYear: year - 1 } },
      include: { hazards: { orderBy: { riskScore: 'desc' } } },
    }),
  ]);

  return (
    <HvaEditForm
      year={year}
      assessment={assessment ? JSON.parse(JSON.stringify(assessment)) : null}
      previousYear={prevAssessment ? JSON.parse(JSON.stringify(prevAssessment)) : null}
    />
  );
}