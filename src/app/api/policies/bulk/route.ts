import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const CATEGORY_PREFIX: Record<string, string> = {
  ADMINISTRATIVE:         'ADM',
  CLINICAL:               'CLN',
  EMERGENCY_MANAGEMENT:   'EM',
  ENVIRONMENT_OF_CARE:    'EOC',
  HUMAN_RESOURCES:        'HR',
  INFECTION_CONTROL:      'IC',
  INFORMATION_MANAGEMENT: 'IM',
  LEADERSHIP:             'LDR',
  LIFE_SAFETY:            'LS',
  MEDICATION_MANAGEMENT:  'MM',
  PATIENT_RIGHTS:         'PR',
  PERFORMANCE_IMPROVEMENT:'PI',
  PRIVACY_SECURITY:       'PS',
  OTHER:                  'POL',
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const facilityId = session.user.facilityId;
  const body = await req.json();

  if (!Array.isArray(body.policies) || body.policies.length === 0) {
    return NextResponse.json({ error: 'policies array is required' }, { status: 400 });
  }

  const results: { id: string; policyNumber: string; title: string }[] = [];
  const errors: { index: number; error: string }[] = [];

  for (let i = 0; i < body.policies.length; i++) {
    const p = body.policies[i];

    if (!p.title?.trim() || !p.category || !p.effectiveDate || !p.nextReviewDate) {
      errors.push({ index: i, error: 'title, category, effectiveDate, nextReviewDate are required' });
      continue;
    }

    try {
      const prefix = CATEGORY_PREFIX[p.category] ?? 'POL';
      const count = await prisma.policy.count({ where: { facilityId, category: p.category as never } });
      const policyNumber = `${prefix}-${String(count + results.length + 1).padStart(3, '0')}`;

      const created = await prisma.policy.create({
        data: {
          facilityId,
          policyNumber,
          title:           p.title.trim(),
          category:        p.category as never,
          version:         p.version         ?? '1.0',
          effectiveDate:   new Date(p.effectiveDate),
          nextReviewDate:  new Date(p.nextReviewDate),
          reviewFrequency: (p.reviewFrequency ?? 'ANNUAL') as never,
          owner:           p.owner           ?? null,
          standardRef:     p.standardRef     ?? null,
          summary:         p.summary         ?? null,
          documentUrl:     p.documentUrl     ?? null,
          regulatoryBody:  p.regulatoryBodies ?? [],
          status:          (p.status ?? 'ACTIVE') as never,
        },
        select: { id: true, policyNumber: true, title: true },
      });

      results.push(created);
      await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'Policy', entityId: created.id, req });
    } catch (err) {
      errors.push({ index: i, error: String(err) });
    }
  }

  return NextResponse.json({ created: results, errors }, { status: 201 });
}
