import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns';

export const dynamic = 'force-dynamic';

function monthLabel(d: Date) {
  const abbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${abbr[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

function countByMonth(items: Date[], months: { label: string; start: Date; end: Date }[]) {
  const map: Record<string, number> = {};
  for (const m of months) map[m.label] = 0;
  for (const d of items) {
    const lbl = monthLabel(d);
    if (lbl in map) map[lbl]++;
  }
  return map;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId;
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    return { label: monthLabel(d), start: startOfMonth(d), end: endOfMonth(d) };
  });
  const rangeStart = months[0].start;

  const [incidents, grievancesOpened, grievancesClosed, capsOpened, capsCompleted] = await Promise.all([
    prisma.incident.findMany({
      where: { facilityId, dateReported: { gte: rangeStart } },
      select: { dateReported: true },
    }),
    prisma.grievanceRecord.findMany({
      where: { facilityId, dateReceived: { gte: rangeStart } },
      select: { dateReceived: true },
    }),
    prisma.grievanceRecord.findMany({
      where: { facilityId, resolutionDate: { gte: rangeStart, not: null } },
      select: { resolutionDate: true },
    }),
    prisma.correctiveActionPlan.findMany({
      where: { facilityId, createdAt: { gte: rangeStart } },
      select: { createdAt: true },
    }),
    prisma.correctiveActionPlan.findMany({
      where: { facilityId, status: { in: ['COMPLETED', 'VERIFIED'] }, completedDate: { gte: rangeStart, not: null } },
      select: { completedDate: true },
    }),
  ]);

  const incidentCounts = countByMonth(incidents.map(i => i.dateReported), months);
  const grievanceOpenCounts = countByMonth(grievancesOpened.map(g => g.dateReceived), months);
  const grievanceClosedCounts = countByMonth(grievancesClosed.map(g => g.resolutionDate!), months);
  const capOpenCounts = countByMonth(capsOpened.map(c => c.createdAt), months);
  const capCompletedCounts = countByMonth(capsCompleted.map(c => c.completedDate!), months);

  return NextResponse.json({
    incidents: months.map(m => ({ month: m.label, count: incidentCounts[m.label] })),
    grievances: months.map(m => ({
      month: m.label,
      opened: grievanceOpenCounts[m.label],
      closed: grievanceClosedCounts[m.label],
    })),
    caps: months.map(m => ({
      month: m.label,
      opened: capOpenCounts[m.label],
      completed: capCompletedCounts[m.label],
    })),
  });
}
