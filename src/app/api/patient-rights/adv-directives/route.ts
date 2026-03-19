import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const records = await prisma.advanceDirectiveRecord.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { admitDate: 'desc' },
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    patientInitials,
    patientMrn,
    admitDate,
    adExists,
    adType,
    adOnFile,
    informationProvided,
    providedBy,
    patientDeclined,
    documentedBy,
    documentedDate,
    notes,
  } = body;

  if (!patientInitials || !admitDate || !documentedBy || !documentedDate) {
    return NextResponse.json(
      { error: 'Patient initials, admit date, documented by, and documented date are required.' },
      { status: 400 }
    );
  }

  const record = await prisma.advanceDirectiveRecord.create({
    data: {
      facilityId:          session.user.facilityId,
      patientInitials,
      patientMrn:          patientMrn || null,
      admitDate:           new Date(admitDate),
      adExists:            !!adExists,
      adType:              adType || null,
      adOnFile:            !!adOnFile,
      informationProvided: informationProvided !== false,
      providedBy:          providedBy || null,
      patientDeclined:     !!patientDeclined,
      documentedBy,
      documentedDate:      new Date(documentedDate),
      notes:               notes || null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
