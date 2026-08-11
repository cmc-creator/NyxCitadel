import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { getPolicyAckRequestEmail } from '@/lib/email-templates';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

// GET /api/policies/[id]/acknowledgments - list all ack records for this policy
export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const policy = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    select: { id: true },
  });
  if (!policy) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const acks = await prisma.policyAcknowledgment.findMany({
    where: { policyId: params.id },
    orderBy: { sentAt: 'desc' },
  });

  return NextResponse.json(acks);
}

// POST /api/policies/[id]/acknowledgments - send acknowledgment requests
// Body: { recipients: [{ name: string, email: string }] }
export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const policy = await prisma.policy.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!policy) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json() as { recipients: { name: string; email: string }[]; changeNote?: string };
  if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
  }
  if (body.recipients.length > 100) {
    return NextResponse.json({ error: 'Maximum 100 recipients per send' }, { status: 400 });
  }

  const facility = await prisma.facility.findUnique({
    where: { id: session.user.facilityId },
    select: { name: true },
  });
  const appBase = process.env.APP_URL ?? 'https://nyxcitadel.com';
  const sentBy = session.user.name ?? session.user.email ?? 'Compliance Staff';

  const created: string[] = [];
  for (const r of body.recipients) {
    if (!r.email || !r.name) continue;
    const ack = await prisma.policyAcknowledgment.create({
      data: {
        facilityId: session.user.facilityId,
        policyId: params.id,
        staffName: r.name.trim(),
        staffEmail: r.email.trim().toLowerCase(),
        sentBy,
      },
    });
    created.push(ack.id);
    const ackUrl = `${appBase}/ack/${ack.token}`;
    const emailData = getPolicyAckRequestEmail({
      facilityName: facility?.name ?? 'Your Facility',
      policyTitle: policy.title,
      policyNumber: policy.policyNumber,
      version: policy.version,
      changeNote: body.changeNote,
      sentBy,
      ackUrl,
    });
    sendEmail({ to: r.email.trim(), subject: emailData.subject, html: emailData.html }).catch(() => {});
  }

  await logAudit({
    userId: session.user.id,
    action: 'SEND_POLICY_ACK_REQUESTS',
    entityType: 'Policy',
    entityId: params.id,
    changes: { sent: created.length, policyTitle: policy.title },
    req,
  });

  return NextResponse.json({ sent: created.length });
}
