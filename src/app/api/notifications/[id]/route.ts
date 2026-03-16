import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/[id] - mark a single notification as read
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id as string;

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (notification.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { isRead: true, readAt: new Date() },
  });

  return NextResponse.json(updated);
}

// DELETE /api/notifications/[id] - delete a notification
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id as string;

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (notification.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.notification.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
