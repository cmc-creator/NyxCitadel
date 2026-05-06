import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const comment = await prisma.comment.findUnique({ where: { id: params.id } });
  if (!comment) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const isOwn  = comment.authorId === session.user.id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);

  if (!isOwn && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
