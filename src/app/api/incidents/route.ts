import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateIncidentNumber } from '@/lib/utils';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const incidents = await prisma.incident.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { incidentDate: 'desc' },
  });
  return NextResponse.json(incidents);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    title, incidentType, severity, incidentDate,
    location, patientInitials, description,
    immediateActions, injuryOccurred, requiresStateReport,
  } = body;

  if (!title || !incidentType || !severity || !incidentDate) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const incident = await prisma.incident.create({
    data: {
      facilityId:          session.user.facilityId,
      reportedById:        session.user.id,
      incidentNumber:      generateIncidentNumber(),
      title,
      incidentType,
      severity,
      incidentDate:        new Date(incidentDate),
      location:            location ?? null,
      patientInitials:     patientInitials ?? null,
      description,
      immediateActions:    immediateActions ?? null,
      injuryOccurred:      injuryOccurred ?? false,
      requiresStateReport: requiresStateReport ?? false,
      status:              'OPEN',
    },
  });

  return NextResponse.json(incident, { status: 201 });
}
