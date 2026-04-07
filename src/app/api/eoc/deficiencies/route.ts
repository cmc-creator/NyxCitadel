import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deficiencies = await prisma.eocDeficiency.findMany({
    where: { facilityId: session.user.facilityId },
    include: { round: { select: { roundNumber: true, roundType: true } } },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
  });
  return NextResponse.json(deficiencies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    roundId, location, unit, description,
    category, severity, assignedTo, dueDate, notes,
  } = body;

  if (!location || !description || !category || !severity) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const year = new Date().getFullYear();
  const count = await prisma.eocDeficiency.count({
    where: { facilityId: session.user.facilityId },
  });
  const defNumber = `DEF-${year}-${String(count + 1).padStart(3, '0')}`;

  const deficiency = await prisma.eocDeficiency.create({
    data: {
      facilityId: session.user.facilityId,
      defNumber,
      roundId: roundId ?? null,
      location,
      unit: unit ?? null,
      description,
      category,
      severity,
      status: 'OPEN',
      assignedTo: assignedTo ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: notes ?? null,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'EocDeficiency', entityId: deficiency.id, req });
  return NextResponse.json(deficiency, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status, resolvedBy, resolvedDate, verifiedBy, notes } = body;

  if (!id) return NextResponse.json({ error: 'Missing deficiency id.' }, { status: 400 });

  const updated = await prisma.eocDeficiency.update({
    where: { id },
    data: {
      status: status ?? undefined,
      resolvedBy: resolvedBy ?? undefined,
      resolvedDate: resolvedDate ? new Date(resolvedDate) : undefined,
      verifiedBy: verifiedBy ?? undefined,
      notes: notes ?? undefined,
    },
  });

  return NextResponse.json(updated);
}
