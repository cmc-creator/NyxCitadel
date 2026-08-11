import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Ctx = { params: { token: string } };

// GET - fetch training details for the public completion page
export async function GET(_req: NextRequest, { params }: Ctx) {
  const record = await prisma.trainingRecord.findUnique({
    where: { completionToken: params.token },
    select: {
      id: true,
      staffName: true,
      trainingName: true,
      category: true,
      assignedBy: true,
      assignedReason: true,
      expiryDate: true,
      status: true,
      completedDate: true,
      facilityId: true,
    },
  });

  if (!record) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });

  const facility = await prisma.facility.findUnique({
    where: { id: record.facilityId },
    select: { name: true },
  });

  return NextResponse.json({ ...record, facilityName: facility?.name ?? 'Your Facility' });
}

// POST - record completion
// Body: { completedDate?: string, score?: number, notes?: string }
export async function POST(req: NextRequest, { params }: Ctx) {
  const record = await prisma.trainingRecord.findUnique({
    where: { completionToken: params.token },
    select: { id: true, status: true, staffName: true, trainingName: true },
  });

  if (!record) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  if (record.status === 'COMPLETED') {
    return NextResponse.json({ alreadyCompleted: true });
  }

  const body = await req.json() as { completedDate?: string; score?: number; notes?: string };
  const completedDate = body.completedDate ? new Date(body.completedDate) : new Date();

  const updated = await prisma.trainingRecord.update({
    where: { id: record.id },
    data: {
      status: 'COMPLETED',
      completedDate,
      score: body.score ?? null,
      notes: body.notes?.trim() || null,
    },
  });

  return NextResponse.json({
    success: true,
    staffName: record.staffName,
    trainingName: record.trainingName,
    completedDate: updated.completedDate,
  });
}
