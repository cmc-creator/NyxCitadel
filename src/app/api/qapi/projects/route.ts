import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logAudit } from '@/lib/audit';
import type { QapiCategory, RegulatoryBody } from '@prisma/client';

const CreateSchema = z.object({
  title: z.string().min(1),
  category: z.string(),
  problemStatement: z.string().min(1),
  aim: z.string().min(1),
  measure: z.string().optional(),
  baselineValue: z.number().optional(),
  targetValue: z.number().optional(),
  targetUnit: z.string().optional(),
  interventions: z.string().optional(),
  owner: z.string().optional(),
  team: z.string().optional(),
  startDate: z.string(),
  targetDate: z.string(),
  regulatoryBody: z.string().optional(),
  standardRef: z.string().optional(),
  relatedMetricKey: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projects = await prisma.qapiProject.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { facilityId } = session.user;

  // Auto-generate project number
  const count = await prisma.qapiProject.count({ where: { facilityId } });
  const projectNumber = `QAPI-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const project = await prisma.qapiProject.create({
    data: {
      facilityId,
      projectNumber,
      title: parsed.data.title,
      category: parsed.data.category as QapiCategory,
      problemStatement: parsed.data.problemStatement,
      aim: parsed.data.aim,
      measure: parsed.data.measure,
      baselineValue: parsed.data.baselineValue,
      targetValue: parsed.data.targetValue,
      targetUnit: parsed.data.targetUnit,
      interventions: parsed.data.interventions,
      owner: parsed.data.owner,
      team: parsed.data.team,
      startDate: new Date(parsed.data.startDate),
      targetDate: new Date(parsed.data.targetDate),
      regulatoryBody: parsed.data.regulatoryBody as RegulatoryBody | undefined,
      standardRef: parsed.data.standardRef,
      relatedMetricKey: parsed.data.relatedMetricKey,
      status: 'ACTIVE',
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'QapiProject', entityId: project.id, req });
  return NextResponse.json(project, { status: 201 });
}
