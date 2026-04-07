import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rounds = await prisma.eocRound.findMany({
    where: { facilityId: session.user.facilityId },
    include: { deficiencies: { select: { id: true, status: true, severity: true } } },
    orderBy: { conductedDate: 'desc' },
  });
  return NextResponse.json(rounds);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    roundType, conductedDate, conductedBy,
    participantIds, areasInspected, summary,
  } = body;

  if (!roundType || !conductedDate || !conductedBy) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const year = new Date().getFullYear();
  const count = await prisma.eocRound.count({
    where: { facilityId: session.user.facilityId },
  });
  const roundNumber = `EOC-ROUND-${year}-${String(count + 1).padStart(3, '0')}`;

  const round = await prisma.eocRound.create({
    data: {
      facilityId: session.user.facilityId,
      roundNumber,
      roundType,
      conductedDate: new Date(conductedDate),
      conductedBy,
      participantIds: participantIds ?? [],
      areasInspected: areasInspected ?? [],
      status: 'IN_PROGRESS',
      summary: summary ?? null,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'EocRound', entityId: round.id, req });
  return NextResponse.json(round, { status: 201 });
}
