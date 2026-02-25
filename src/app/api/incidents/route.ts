import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateIncidentNumber } from '@/lib/utils';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const incidents = await prisma.incident.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { dateOccurred: 'desc' },
  });
  return NextResponse.json(incidents);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    incidentType, severity, dateOccurred,
    location, description, immediateActions,
    patientInvolved, reportableToState,
  } = body;

  if (!incidentType || !severity || !dateOccurred || !description) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const incident = await prisma.incident.create({
    data: {
      facilityId:        session.user.facilityId,
      incidentNumber:    generateIncidentNumber(),
      incidentType,
      severity,
      dateOccurred:      new Date(dateOccurred),
      location:          location ?? null,
      description,
      immediateActions:  immediateActions ?? null,
      patientInvolved:   patientInvolved ?? false,
      reportableToState: reportableToState ?? false,
      status:            'OPEN',
    },
  });

  return NextResponse.json(incident, { status: 201 });
}
