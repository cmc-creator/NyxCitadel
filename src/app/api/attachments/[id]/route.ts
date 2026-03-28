import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const attachment = await prisma.attachment.findUnique({ where: { id: params.id } });

  if (!attachment || attachment.facilityId !== session.user.facilityId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.attachment.delete({ where: { id: params.id } });

  await logAudit({
    userId: session.user.id,
    action: 'DELETE_ATTACHMENT',
    entityType: 'Attachment',
    entityId: params.id,
    changes: { fileName: attachment.fileName, sourceType: attachment.sourceType, sourceId: attachment.sourceId },
    req: _req,
  });

  return NextResponse.json({ ok: true });
}
