import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const template = await prisma.responseTemplate.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(template);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const template = await prisma.responseTemplate.updateMany({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.subject !== undefined && { subject: body.subject }),
      ...(body.bodyTemplate !== undefined && { bodyTemplate: body.bodyTemplate }),
      ...(body.variables !== undefined && { variables: body.variables }),
      ...(body.regulatoryRef !== undefined && { regulatoryRef: body.regulatoryRef }),
      ...(body.daysRequired !== undefined && { daysRequired: body.daysRequired }),
      ...(body.instructions !== undefined && { instructions: body.instructions }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return NextResponse.json(template);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.responseTemplate.updateMany({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: { isActive: false },
  });
  return NextResponse.json({ success: true });
}
