import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids, action } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No IDs provided.' }, { status: 400 });
  }

  // Verify all IDs belong to this facility
  const owned = await prisma.correctiveActionPlan.findMany({
    where: { id: { in: ids }, facilityId: session.user.facilityId },
    select: { id: true, capNumber: true, title: true, status: true, priority: true, targetDate: true, source: true },
  });
  const ownedIds = owned.map(c => c.id);

  if (action === 'export') {
    const header = 'CAP Number,Title,Status,Priority,Source,Target Date';
    const rows = owned.map(c =>
      `"${c.capNumber}","${c.title}","${c.status}","${c.priority}","${c.source}","${c.targetDate?.toLocaleDateString() ?? ''}"`
    );
    return NextResponse.json({ csv: [header, ...rows].join('\n') });
  }

  if (action === 'close' || action === 'complete') {
    const result = await prisma.correctiveActionPlan.updateMany({
      where: { id: { in: ownedIds } },
      data: { status: 'COMPLETED' },
    });
    await logAudit({ userId: session.user.id, action: 'BULK_COMPLETE_CAP', entityType: 'CorrectiveActionPlan', entityId: ownedIds.join(','), req });
    return NextResponse.json({ updated: result.count });
  }

  if (action === 'delete') {
    const result = await prisma.correctiveActionPlan.deleteMany({
      where: { id: { in: ownedIds } },
    });
    await logAudit({ userId: session.user.id, action: 'BULK_DELETE_CAP', entityType: 'CorrectiveActionPlan', entityId: ownedIds.join(','), req });
    return NextResponse.json({ updated: result.count });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
