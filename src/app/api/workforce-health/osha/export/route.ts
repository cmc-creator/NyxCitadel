import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()), 10);

  const yearStart = new Date(year, 0, 1);
  const yearEnd   = new Date(year + 1, 0, 1);

  const logs = await prisma.oshaLog.findMany({
    where: {
      facilityId: session.user.facilityId,
      injuryDate: { gte: yearStart, lt: yearEnd },
      recordable: true,
    },
  });

  const facility = await prisma.facility.findUnique({
    where: { id: session.user.facilityId },
    select: { name: true, address: true, city: true },
  });

  const summary = {
    year,
    facilityName: facility?.name ?? '',
    facilityAddress: [facility?.address, facility?.city].filter(Boolean).join(', '),
    totalCases:            logs.length,
    deaths:                logs.filter(l => l.outcome === 'FATALITY').length,
    daysAwayCases:         logs.filter(l => l.outcome === 'DAYS_AWAY' || l.daysAway > 0).length,
    totalDaysAway:         logs.reduce((s, l) => s + (l.daysAway ?? 0), 0),
    jobTransferCases:      logs.filter(l => l.outcome === 'JOB_TRANSFER_RESTRICTION').length,
    totalDaysRestriction:  logs.reduce((s, l) => s + (l.daysRestriction ?? 0), 0),
    otherRecordableCases:  logs.filter(l => l.outcome === 'INJURY_ILLNESS' || l.outcome === 'MEDICAL_TREATMENT_ONLY').length,
    needlestickCases:      logs.filter(l => l.injuryType === 'NEEDLESTICK_SHARPS').length,
    musculoskeletalCases:  logs.filter(l => l.injuryType === 'PATIENT_HANDLING_MUSCULOSKELETAL').length,
    workplaceViolenceCases:logs.filter(l => l.injuryType === 'WORKPLACE_VIOLENCE').length,
  };

  return NextResponse.json(summary);
}
