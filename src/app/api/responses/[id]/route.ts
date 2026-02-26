import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const response = await prisma.generatedResponse.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: { template: true },
  });
  if (!response) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(response);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const response = await prisma.generatedResponse.updateMany({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.subject !== undefined && { subject: body.subject }),
      ...(body.body !== undefined && { body: body.body }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.recipientName !== undefined && { recipientName: body.recipientName }),
      ...(body.recipientRole !== undefined && { recipientRole: body.recipientRole }),
      ...(body.recipientAddress !== undefined && { recipientAddress: body.recipientAddress }),
      ...(body.sentDate !== undefined && { sentDate: body.sentDate ? new Date(body.sentDate) : null }),
      ...(body.sentBy !== undefined && { sentBy: body.sentBy }),
      ...(body.reviewedBy !== undefined && { reviewedBy: body.reviewedBy }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(response);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.generatedResponse.deleteMany({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  return NextResponse.json({ success: true });
}
