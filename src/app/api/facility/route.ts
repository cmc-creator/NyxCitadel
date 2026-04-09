import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/facility - returns current user's facility
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const facility = await prisma.facility.findUnique({
    where: { id: session.user.facilityId },
  });

  if (!facility) return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
  return NextResponse.json(facility);
}

// PATCH /api/facility - update facility configuration
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only ADMIN / SUPER_ADMIN / COMPLIANCE_OFFICER may edit facility settings
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'COMPLIANCE_OFFICER'];
  if (!allowedRoles.includes(session.user.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();

  const {
    name,
    shortName,
    facilityType,
    bedCount,
    address,
    city,
    state,
    zip,
    phone,
    fax,
    npi,
    medicareId,
    medicaidId,
    jcAhcId,
    licenseNumber,
    licenseExpiry,
    primaryColor,
    secondaryColor,
    timezone,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Facility name is required.' }, { status: 400 });
  }

  const updated = await prisma.facility.update({
    where: { id: session.user.facilityId },
    data: {
      name:            name.trim(),
      shortName:       shortName?.trim() || null,
      facilityType:    facilityType   || undefined,
      bedCount:        bedCount != null ? parseInt(bedCount, 10) : null,
      address:         address?.trim()  || null,
      city:            city?.trim()     || null,
      state:           state?.trim()    || 'AZ',
      zip:             zip?.trim()      || null,
      phone:           phone?.trim()    || null,
      fax:             fax?.trim()      || null,
      npi:             npi?.trim()      || null,
      medicareId:      medicareId?.trim()  || null,
      medicaidId:      medicaidId?.trim()  || null,
      jcAhcId:         jcAhcId?.trim()    || null,
      licenseNumber:   licenseNumber?.trim() || null,
      licenseExpiry:   licenseExpiry ? new Date(licenseExpiry) : null,
      primaryColor:    primaryColor?.trim()   || '#0d7377',
      secondaryColor:  secondaryColor?.trim() || '#14a4a8',
      timezone:        timezone?.trim() || 'America/Phoenix',
    },
  });

  return NextResponse.json(updated);
}
