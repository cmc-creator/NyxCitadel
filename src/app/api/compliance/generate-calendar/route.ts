import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateComplianceCalendar } from '@/lib/compliance/arizona';

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facilityId = session.user.facilityId;
  const url = new URL(req.url);
  const year = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear() + 1));

  // Generate suggested events
  const suggested = generateComplianceCalendar(facilityId, year);

  // Check existing events for this year to avoid duplicates
  const existing = await prisma.calendarEvent.findMany({
    where: {
      facilityId,
      dueDate: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });

  const existingTitles = new Set(
    existing.map((e) => `${e.title}_${e.dueDate.toISOString().slice(0, 7)}`)
  );

  // Filter out duplicates (same title, same month)
  const newEvents = suggested.filter((e) => {
    const key = `${e.title}_${e.dueDate.toISOString().slice(0, 7)}`;
    return !existingTitles.has(key);
  });

  if (newEvents.length === 0) {
    return NextResponse.json({
      message: `Calendar for ${year} is already up to date.`,
      created: 0,
    });
  }

  // Bulk insert
  const created = await prisma.calendarEvent.createMany({
    data: newEvents.map((e) => ({
      ...e,
      status: 'UPCOMING' as const,
      remindDaysBefore: [90, 60, 30, 14, 7],
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({
    message: `Generated ${created.count} compliance events for ${year}.`,
    created: created.count,
    year,
  });
}
