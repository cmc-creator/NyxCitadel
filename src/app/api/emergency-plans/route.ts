import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plans = await prisma.emergencyPlan.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: [{ status: 'asc' }, { nextReviewDate: 'asc' }],
  });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const plan = await prisma.emergencyPlan.create({
    data: {
      facilityId:       session.user.facilityId,
      planName:         body.planName,
      planType:         body.planType,
      version:          body.version ?? '1.0',
      effectiveDate:    new Date(body.effectiveDate),
      nextReviewDate:   new Date(body.nextReviewDate),
      lastReviewedDate: body.lastReviewedDate ? new Date(body.lastReviewedDate) : undefined,
      approvedBy:       body.approvedBy ?? null,
      status:           body.status ?? 'ACTIVE',
      documentUrl:      body.documentUrl ?? null,
      summary:          body.summary ?? null,
    },
  });
  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'EmergencyPlan', entityId: plan.id, req });
  return NextResponse.json(plan, { status: 201 });
}
