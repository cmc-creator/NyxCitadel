import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plans = await prisma.dischargePlan.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const {
    patientInitials,
    patientMrn,
    admitDate,
    unit,
    assessmentStartDate,
    assessmentBy,
    expectedDisposition,
    estimatedDischargeDate,
    insuranceAuth,
    primaryDx,
    careCoordinator,
    familyInvolved,
    barrierNotes,
    moonRequired,
    referralsSent,
    notes,
  } = body;

  if (!patientInitials || !admitDate || !unit || !expectedDisposition || !primaryDx) {
    return NextResponse.json(
      { error: 'Patient initials, admit date, unit, expected disposition, and primary diagnosis are required.' },
      { status: 400 }
    );
  }

  const plan = await prisma.dischargePlan.create({
    data: {
      facilityId:            session.user.facilityId,
      patientInitials,
      patientMrn:            patientMrn || null,
      admitDate:             new Date(admitDate),
      unit,
      assessmentStartDate:   assessmentStartDate ? new Date(assessmentStartDate) : new Date(admitDate),
      assessmentBy:          assessmentBy || session.user.name || 'Staff',
      expectedDisposition,
      estimatedDischargeDate:estimatedDischargeDate ? new Date(estimatedDischargeDate) : null,
      insuranceAuth:         insuranceAuth || null,
      primaryDx,
      careCoordinator:       careCoordinator || null,
      familyInvolved:        !!familyInvolved,
      barrierNotes:          barrierNotes || null,
      moonRequired:          !!moonRequired,
      referralsSent:         referralsSent || [],
      status:                'ACTIVE',
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
