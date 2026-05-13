import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/regulatory-updates/[id]/ack
// Marks an update as acknowledged by the current user (upsert — safe to call multiple times).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const update = await prisma.regulatoryUpdate.findUnique({
    where: { id: params.id },
    select: { id: true },
  });
  if (!update) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let notes: string | undefined;
  try {
    const body = await req.json();
    notes = typeof body.notes === 'string' ? body.notes.trim() || undefined : undefined;
  } catch {
    // no body is fine
  }

  const ack = await prisma.regulatoryUpdateAck.upsert({
    where: { updateId_userId: { updateId: params.id, userId: session.user.id } },
    create: { updateId: params.id, userId: session.user.id, notes: notes ?? null },
    update: { ackedAt: new Date(), notes: notes ?? null },
  });

  return NextResponse.json(ack);
}

// DELETE /api/regulatory-updates/[id]/ack — unacknowledge (admin / undo)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.regulatoryUpdateAck.deleteMany({
    where: { updateId: params.id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
