import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function generateQocNumber(facilityId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.qocComplaint.count({ where: { facilityId } });
  return `QOC-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Add 10 business days to a date (skip Sat/Sun)
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const items = await prisma.qocComplaint.findMany({
    where: {
      facilityId: session.user.facilityId,
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { dateReceived: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    dateReceived, complainantType, cmsComplaintNumber, stateReferenceNumber,
    allegationSummary, allegationCategories,
    loiReceivedDate, investigationType, investigatorName,
    responseSubmittedDate, surveyDate,
    findingsSummary, deficienciesFound, citationsIssued,
    assignedTo, linkedGrievanceId, linkedPocId, linkedRcaId,
    notes,
  } = body;

  if (!dateReceived || !complainantType || !allegationSummary) {
    return NextResponse.json(
      { error: 'Date received, complainant type, and allegation summary are required.' },
      { status: 400 }
    );
  }

  const loiDate = loiReceivedDate ? new Date(loiReceivedDate) : null;
  const responseDueDate = loiDate ? addBusinessDays(loiDate, 10) : null;
  const qocNumber = await generateQocNumber(session.user.facilityId);

  const item = await prisma.qocComplaint.create({
    data: {
      facilityId:           session.user.facilityId,
      qocNumber,
      dateReceived:         new Date(dateReceived),
      complainantType,
      cmsComplaintNumber:   cmsComplaintNumber ?? null,
      stateReferenceNumber: stateReferenceNumber ?? null,
      allegationSummary,
      allegationCategories: allegationCategories ?? [],
      loiReceivedDate:      loiDate,
      investigationType:    investigationType ?? 'STANDARD',
      investigatorName:     investigatorName ?? null,
      responseDueDate,
      responseSubmittedDate:
        responseSubmittedDate ? new Date(responseSubmittedDate) : null,
      surveyDate:           surveyDate ? new Date(surveyDate) : null,
      findingsSummary:      findingsSummary ?? null,
      deficienciesFound:    deficienciesFound ?? false,
      citationsIssued:      citationsIssued ?? [],
      assignedTo:           assignedTo ?? null,
      linkedGrievanceId:    linkedGrievanceId ?? null,
      linkedPocId:          linkedPocId ?? null,
      linkedRcaId:          linkedRcaId ?? null,
      notes:                notes ?? null,
      status:               loiDate ? 'LOI_RECEIVED' : 'OPEN',
    },
  });

  return NextResponse.json(item, { status: 201 });
}
