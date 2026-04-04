import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const Schema = z.object({
  submissionType: z.enum([
    'ORYX_HBIPS', 'NHSN_HAI', 'CMS_HCAHPS', 'ADHS_IR_IAD',
    'CMS_RESTRAINT_DEATH', 'JC_SENTINEL_EVENT', 'CMS_CONDITION_OF_PARTICIPATION',
  ]),
  reportingPeriod: z.string().min(1),
  status: z.enum(['DRAFT', 'READY', 'SUBMITTED', 'ACKNOWLEDGED', 'REJECTED', 'OVERDUE']).default('DRAFT'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body   = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  const { submissionType, reportingPeriod, status, dueDate, notes, data } = parsed.data;

  const submission = await prisma.regulatorySubmission.create({
    data: {
      facilityId: session.user.facilityId,
      submissionType,
      reportingPeriod,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      data: data as object ?? undefined,
    },
  });

  return NextResponse.json(submission, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  const submissions = await prisma.regulatorySubmission.findMany({
    where: {
      facilityId: session.user.facilityId,
      ...(type ? { submissionType: type as 'ORYX_HBIPS' | 'NHSN_HAI' | 'CMS_HCAHPS' | 'ADHS_IR_IAD' | 'CMS_RESTRAINT_DEATH' | 'JC_SENTINEL_EVENT' | 'CMS_CONDITION_OF_PARTICIPATION' } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(submissions);
}
