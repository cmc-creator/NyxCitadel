import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

async function generateIncidentNumber(facilityId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.incident.count({ where: { facilityId } });
  return `INC-${year}-${String(count + 1).padStart(3, '0')}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    dateOccurred, incidentType, severity, location,
    description, immediateActions,
    patientInvolved, reportableToState,
  } = body;

  if (!dateOccurred || !incidentType || !severity || !description) {
    return NextResponse.json(
      { error: 'Incident date, type, severity, and description are required.' },
      { status: 400 }
    );
  }

  const incidentNumber = await generateIncidentNumber(session.user.facilityId);

  const item = await prisma.incident.create({
    data: {
      facilityId:       session.user.facilityId,
      incidentNumber,
      dateOccurred:     new Date(dateOccurred),
      incidentType,
      severity,
      location:         location ?? null,
      description,
      immediateActions: immediateActions ?? null,
      patientInvolved:  patientInvolved ?? false,
      reportableToState: reportableToState ?? false,
      status:           'OPEN',
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'CREATE_INCIDENT',
    entityType: 'Incident',
    entityId: item.id,
    changes: { incidentNumber: item.incidentNumber, incidentType, severity, dateOccurred },
    req,
  });

  return NextResponse.json(item, { status: 201 });
}
