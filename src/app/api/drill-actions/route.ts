import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const drillId = req.nextUrl.searchParams.get('drillId');
  if (!drillId) return NextResponse.json({ error: 'drillId required' }, { status: 400 });

  const actions = await prisma.drillAction.findMany({
    where: { drillId, facilityId: session.user.facilityId },
    orderBy: { timestamp: 'asc' },
  });

  return NextResponse.json(actions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { drillId, actor, actionType, description, outcomeNotes, issueFlag } = body;

  if (!drillId || !actor || !actionType || !description) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Verify drill belongs to this facility
  const drill = await prisma.drill.findFirst({
    where: { id: drillId, facilityId: session.user.facilityId },
  });
  if (!drill) return NextResponse.json({ error: 'Drill not found.' }, { status: 404 });

  const action = await prisma.drillAction.create({
    data: {
      drillId,
      facilityId: session.user.facilityId,
      actor,
      actionType,
      description,
      outcomeNotes: outcomeNotes ?? null,
      issueFlag: issueFlag ?? false,
    },
  });

  // If drill is not yet IN_PROGRESS, promote it
  if (drill.status === 'SCHEDULED') {
    await prisma.drill.update({
      where: { id: drillId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  return NextResponse.json(action, { status: 201 });
}
