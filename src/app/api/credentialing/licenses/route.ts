import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // All licenses for providers belonging to this facility
  const records = await prisma.providerLicense.findMany({
    where: { provider: { facilityId: session.user.facilityId } },
    include: { provider: { select: { firstName: true, lastName: true, credentials: true, specialty: true } } },
    orderBy: { expiryDate: 'asc' },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Verify the provider belongs to this facility
  const provider = await prisma.provider.findFirst({
    where: { id: body.providerId, facilityId: session.user.facilityId },
  });
  if (!provider) return NextResponse.json({ error: 'Provider not found' }, { status: 404 });

  const record = await prisma.providerLicense.create({ data: body });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'ProviderLicense', entityId: record.id, req });
  return NextResponse.json(record, { status: 201 });
}
