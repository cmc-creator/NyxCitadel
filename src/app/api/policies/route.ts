import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function generatePolicyNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `POL-${year}-${rand}`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const policies = await prisma.policy.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { nextReviewDate: 'asc' },
  });
  return NextResponse.json(policies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    title,
    category,
    version,
    effectiveDate,
    nextReviewDate,
    owner,
    summary,
    documentUrl,
  } = body;

  if (!title || !category || !effectiveDate || !nextReviewDate) {
    return NextResponse.json({ error: 'Missing required fields: title, category, effectiveDate, nextReviewDate.' }, { status: 400 });
  }

  const policy = await prisma.policy.create({
    data: {
      facilityId:     session.user.facilityId,
      policyNumber:   generatePolicyNumber(),
      title,
      category,
      version:        version ?? '1.0',
      status:         'DRAFT',
      effectiveDate:  new Date(effectiveDate),
      nextReviewDate: new Date(nextReviewDate),
      owner:          owner ?? null,
      summary:        summary ?? null,
      documentUrl:    documentUrl ?? null,
    },
  });

  // Auto-create a calendar reminder for the policy review date
  try {
    await prisma.calendarEvent.create({
      data: {
        facilityId:     session.user.facilityId,
        title:          `Policy Review Due: ${title}`,
        category:       'OTHER',
        dueDate:        new Date(nextReviewDate),
        priority:       'MEDIUM',
        notes:          `Auto-created for policy ${policy.policyNumber}. Annual review required.`,
        status:         'UPCOMING',
      },
    });
  } catch {
    // Non-fatal — policy was saved, calendar reminder failed silently
  }

  return NextResponse.json(policy, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing policy id.' }, { status: 400 });

  // Verify ownership
  const existing = await prisma.policy.findUnique({ where: { id } });
  if (!existing || existing.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const policy = await prisma.policy.update({
    where: { id },
    data: {
      ...updates,
      ...(updates.effectiveDate  ? { effectiveDate:  new Date(updates.effectiveDate)  } : {}),
      ...(updates.nextReviewDate ? { nextReviewDate: new Date(updates.nextReviewDate) } : {}),
    },
  });

  // If nextReviewDate was updated, create a new calendar event
  if (updates.nextReviewDate) {
    try {
      await prisma.calendarEvent.create({
        data: {
          facilityId: session.user.facilityId,
          title:      `Policy Review Due: ${policy.title}`,
          category:   'OTHER',
          dueDate:    new Date(updates.nextReviewDate),
          priority:   'MEDIUM',
          notes:      `Review date updated for ${policy.policyNumber}.`,
          status:     'UPCOMING',
        },
      });
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json(policy);
}
