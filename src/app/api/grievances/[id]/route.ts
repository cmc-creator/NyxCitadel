import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const grievance = await prisma.grievanceRecord.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!grievance) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(grievance);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = await prisma.grievanceRecord.updateMany({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
      ...(body.severity !== undefined && { severity: body.severity }),
      ...(body.acknowledgmentDate !== undefined && {
        acknowledgmentDate: body.acknowledgmentDate ? new Date(body.acknowledgmentDate) : null,
      }),
      ...(body.acknowledgmentSentBy !== undefined && { acknowledgmentSentBy: body.acknowledgmentSentBy }),
      ...(body.resolutionDate !== undefined && {
        resolutionDate: body.resolutionDate ? new Date(body.resolutionDate) : null,
      }),
      ...(body.resolutionSentBy !== undefined && { resolutionSentBy: body.resolutionSentBy }),
      ...(body.resolution !== undefined && { resolution: body.resolution }),
      ...(body.outcomeCategory !== undefined && { outcomeCategory: body.outcomeCategory }),
      ...(body.reportableToAdhs !== undefined && { reportableToAdhs: body.reportableToAdhs }),
      ...(body.reportedToAdhs !== undefined && { reportedToAdhs: body.reportedToAdhs }),
      ...(body.adshReportDate !== undefined && {
        adshReportDate: body.adshReportDate ? new Date(body.adshReportDate) : null,
      }),
      ...(body.linkedIncidentId !== undefined && { linkedIncidentId: body.linkedIncidentId }),
      ...(body.linkedCapId !== undefined && { linkedCapId: body.linkedCapId }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(result);
}
