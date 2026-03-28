import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const item = await prisma.incidentReport.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await prisma.incidentReport.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();

  const updated = await prisma.incidentReport.update({
    where: { id: params.id },
    data: {
      ...body,
      incidentDate:      body.incidentDate  ? new Date(body.incidentDate)  : undefined,
      patientDOB:        body.patientDOB    ? new Date(body.patientDOB)    : undefined,
      familyNotifiedDate:body.familyNotifiedDate ? new Date(body.familyNotifiedDate) : undefined,
      adhsReportDate:    body.adhsReportDate ? new Date(body.adhsReportDate) : undefined,
      ahcccsReportDate:  body.ahcccsReportDate ? new Date(body.ahcccsReportDate) : undefined,
      jcReportDate:      body.jcReportDate  ? new Date(body.jcReportDate)  : undefined,
      iadSubmittedDate:  body.iadSubmittedDate ? new Date(body.iadSubmittedDate) : undefined,
      closedDate:        body.closedDate    ? new Date(body.closedDate)    : undefined,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'UPDATE_INCIDENT_REPORT',
    entityType: 'IncidentReport',
    entityId: params.id,
    changes: body,
    req,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await prisma.incidentReport.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.incidentReport.delete({ where: { id: params.id } });

  await logAudit({
    userId: session.user.id,
    action: 'DELETE_INCIDENT_REPORT',
    entityType: 'IncidentReport',
    entityId: params.id,
    changes: { irNumber: existing.irNumber, incidentType: existing.incidentType, severity: existing.severity },
    req,
  });

  return NextResponse.json({ success: true });
}
