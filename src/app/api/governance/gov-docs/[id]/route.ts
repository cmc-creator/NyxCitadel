import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await prisma.governanceDocument.findUnique({ where: { id: params.id } });
  if (!doc || doc.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(doc);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await prisma.governanceDocument.findUnique({ where: { id: params.id } });
  if (!doc || doc.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = { ...body };
  if (data.effectiveDate) data.effectiveDate = new Date(data.effectiveDate as string);
  if (data.reviewDate)    data.reviewDate    = new Date(data.reviewDate as string);

  const updated = await prisma.governanceDocument.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await prisma.governanceDocument.findUnique({ where: { id: params.id } });
  if (!doc || doc.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.governanceDocument.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
