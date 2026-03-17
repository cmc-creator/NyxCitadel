import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CATEGORY_PREFIX: Record<string, string> = {
  ADMINISTRATIVE:        'ADM',
  CLINICAL:              'CLN',
  EMERGENCY_MANAGEMENT:  'EM',
  ENVIRONMENT_OF_CARE:   'EOC',
  HUMAN_RESOURCES:       'HR',
  INFECTION_CONTROL:     'IC',
  INFORMATION_MANAGEMENT:'IM',
  LEADERSHIP:            'LDR',
  LIFE_SAFETY:           'LS',
  MEDICATION_MANAGEMENT: 'MM',
  PATIENT_RIGHTS:        'PR',
  PERFORMANCE_IMPROVEMENT:'PI',
  PRIVACY_SECURITY:      'PS',
  OTHER:                 'POL',
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status   = searchParams.get('status');

  const policies = await prisma.policy.findMany({
    where: {
      facilityId: session.user.facilityId,
      ...(category ? { category: category as never } : {}),
      ...(status   ? { status:   status   as never } : {}),
    },
    orderBy: [{ nextReviewDate: 'asc' }, { title: 'asc' }],
  });

  return NextResponse.json(policies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const facilityId = session.user.facilityId;

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!body.category) {
    return NextResponse.json({ error: 'Category is required' }, { status: 400 });
  }
  if (!body.effectiveDate || !body.nextReviewDate) {
    return NextResponse.json({ error: 'Effective date and next review date are required' }, { status: 400 });
  }

  // Auto-generate policy number if not provided
  let policyNumber = body.policyNumber?.trim();
  if (!policyNumber) {
    const prefix = CATEGORY_PREFIX[body.category] ?? 'POL';
    const count = await prisma.policy.count({
      where: { facilityId, category: body.category as never },
    });
    policyNumber = `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  const policy = await prisma.policy.create({
    data: {
      facilityId,
      policyNumber,
      title:           body.title.trim(),
      category:        body.category as never,
      version:         body.version         ?? '1.0',
      effectiveDate:   new Date(body.effectiveDate),
      nextReviewDate:  new Date(body.nextReviewDate),
      reviewFrequency: (body.reviewFrequency ?? 'ANNUAL') as never,
      owner:           body.owner           ?? null,
      standardRef:     body.standardRef     ?? null,
      summary:         body.description     ?? null,
      documentUrl:     body.documentUrl     ?? null,
      regulatoryBody:  body.regulatoryBodies ?? [],
      status:          (body.status ?? 'ACTIVE') as never,
    },
  });

  return NextResponse.json(policy, { status: 201 });
}
