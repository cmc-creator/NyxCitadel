import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  result: z.enum(['PASS', 'FAIL', 'NEEDS_IMPROVEMENT']),
  notes: z.string().optional(),
  auditDate: z.string().optional(),
  nextAuditDate: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const entries = await prisma.capAuditEntry.findMany({
    where: { capId: params.id, facilityId: session.user.facilityId },
    include: { auditor: { select: { name: true, email: true } } },
    orderBy: { auditDate: 'desc' },
  });

  return NextResponse.json(entries);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cap = await prisma.correctiveActionPlan.findUnique({
    where: { id: params.id },
    select: { facilityId: true },
  });
  if (!cap || cap.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const entry = await prisma.capAuditEntry.create({
    data: {
      capId: params.id,
      facilityId: session.user.facilityId,
      auditorId: session.user.id,
      result: parsed.data.result,
      notes: parsed.data.notes,
      auditDate: parsed.data.auditDate ? new Date(parsed.data.auditDate) : new Date(),
      nextAuditDate: parsed.data.nextAuditDate ? new Date(parsed.data.nextAuditDate) : null,
    },
    include: { auditor: { select: { name: true, email: true } } },
  });

  // If there's a FAIL, bump vigilanceBreaches count
  if (parsed.data.result === 'FAIL') {
    await prisma.correctiveActionPlan.update({
      where: { id: params.id },
      data: { vigilanceBreaches: { increment: 1 }, vigilanceStatus: 'BREACH' },
    });
  }

  return NextResponse.json(entry, { status: 201 });
}
