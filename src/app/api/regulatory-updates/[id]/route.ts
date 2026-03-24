import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/regulatory-updates/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const update = await prisma.regulatoryUpdate.findUnique({
    where: { id: params.id },
  });

  if (!update) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(update);
}

// PATCH /api/regulatory-updates/[id] - change urgency, toggle global/active
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role as string;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const update = await prisma.regulatoryUpdate.update({
    where: { id: params.id },
    data: {
      ...(body.isGlobal != null ? { isGlobal: body.isGlobal } : {}),
      ...(body.isActive != null ? { isActive: body.isActive } : {}),
      ...(body.urgency  != null ? { urgency:  body.urgency  } : {}),
    },
  });

  return NextResponse.json(update);
}

// DELETE /api/regulatory-updates/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role as string;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.regulatoryUpdate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}