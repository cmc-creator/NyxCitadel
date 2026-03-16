import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/drill-muster?drillId=xxx
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const drillId = req.nextUrl.searchParams.get('drillId');
  if (!drillId) return NextResponse.json({ error: 'drillId required' }, { status: 400 });

  const entries = await prisma.drillMusterEntry.findMany({
    where: { drillId, facilityId: session.user.facilityId },
    orderBy: [{ department: 'asc' }, { staffName: 'asc' }],
  });

  return NextResponse.json(entries);
}

// POST /api/drill-muster - add a staff member to the muster roster
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { drillId, staffName, staffRole, department, musterPoint } = body;

  if (!drillId || !staffName) {
    return NextResponse.json({ error: 'drillId and staffName required.' }, { status: 400 });
  }

  const drill = await prisma.drill.findFirst({
    where: { id: drillId, facilityId: session.user.facilityId },
  });
  if (!drill) return NextResponse.json({ error: 'Drill not found.' }, { status: 404 });

  const entry = await prisma.drillMusterEntry.create({
    data: {
      drillId,
      facilityId: session.user.facilityId,
      staffName,
      staffRole:   staffRole  ?? null,
      department:  department ?? null,
      musterPoint: musterPoint ?? null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}

// DELETE /api/drill-muster?id=xxx - remove a roster entry
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.drillMusterEntry.deleteMany({
    where: { id, facilityId: session.user.facilityId },
  });

  return NextResponse.json({ success: true });
}
