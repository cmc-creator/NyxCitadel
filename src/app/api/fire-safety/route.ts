import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const facilityId = session.user.facilityId;

    const [allDrills, trackerItems] = await Promise.all([
      prisma.drill.findMany({
        where: { facilityId, drillType: 'FIRE_EVACUATION' },
        orderBy: { scheduledDate: 'desc' },
        take: 100,
      }),
      prisma.trackerItem.findMany({
        where: {
          facilityId,
          category: 'LIFE_SAFETY'
        },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    const currentYear = new Date().getFullYear();
    const yearDrills = allDrills.filter(d => new Date(d.scheduledDate).getFullYear() === currentYear);
    const completedDrills = yearDrills.filter(d => d.status === 'COMPLETED').length;

    const inspectionsDue = trackerItems.filter(t => !t.completedDate && t.dueDate != null && t.dueDate < new Date()).length;

    // Calculate compliance score (0-100)
    let score = 100;
    if (completedDrills < 12) score -= (12 - completedDrills) * 5;
    if (inspectionsDue > 0) score -= inspectionsDue * 3;
    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      firedrillsThisYear: completedDrills,
      lastDrillDate: allDrills[0]?.conductedDate || allDrills[0]?.scheduledDate,
      inspectionsDue,
      staffTrained: 85, // TODO: calculate from TrainingRecord
      complianceScore: score,
      recentDrills: allDrills.slice(0, 5).map(d => ({
        id: d.id,
        drillName: d.drillName,
        scheduledDate: d.scheduledDate,
        conductedDate: d.conductedDate,
        status: d.status,
      })),
      inspections: trackerItems.slice(0, 5).map(t => ({
        id: t.id,
        category: t.category,
        dueDate: t.dueDate,
        completed: !!t.completedDate,
      })),
    });
  } catch (error) {
    console.error('Fire safety API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
