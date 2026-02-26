import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function generateRcaNumber(facilityId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.rootCauseAnalysis.count({ where: { facilityId } });
  return `RCA-${year}-${String(count + 1).padStart(3, '0')}`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rcas = await prisma.rootCauseAnalysis.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { eventDate: 'desc' },
  });
  return NextResponse.json(rcas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    eventDate, eventDescription, eventType, linkedIncidentId,
    teamMembers, completedBy, conductedDate,
    eventTimeline, humanFactors, equipmentFactors, environmentFactors,
    processFactors, organizationalFactors, whyAnalysis, rootCauses, actionItems,
    conclusion, preventabilityRating, systemChangesRequired,
    policyChangesRequired, trainingRequired, documentUrl, notes,
  } = body;

  if (!eventDate || !eventDescription || !eventType) {
    return NextResponse.json({ error: 'Event date, description, and type are required.' }, { status: 400 });
  }

  const rcaNumber = await generateRcaNumber(session.user.facilityId);

  const rca = await prisma.rootCauseAnalysis.create({
    data: {
      facilityId:             session.user.facilityId,
      rcaNumber,
      eventDate:              new Date(eventDate),
      eventDescription,
      eventType,
      linkedIncidentId:       linkedIncidentId ?? null,
      teamMembers:            teamMembers ?? null,
      completedBy:            completedBy ?? null,
      conductedDate:          conductedDate ? new Date(conductedDate) : null,
      status:                 'IN_PROGRESS',
      eventTimeline:          eventTimeline ?? null,
      humanFactors:           humanFactors ?? null,
      equipmentFactors:       equipmentFactors ?? null,
      environmentFactors:     environmentFactors ?? null,
      processFactors:         processFactors ?? null,
      organizationalFactors:  organizationalFactors ?? null,
      whyAnalysis:            whyAnalysis ?? null,
      rootCauses:             rootCauses ?? null,
      actionItems:            actionItems ?? null,
      conclusion:             conclusion ?? null,
      preventabilityRating:   preventabilityRating ?? null,
      systemChangesRequired:  systemChangesRequired ?? false,
      policyChangesRequired:  policyChangesRequired ?? false,
      trainingRequired:       trainingRequired ?? false,
      documentUrl:            documentUrl ?? null,
      notes:                  notes ?? null,
    },
  });

  return NextResponse.json(rca, { status: 201 });
}
