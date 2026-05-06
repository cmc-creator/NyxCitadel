import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.complianceItem.findMany({
    where: { facilityId: session.user.facilityId, deletedAt: null },
    orderBy: { nextDueDate: 'asc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    title,
    description,
    regulatoryBody,
    standardRef,
    category,
    frequency,
    lastDoneDate,
    nextDueDate,
    status,
    isRequired,
    notes,
    responsibleRole,
  } = body;

  if (!title || !regulatoryBody || !category || !frequency) {
    return NextResponse.json(
      { error: 'Missing required fields: title, regulatoryBody, category, frequency.' },
      { status: 400 }
    );
  }

  const item = await prisma.complianceItem.create({
    data: {
      facilityId:     session.user.facilityId,
      title,
      description:    description ?? null,
      regulatoryBody,
      standardRef:    standardRef ?? null,
      category,
      frequency,
      lastDoneDate:   lastDoneDate ? new Date(lastDoneDate) : null,
      nextDueDate:    nextDueDate ? new Date(nextDueDate) : null,
      status:         status ?? 'ACTIVE',
      isRequired:     isRequired !== false,
      notes:          notes ?? null,
      responsibleRole: responsibleRole || null,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'ComplianceItem', entityId: item.id, req });
  return NextResponse.json(item, { status: 201 });
}
