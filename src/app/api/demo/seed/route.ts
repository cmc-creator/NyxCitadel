import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { FacilityType } from '@prisma/client';

export async function POST() {
  try {
    let dbSeeded = false;
    let seededFacilityName = 'Riverside General Hospital';

    // Attempt DB seed if Prisma/DB is accessible
    if (process.env.POSTGRES_URL || process.env.DATABASE_URL) {
      try {
        await prisma.facility.upsert({
          where: { id: 'riverside-general' },
          update: {},
          create: {
            id: 'riverside-general',
            name: 'Riverside General Hospital',
            shortName: 'RGH',
            address: '1200 W Demo Parkway',
            city: 'Riverside',
            state: 'AZ',
            zip: '85000',
            phone: '(602) 555-0100',
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
      message: 'Demo dataset initialized successfully for Riverside General Hospital.',
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
