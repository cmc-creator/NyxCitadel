import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCapNumber } from '@/lib/utils';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const caps = await prisma.correctiveActionPlan.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(caps);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, source, priority, targetDate, measureOfSuccess } = body;

  if (!title || !source || !priority || !targetDate) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const cap = await prisma.correctiveActionPlan.create({
    data: {
      facilityId:       session.user.facilityId,
      capNumber:        generateCapNumber(),
      title,
      description:      description ?? '',
      source,
      priority,
      correctionPlan:   description ?? '',
      targetDate:       new Date(targetDate),
      measureOfSuccess: measureOfSuccess ?? null,
      status:           'OPEN',
    },
  });

  return NextResponse.json(cap, { status: 201 });
}
