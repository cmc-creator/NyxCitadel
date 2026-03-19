import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.dischargePlan.findUnique({ where: { id: params.id } });
  if (!plan || plan.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(plan);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.dischargePlan.findUnique({ where: { id: params.id } });
  if (!plan || plan.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const dateFields = ['admitDate','assessmentStartDate','estimatedDischargeDate','actualDischargeDate',
                      'moonIssuedDate','followUpCall1Date','followUpCall2Date'];
  const data: Record<string, unknown> = { ...body };
  for (const f of dateFields) {
    if (data[f]) data[f] = new Date(data[f] as string);
  }

  const updated = await prisma.dischargePlan.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = await prisma.dischargePlan.findUnique({ where: { id: params.id } });
  if (!plan || plan.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.dischargePlan.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
