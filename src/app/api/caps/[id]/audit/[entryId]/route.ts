import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const entry = await prisma.capAuditEntry.findUnique({
    where: { id: params.entryId },
    select: { facilityId: true, auditorId: true, result: true },
  });

  if (!entry || entry.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
  if (entry.auditorId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.capAuditEntry.delete({ where: { id: params.entryId } });

  // If the deleted entry was a FAIL, decrement breaches
  if (entry.result === 'FAIL') {
    await prisma.correctiveActionPlan.update({
      where: { id: params.id },
      data: { vigilanceBreaches: { decrement: 1 } },
    });
  }

  return new NextResponse(null, { status: 204 });
}
