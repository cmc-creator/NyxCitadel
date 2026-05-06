import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const recordType = searchParams.get('recordType');
  const recordId   = searchParams.get('recordId');

  if (!recordType || !recordId) {
    return NextResponse.json({ error: 'recordType and recordId are required.' }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { recordType, recordId },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { recordType?: string; recordId?: string; body?: string };
  const { recordType, recordId, body: commentBody } = body;

  if (!recordType || !recordId || !commentBody?.trim()) {
    return NextResponse.json({ error: 'recordType, recordId, and body are required.' }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      recordType,
      recordId,
      body: commentBody.trim(),
      authorId: session.user.id,
    },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(comment, { status: 201 });
}
