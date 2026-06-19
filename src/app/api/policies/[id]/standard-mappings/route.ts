import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mappings = await prisma.policyStandardMapping.findMany({
    where: { policyId: params.id, facilityId: session.user.facilityId },
    orderBy: [{ framework: 'asc' }, { standardRef: 'asc' }],
  });

  return NextResponse.json({ mappings });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { framework, standardRef, standardTitle, aiSuggested } = body;

  if (!framework || !standardRef) {
    return NextResponse.json({ error: 'framework and standardRef are required' }, { status: 400 });
  }

  const mapping = await prisma.policyStandardMapping.upsert({
    where: {
      policyId_framework_standardRef: {
        policyId: params.id,
        framework,
        standardRef,
      },
    },
    create: {
      facilityId: session.user.facilityId,
      policyId: params.id,
      framework,
      standardRef,
      standardTitle: standardTitle ?? null,
      aiSuggested: aiSuggested ?? false,
    },
    update: {
      standardTitle: standardTitle ?? undefined,
    },
  });

  return NextResponse.json({ mapping }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { mappingId } = body;

  if (!mappingId) {
    return NextResponse.json({ error: 'mappingId is required' }, { status: 400 });
  }

  await prisma.policyStandardMapping.deleteMany({
    where: {
      id: mappingId,
      policyId: params.id,
      facilityId: session.user.facilityId,
    },
  });

  return NextResponse.json({ ok: true });
}
