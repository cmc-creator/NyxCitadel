import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getPolicyAmendedEmail } from '@/lib/email-templates';

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const policy = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!policy) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(policy);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Verify ownership
  const existing = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Version control: if changeNote provided, increment version and append history
  let newVersion = existing.version;
  let newRevisionHistory = (existing.revisionHistory ?? []) as Array<{ version: string; date: string; changedBy: string; summary: string }>;

  if (body.changeNote) {
    newVersion = existing.version + 1;
    newRevisionHistory = [
      ...newRevisionHistory,
      {
        version: newVersion.toString(),
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        changedBy: session.user.name ?? session.user.email ?? 'Unknown',
        summary: body.changeNote,
      },
    ];
  }

  const policy = await prisma.policy.update({
    where: { id: params.id },
    data: {
      ...(body.title           !== undefined && { title:           body.title }),
      ...(body.category        !== undefined && { category:        body.category as never }),
      version:         newVersion,
      revisionHistory: newRevisionHistory,
      ...(body.policyNumber    !== undefined && { policyNumber:    body.policyNumber }),
      ...(body.effectiveDate   !== undefined && { effectiveDate:   new Date(body.effectiveDate) }),
      ...(body.nextReviewDate  !== undefined && { nextReviewDate:  new Date(body.nextReviewDate) }),
      ...(body.reviewFrequency !== undefined && { reviewFrequency: body.reviewFrequency as never }),
      ...(body.owner           !== undefined && { owner:           body.owner }),
      ...(body.standardRef     !== undefined && { standardRef:     body.standardRef }),
      ...(body.summary         !== undefined && { summary:         body.summary }),
      ...(body.documentUrl     !== undefined && { documentUrl:     body.documentUrl }),
      ...(body.regulatoryBodies!== undefined && { regulatoryBody:  body.regulatoryBodies }),
      ...(body.status          !== undefined && { status:          body.status as never }),
      ...(body.lastReviewedDate!== undefined && { lastReviewedDate: new Date(body.lastReviewedDate) }),
    },
  });

  // Email facility admins when a policy is formally amended (changeNote provided)
  if (body.changeNote) {
    try {
      const [admins, facility] = await Promise.all([
        prisma.user.findMany({
          where: { facilityId: session.user.facilityId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
          select: { email: true, name: true },
        }),
        prisma.facility.findUnique({ where: { id: session.user.facilityId }, select: { name: true } }),
      ]);
      for (const admin of admins) {
        if (admin.email) {
          const emailData = getPolicyAmendedEmail({
            facilityName: facility?.name ?? 'Your Facility',
            policyTitle: policy.title,
            policyNumber: policy.policyNumber ?? '',
            newVersion,
            changedBy: session.user.name ?? session.user.email ?? 'Staff',
            changeNote: body.changeNote,
            effectiveDate: policy.effectiveDate
              ? policy.effectiveDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : undefined,
            nextReviewDate: policy.nextReviewDate
              ? policy.nextReviewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : undefined,
          });
          sendEmail({ to: admin.email, subject: emailData.subject, html: emailData.html }).catch(() => {});
        }
      }
    } catch {
      // Non-fatal — policy was saved
    }
  }

  return NextResponse.json(policy);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const existing = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.policy.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
