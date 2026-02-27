import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/hva — list all HVA assessments
// POST /api/hva — upsert assessment for a year + replace hazards
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const assessments = await prisma.hvaAssessment.findMany({
    where: { facilityId: session.user.facilityId },
    include: { hazards: { orderBy: { riskScore: 'desc' } } },
    orderBy: { assessmentYear: 'desc' },
  });
  return NextResponse.json(assessments);
}

function calcRiskScore(probability: number, magnitude: number, preparedness: number): number {
  // Kaiser Permanente HVA: normalize by max (3*3*3 = 27)
  return (probability * magnitude * preparedness) / 27;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { assessmentYear, status, reviewedBy, approvedBy, completedDate, documentUrl, notes, hazards = [] } = body;

  // Upsert the assessment for this year
  const existing = await prisma.hvaAssessment.findUnique({
    where: { facilityId_assessmentYear: { facilityId: session.user.facilityId, assessmentYear } },
  });

  const processed = (hazards as Array<{
    hazardName: string;
    hazardType: string;
    probability: number;
    magnitude: number;
    preparedness: number;
    mitigationPlan?: string;
    responsibleParty?: string;
    notes?: string;
  }>).map(h => ({
    hazardName:       h.hazardName,
    hazardType:       h.hazardType as never,
    probability:      Number(h.probability),
    magnitude:        Number(h.magnitude),
    preparedness:     Number(h.preparedness),
    riskScore:        calcRiskScore(Number(h.probability), Number(h.magnitude), Number(h.preparedness)),
    mitigationPlan:   h.mitigationPlan ?? null,
    responsibleParty: h.responsibleParty ?? null,
    notes:            h.notes ?? null,
  }));

  const totalRiskScore = processed.length
    ? processed.reduce((s, h) => s + h.riskScore, 0) / processed.length
    : null;

  let assessment;
  if (existing) {
    // Delete old hazards, then update
    await prisma.hvaHazard.deleteMany({ where: { assessmentId: existing.id } });
    assessment = await prisma.hvaAssessment.update({
      where: { id: existing.id },
      data: {
        status:         status ?? undefined,
        reviewedBy:     reviewedBy ?? null,
        approvedBy:     approvedBy ?? null,
        completedDate:  completedDate ? new Date(completedDate) : null,
        documentUrl:    documentUrl ?? null,
        notes:          notes ?? null,
        totalRiskScore,
        hazards: { create: processed },
      },
      include: { hazards: { orderBy: { riskScore: 'desc' } } },
    });
  } else {
    assessment = await prisma.hvaAssessment.create({
      data: {
        facilityId:     session.user.facilityId,
        assessmentYear,
        status:         status ?? 'IN_PROGRESS',
        reviewedBy:     reviewedBy ?? null,
        approvedBy:     approvedBy ?? null,
        completedDate:  completedDate ? new Date(completedDate) : null,
        documentUrl:    documentUrl ?? null,
        notes:          notes ?? null,
        totalRiskScore,
        hazards: { create: processed },
      },
      include: { hazards: { orderBy: { riskScore: 'desc' } } },
    });
  }

  return NextResponse.json(assessment, { status: existing ? 200 : 201 });
}
