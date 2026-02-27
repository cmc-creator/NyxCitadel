import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const documents = await prisma.document.findMany({
    where: {
      facilityId: session.user.facilityId,
      ...(category ? { category } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const doc = await prisma.document.create({
    data: {
      facilityId:  session.user.facilityId,
      name:        body.name,
      description: body.description ?? null,
      category:    body.category,
      fileUrl:     body.fileUrl,
      fileSize:    body.fileSize ?? null,
      mimeType:    body.mimeType ?? null,
      uploadedBy:  session.user.name ?? session.user.email ?? null,
      expiryDate:  body.expiryDate ? new Date(body.expiryDate) : null,
      tags:        body.tags ?? [],
    },
  });
  return NextResponse.json(doc, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
