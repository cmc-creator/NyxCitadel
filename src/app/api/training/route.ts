import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.trainingRecord.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    staffName,
    staffId,
    department,
    jobTitle,
    trainingName,
    category,
    status,
    completedDate,
    expiryDate,
    isRequired,
    score,
    passingScore,
    provider,
    notes,
    regulatoryBody,
  } = body;

  if (!staffName || !trainingName || !category) {
    return NextResponse.json(
      { error: 'Missing required fields: staffName, trainingName, category.' },
      { status: 400 }
    );
  }

  const record = await prisma.trainingRecord.create({
    data: {
      facilityId:    session.user.facilityId,
      staffName,
      staffId:       staffId ?? null,
      department:    department ?? null,
      jobTitle:      jobTitle ?? null,
      trainingName,
      category,
      status:        status ?? 'PENDING',
      completedDate: completedDate ? new Date(completedDate) : null,
      expiryDate:    expiryDate ? new Date(expiryDate) : null,
      isRequired:    isRequired !== false,
      score:         score != null ? Number(score) : null,
      passingScore:  passingScore != null ? Number(passingScore) : null,
      provider:      provider ?? null,
      notes:         notes ?? null,
      regulatoryBody: regulatoryBody || null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
