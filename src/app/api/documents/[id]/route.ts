import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await prisma.document.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId, deletedAt: null },
  });

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.document.update({
    where: { id: params.id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
