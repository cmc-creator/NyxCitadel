import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logAudit } from '@/lib/audit';

const CreateSchema = z.object({
  title: z.string().min(1),
  assessmentType: z.string(),
  scope: z.string().optional(),
  conductedDate: z.string().optional(),
  conductedBy: z.string().optional(),
  regulatoryBody: z.string().optional(),
  standardRef: z.string().optional(),
  nextReviewDate: z.string().optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    riskDescription: z.string().min(1),
    category: z.string().optional(),
    likelihood: z.number().int().min(1).max(5),
    severity: z.number().int().min(1).max(5),
    currentControls: z.string().optional(),
    recommendedActions: z.string().optional(),
    assignedTo: z.string().optional(),
    targetDate: z.string().optional(),
  })).optional().default([]),
});

function calcRiskLevel(score: number): string {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6)  return 'MEDIUM';
  return 'LOW';
}

function calcPriority(score: number): string {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6)  return 'MEDIUM';
  return 'LOW';
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const assessments = await prisma.riskAssessment.findMany({
    where: { facilityId: session.user.facilityId },
    include: {
      items: { orderBy: { riskScore: 'desc' } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { items, conductedDate, nextReviewDate, ...rest } = parsed.data;

  const builtItems = items.map((item) => {
    const score = item.likelihood * item.severity;
    return {
      ...item,
      riskScore: score,
      riskLevel: calcRiskLevel(score) as any,
      priority: calcPriority(score) as any,
      targetDate: item.targetDate ? new Date(item.targetDate) : undefined,
    };
  });

  // compute overall risk level from highest item score
  const maxScore = builtItems.reduce((max, i) => Math.max(max, i.riskScore), 0);

  const assessment = await prisma.riskAssessment.create({
    data: {
      facilityId: session.user.facilityId,
      title: rest.title,
      assessmentType: rest.assessmentType as any,
      scope: rest.scope,
      conductedDate: conductedDate ? new Date(conductedDate) : undefined,
      conductedBy: rest.conductedBy,
      regulatoryBody: rest.regulatoryBody as any ?? undefined,
      standardRef: rest.standardRef,
      nextReviewDate: nextReviewDate ? new Date(nextReviewDate) : undefined,
      summary: rest.summary,
      notes: rest.notes,
      status: 'IN_PROGRESS',
      overallRiskLevel: maxScore > 0 ? calcRiskLevel(maxScore) as any : undefined,
      items: { create: builtItems },
    },
    include: { items: true },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'RiskAssessment', entityId: assessment.id, req });
  return NextResponse.json(assessment, { status: 201 });
}
