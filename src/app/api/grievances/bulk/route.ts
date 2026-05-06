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

  const owned = await prisma.grievanceRecord.findMany({
    where: { id: { in: ids }, facilityId: session.user.facilityId },
    select: { id: true, grievanceNumber: true, complainantName: true, status: true, category: true, severity: true, dateReceived: true },
  });
  const ownedIds = owned.map(g => g.id);

  if (action === 'export') {
    const header = 'Grievance Number,Complainant,Status,Category,Severity,Date Received';
    const rows = owned.map(g =>
      `"${g.grievanceNumber}","${g.complainantName}","${g.status}","${g.category}","${g.severity}","${g.dateReceived?.toLocaleDateString() ?? ''}"`
    );
    return NextResponse.json({ csv: [header, ...rows].join('\n') });
  }

  if (action === 'close') {
    const result = await prisma.grievanceRecord.updateMany({
      where: { id: { in: ownedIds } },
      data: { status: 'CLOSED' },
    });
    await logAudit({ userId: session.user.id, action: 'BULK_CLOSE_GRIEVANCE', entityType: 'GrievanceRecord', entityId: ownedIds.join(','), req });
    return NextResponse.json({ updated: result.count });
  }

  if (action === 'delete') {
    const result = await prisma.grievanceRecord.deleteMany({ where: { id: { in: ownedIds } } });
    await logAudit({ userId: session.user.id, action: 'BULK_DELETE_GRIEVANCE', entityType: 'GrievanceRecord', entityId: ownedIds.join(','), req });
    return NextResponse.json({ updated: result.count });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
