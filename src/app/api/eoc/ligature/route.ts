import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.ligatureRiskItem.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: [{ riskLevel: 'asc' }, { identifiedDate: 'desc' }],
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    location, unit, itemDescription, riskLevel,
    identifiedDate, identifiedBy, mitigationPlan, targetDate, notes,
  } = body;

  if (!location || !itemDescription || !riskLevel || !identifiedDate || !identifiedBy) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  // Generate item number
  const year = new Date().getFullYear();
  const count = await prisma.ligatureRiskItem.count({
    where: { facilityId: session.user.facilityId },
  });
  const itemNumber = `LIG-${year}-${String(count + 1).padStart(3, '0')}`;

  const item = await prisma.ligatureRiskItem.create({
    data: {
      facilityId: session.user.facilityId,
      itemNumber,
      location,
      unit: unit ?? null,
      itemDescription,
      riskLevel,
      status: 'OPEN',
      identifiedDate: new Date(identifiedDate),
      identifiedBy,
      mitigationPlan: mitigationPlan ?? null,
      targetDate: targetDate ? new Date(targetDate) : null,
      notes: notes ?? null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
