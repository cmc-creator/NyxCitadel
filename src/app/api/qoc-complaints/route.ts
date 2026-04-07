import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// Auto-generate QOC number: QOC-YYYY-NNN
async function generateQocNumber(facilityId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.qocComplaint.count({
    where: { facilityId, qocNumber: { startsWith: `QOC-${year}-` } },
  });
  return `QOC-${year}-${String(count + 1).padStart(3, '0')}`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const complaints = await prisma.qocComplaint.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { dateReceived: 'desc' },
  });

  return NextResponse.json(complaints);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    dateReceived,
    complainantType,
    cmsComplaintNumber,
    stateReferenceNumber,
    allegationSummary,
    allegationCategories,
    loiReceivedDate,
    investigationType,
    investigatorName,
    responseDueDate,
    responseSubmittedDate,
    surveyDate,
    findingsSummary,
    deficienciesFound,
    citationsIssued,
    assignedTo,
    notes,
    status,
  } = body;

  if (!dateReceived || !complainantType || !allegationSummary) {
    return NextResponse.json(
      { error: 'Date received, complainant type, and allegation summary are required.' },
      { status: 400 }
    );
  }

  const qocNumber = await generateQocNumber(session.user.facilityId);

  const complaint = await prisma.qocComplaint.create({
    data: {
      facilityId:            session.user.facilityId,
      qocNumber,
      dateReceived:          new Date(dateReceived),
      complainantType,
      cmsComplaintNumber:    cmsComplaintNumber || null,
      stateReferenceNumber:  stateReferenceNumber || null,
      allegationSummary,
      allegationCategories:  allegationCategories ?? [],
      loiReceivedDate:       loiReceivedDate ? new Date(loiReceivedDate) : null,
      investigationType:     investigationType || 'STANDARD',
      investigatorName:      investigatorName || null,
      responseDueDate:       responseDueDate ? new Date(responseDueDate) : null,
      responseSubmittedDate: responseSubmittedDate ? new Date(responseSubmittedDate) : null,
      surveyDate:            surveyDate ? new Date(surveyDate) : null,
      findingsSummary:       findingsSummary || null,
      deficienciesFound:     !!deficienciesFound,
      citationsIssued:       citationsIssued ?? [],
      assignedTo:            assignedTo || null,
      notes:                 notes || null,
      status:                status || 'OPEN',
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'QocComplaint', entityId: complaint.id, req });
  return NextResponse.json(complaint, { status: 201 });
}
