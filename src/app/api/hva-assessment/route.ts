import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface HazardInput {
  hazardName: string;
  hazardType: string;
  probability: number;
  magnitude: number;
  preparedness: number;
  mitigationPlan?: string | null;
  responsibleParty?: string | null;
  notes?: string | null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    assessmentYear,
    status,
    reviewedBy,
    approvedBy,
    completedDate,
    documentUrl,
    notes,
    hazards = [],
  } = body as {
    assessmentYear: number;
    status: string;
    reviewedBy?: string | null;
    approvedBy?: string | null;
    completedDate?: string | null;
    documentUrl?: string | null;
    notes?: string | null;
    hazards: HazardInput[];
  };

  if (!assessmentYear) {
    return NextResponse.json({ error: 'assessmentYear is required' }, { status: 400 });
  }

  const facilityId = session.user.facilityId;

  // Calculate totalRiskScore across all hazards
  const totalRiskScore = hazards.length
    ? hazards.reduce((sum, h) => sum + (h.probability * h.magnitude * h.preparedness) / 27, 0) / hazards.length
    : null;

  // Upsert the assessment header
  const assessment = await prisma.hvaAssessment.upsert({
    where: {
      facilityId_assessmentYear: { facilityId, assessmentYear },
    },
    update: {
      status:         status as never,
      reviewedBy:     reviewedBy  ?? null,
      approvedBy:     approvedBy  ?? null,
      completedDate:  completedDate ? new Date(completedDate) : null,
      documentUrl:    documentUrl ?? null,
      notes:          notes       ?? null,
      totalRiskScore: totalRiskScore,
    },
    create: {
      facilityId,
      assessmentYear,
      status:         status as never,
      reviewedBy:     reviewedBy  ?? null,
      approvedBy:     approvedBy  ?? null,
      completedDate:  completedDate ? new Date(completedDate) : null,
      documentUrl:    documentUrl ?? null,
      notes:          notes       ?? null,
      totalRiskScore: totalRiskScore,
    },
  });

  // Replace all hazards: delete existing, insert new
  await prisma.hvaHazard.deleteMany({ where: { assessmentId: assessment.id } });

  if (hazards.length > 0) {
    await prisma.hvaHazard.createMany({
      data: hazards.map((h) => ({
        assessmentId:    assessment.id,
        hazardName:      h.hazardName,
        hazardType:      h.hazardType as never,
        probability:     h.probability,
        magnitude:       h.magnitude,
        preparedness:    h.preparedness,
        riskScore:       (h.probability * h.magnitude * h.preparedness) / 27,
        mitigationPlan:  h.mitigationPlan  ?? null,
        responsibleParty: h.responsibleParty ?? null,
        notes:           h.notes           ?? null,
      })),
    });
  }

  const result = await prisma.hvaAssessment.findUnique({
    where: { id: assessment.id },
    include: { hazards: true },
  });

  await logAudit({ userId: session.user.id, action: 'UPSERT', entityType: 'HvaAssessment', entityId: assessment.id, req });
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');

  const where = {
    facilityId: session.user.facilityId,
    ...(year ? { assessmentYear: parseInt(year, 10) } : {}),
  };

  const assessments = await prisma.hvaAssessment.findMany({
    where,
    include: { hazards: true },
    orderBy: { assessmentYear: 'desc' },
  });

  return NextResponse.json(assessments);
}
