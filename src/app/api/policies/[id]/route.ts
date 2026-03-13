import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const policy = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });

  if (!policy) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json(policy);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const body = await req.json();
  const {
    status, version, effectiveDate, nextReviewDate, lastReviewedDate,
    reviewFrequency, owner, standardRef, summary, documentUrl, approvedBy,
  } = body;

  const policy = await prisma.policy.update({
    where: { id: params.id },
    data: {
      ...(status            != null && { status }),
      ...(version           != null && { version }),
      ...(effectiveDate     != null && { effectiveDate: new Date(effectiveDate) }),
      ...(nextReviewDate    != null && { nextReviewDate: new Date(nextReviewDate) }),
      ...(lastReviewedDate  != null && { lastReviewedDate: new Date(lastReviewedDate) }),
      ...(reviewFrequency   != null && { reviewFrequency }),
      ...(owner             != null && { owner }),
      ...(standardRef       != null && { standardRef }),
      ...(summary           != null && { summary }),
      ...(documentUrl       != null && { documentUrl }),
      ...(approvedBy        != null && { approvedBy }),
    },
  });

  return NextResponse.json(policy);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  await prisma.policy.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
