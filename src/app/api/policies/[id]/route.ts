import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const policy = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!policy) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(policy);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Verify ownership
  const existing = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const policy = await prisma.policy.update({
    where: { id: params.id },
    data: {
      ...(body.title           !== undefined && { title:           body.title }),
      ...(body.category        !== undefined && { category:        body.category as never }),
      ...(body.version         !== undefined && { version:         body.version }),
      ...(body.policyNumber    !== undefined && { policyNumber:    body.policyNumber }),
      ...(body.effectiveDate   !== undefined && { effectiveDate:   new Date(body.effectiveDate) }),
      ...(body.nextReviewDate  !== undefined && { nextReviewDate:  new Date(body.nextReviewDate) }),
      ...(body.reviewFrequency !== undefined && { reviewFrequency: body.reviewFrequency as never }),
      ...(body.owner           !== undefined && { owner:           body.owner }),
      ...(body.standardRef     !== undefined && { standardRef:     body.standardRef }),
      ...(body.summary         !== undefined && { summary:         body.summary }),
      ...(body.documentUrl     !== undefined && { documentUrl:     body.documentUrl }),
      ...(body.regulatoryBodies!== undefined && { regulatoryBody:  body.regulatoryBodies }),
      ...(body.status          !== undefined && { status:          body.status as never }),
      ...(body.lastReviewedDate!== undefined && { lastReviewedDate: new Date(body.lastReviewedDate) }),
    },
  });

  return NextResponse.json(policy);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const existing = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.policy.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
