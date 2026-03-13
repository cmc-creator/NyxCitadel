import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addMonths, subMonths } from 'date-fns';
import CalendarView from './CalendarView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Compliance Calendar' };

export default async function CalendarPage() {
  const session = await auth();
  const facilityId = (session?.user as { facilityId?: string })?.facilityId;
  if (!facilityId) return null;

  const start = subMonths(new Date(), 3);
  const end   = addMonths(new Date(), 18);

  const events = await prisma.calendarEvent.findMany({
    where: {
      facilityId,
      dueDate: { gte: start, lte: end },
    },
    orderBy: { dueDate: 'asc' },
  });

  const serialized = events.map(e => ({
    id:            e.id,
    title:         e.title,
    description:   e.description,
    dueDate:       e.dueDate.toISOString(),
    completedDate: e.completedDate?.toISOString() ?? null,
    category:      e.category,
    regulatoryBody: e.regulatoryBody,
    priority:      e.priority as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    status:        e.status as 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'WAIVED' | 'NA',
    notes:         e.notes,
    documentUrl:   e.documentUrl,
  }));

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto">
      <CalendarView initialEvents={serialized} />
    </div>
  );
}