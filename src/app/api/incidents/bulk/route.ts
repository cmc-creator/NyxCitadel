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

  const owned = await prisma.incident.findMany({
    where: { id: { in: ids }, facilityId: session.user.facilityId },
    select: { id: true, incidentNumber: true, description: true, status: true, severity: true, incidentType: true, dateOccurred: true },
  });
  const ownedIds = owned.map(i => i.id);

  if (action === 'export') {
    const header = 'Incident Number,Description,Status,Severity,Type,Date Occurred';
    const rows = owned.map(i =>
      `"${i.incidentNumber}","${(i.description ?? '').replace(/"/g, '""')}","${i.status}","${i.severity}","${i.incidentType}","${i.dateOccurred?.toLocaleDateString() ?? ''}"`
    );
    return NextResponse.json({ csv: [header, ...rows].join('\n') });
  }

  if (action === 'close') {
    const result = await prisma.incident.updateMany({
      where: { id: { in: ownedIds } },
      data: { status: 'CLOSED' },
    });
    await logAudit({ userId: session.user.id, action: 'BULK_CLOSE_INCIDENT', entityType: 'Incident', entityId: ownedIds.join(','), req });
    return NextResponse.json({ updated: result.count });
  }

  if (action === 'delete') {
    const result = await prisma.incident.deleteMany({ where: { id: { in: ownedIds } } });
    await logAudit({ userId: session.user.id, action: 'BULK_DELETE_INCIDENT', entityType: 'Incident', entityId: ownedIds.join(','), req });
    return NextResponse.json({ updated: result.count });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
