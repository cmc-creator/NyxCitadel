import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getTrainingAssignmentEmail } from '@/lib/email-templates';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

// POST /api/training/assign
// Body: { staffName, staffEmail, department?, jobTitle?, trainingName, category, isRequired?, expiryDate?, reason?, notes? }
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { staffName, staffEmail, trainingName, category } = body;

  if (!staffName?.trim()) return NextResponse.json({ error: 'staffName is required' }, { status: 400 });
  if (!staffEmail?.trim()) return NextResponse.json({ error: 'staffEmail is required' }, { status: 400 });
  if (!trainingName?.trim()) return NextResponse.json({ error: 'trainingName is required' }, { status: 400 });
  if (!category) return NextResponse.json({ error: 'category is required' }, { status: 400 });

  const facility = await prisma.facility.findUnique({
    where: { id: session.user.facilityId },
    select: { name: true },
  });

  const appBase = process.env.APP_URL ?? 'https://nyxcitadel.com';
  const assignedBy = session.user.name ?? session.user.email ?? 'Compliance Staff';

  const completionToken = randomUUID();

  const record = await prisma.trainingRecord.create({
    data: {
      facilityId: session.user.facilityId,
      staffName: staffName.trim(),
      staffEmail: staffEmail.trim().toLowerCase(),
      completionToken,
      department: body.department?.trim() || null,
      jobTitle: body.jobTitle?.trim() || null,
      trainingName: trainingName.trim(),
      category: category as never,
      isRequired: body.isRequired !== false,
      status: 'PENDING',
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      assignedBy,
      assignedReason: body.reason?.trim() || null,
      notes: body.notes?.trim() || null,
    },
  });

  const completionUrl = `${appBase}/training-complete/${record.completionToken}`;
  const emailData = getTrainingAssignmentEmail({
    facilityName: facility?.name ?? 'Your Facility',
    staffName: staffName.trim(),
    trainingName: trainingName.trim(),
    category,
    assignedBy,
    reason: body.reason?.trim(),
    completionUrl,
    expiryDate: body.expiryDate
      ? new Date(body.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : undefined,
  });

  sendEmail({ to: staffEmail.trim(), subject: emailData.subject, html: emailData.html }).catch(() => {});

  await logAudit({
    userId: session.user.id,
    action: 'ASSIGN_TRAINING',
    entityType: 'TrainingRecord',
    entityId: record.id,
    changes: { staffName: staffName.trim(), trainingName: trainingName.trim(), category },
    req,
  });

  return NextResponse.json(record, { status: 201 });
}
