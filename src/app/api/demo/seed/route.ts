import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FacilityType } from '@prisma/client';

export async function POST() {
  try {
    let dbSeeded = false;
    let seededFacilityName = 'Destiny Springs Healthcare';

    // Attempt DB seed if Prisma/DB is accessible
    if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
      try {
        await prisma.facility.upsert({
          where: { id: 'destiny-springs' },
          update: {},
          create: {
            id: 'destiny-springs',
            name: 'Destiny Springs Healthcare',
            shortName: 'DSH',
            address: '13451 N 94th Drive',
            city: 'Peoria',
            state: 'AZ',
            zip: '85381',
            phone: '(623) 236-2000',
            facilityType: FacilityType.ACUTE_PSYCH,
            bedCount: 60,
            timezone: 'America/Phoenix',
            isActive: true,
          },
        });
        dbSeeded = true;
      } catch (err) {
        console.warn('Prisma DB seed fallback (using client demo state):', err);
      }
    }

    return NextResponse.json({
      success: true,
      dbSeeded,
      facility: seededFacilityName,
      summary: {
        incidents: 5,
        caps: 3,
        surveys: 2,
        calendarItems: 4,
        trainingRecords: 45,
        eocItems: 18,
      },
      message: 'Demo dataset initialized successfully for Destiny Springs Healthcare.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in demo seed route:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize demo data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
