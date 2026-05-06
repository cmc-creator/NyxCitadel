import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type Ctx = { params: { token: string } };

// POST /api/policies/ack/[token] — record acknowledgment (no auth required)
export async function POST(req: NextRequest, { params }: Ctx) {
  const ack = await prisma.policyAcknowledgment.findUnique({
    where: { token: params.token },
    include: { policy: { select: { title: true, policyNumber: true } } },
  });

  if (!ack) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  if (ack.acknowledgedAt) {
    return NextResponse.json({ alreadyAcknowledged: true, acknowledgedAt: ack.acknowledgedAt });
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown';
  const updated = await prisma.policyAcknowledgment.update({
    where: { token: params.token },
    data: {
      acknowledgedAt: new Date(),
      acknowledgedIp: ip.split(',')[0].trim(),
    },
  });

  return NextResponse.json({
    success: true,
    staffName: updated.staffName,
    policyTitle: ack.policy.title,
    acknowledgedAt: updated.acknowledgedAt,
  });
}

// GET /api/policies/ack/[token] — fetch ack context for the public page
export async function GET(_req: NextRequest, { params }: Ctx) {
  const ack = await prisma.policyAcknowledgment.findUnique({
    where: { token: params.token },
    include: {
      policy: {
        select: {
          title: true,
          policyNumber: true,
          version: true,
          summary: true,
          documentUrl: true,
        },
      },
    },
  });

  if (!ack) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });

  // Look up facility name
  const facility = await prisma.facility.findUnique({
    where: { id: ack.facilityId },
    select: { name: true },
  });

  return NextResponse.json({
    staffName: ack.staffName,
    facilityName: facility?.name ?? 'Your Facility',
    policy: ack.policy,
    sentAt: ack.sentAt,
    sentBy: ack.sentBy,
    alreadyAcknowledged: !!ack.acknowledgedAt,
    acknowledgedAt: ack.acknowledgedAt,
  });
}
