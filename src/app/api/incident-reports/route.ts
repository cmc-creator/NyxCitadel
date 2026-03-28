import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

async function generateIrNumber(facilityId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.incidentReport.count({ where: { facilityId } });
  return `IR-${year}-${String(count + 1).padStart(4, '0')}`;
}

// ADHS reporting deadlines: 24-hour events → 1 day, 5-day events → 5 calendar days
function calcAdhsDeadline(date: Date, category: string | undefined): Date | null {
  if (!category) return null;
  const d = new Date(date);
  if (category === '24-hour') {
    d.setDate(d.getDate() + 1);
  } else if (category === '5-day') {
    d.setDate(d.getDate() + 5);
  } else {
    return null;
  }
  return d;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const type   = searchParams.get('type');
  const from   = searchParams.get('from');
  const to     = searchParams.get('to');

  const items = await prisma.incidentReport.findMany({
    where: {
      facilityId: session.user.facilityId,
      ...(status ? { status: status as never } : {}),
      ...(type   ? { incidentType: type as never } : {}),
      ...(from || to ? {
        incidentDate: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to   ? { lte: new Date(to)   } : {}),
        },
      } : {}),
    },
    orderBy: { incidentDate: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    incidentDate, incidentTime, incidentType, severity, location, unitName,
    briefDescription, injuryDescription, immediateActions,
    patientName, patientMRN, patientDOB, patientAge,
    staffInvolvedNames, witnessNames,
    physicianNotified, physicianNotifiedTime,
    supervisorNotified, supervisorNotifiedTime,
    familyNotified, familyNotifiedDate,
    adhsReportable, adhsReportableCategory,
    ahcccsReportable, jcReportable,
    iadRequired, iadPeriod,
    assignedTo, linkedRcaId, linkedCapId, notes,
  } = body;

  if (!incidentDate || !incidentType || !severity || !briefDescription) {
    return NextResponse.json(
      { error: 'Incident date, type, severity, and description are required.' },
      { status: 400 }
    );
  }

  const irNumber = await generateIrNumber(session.user.facilityId);
  const incDate = new Date(incidentDate);
  const adhsDeadline = adhsReportable
    ? calcAdhsDeadline(incDate, adhsReportableCategory)
    : null;

  const item = await prisma.incidentReport.create({
    data: {
      facilityId:            session.user.facilityId,
      irNumber,
      incidentDate:          incDate,
      incidentTime:          incidentTime ?? null,
      incidentType,
      severity,
      location:              location ?? null,
      unitName:              unitName ?? null,
      briefDescription,
      injuryDescription:     injuryDescription ?? null,
      immediateActions:      immediateActions ?? null,
      patientName:           patientName ?? null,
      patientMRN:            patientMRN ?? null,
      patientDOB:            patientDOB ? new Date(patientDOB) : null,
      patientAge:            patientAge ?? null,
      staffInvolvedNames:    staffInvolvedNames ?? null,
      witnessNames:          witnessNames ?? null,
      physicianNotified:     physicianNotified ?? false,
      physicianNotifiedTime: physicianNotifiedTime ?? null,
      supervisorNotified:    supervisorNotified ?? false,
      supervisorNotifiedTime:supervisorNotifiedTime ?? null,
      familyNotified:        familyNotified ?? false,
      familyNotifiedDate:    familyNotifiedDate ? new Date(familyNotifiedDate) : null,
      adhsReportable:        adhsReportable ?? false,
      adhsReportableCategory:adhsReportableCategory ?? null,
      adhsReportDue:         adhsDeadline,
      ahcccsReportable:      ahcccsReportable ?? false,
      jcReportable:          jcReportable ?? false,
      iadRequired:           iadRequired ?? false,
      iadPeriod:             iadPeriod ?? null,
      assignedTo:            assignedTo ?? null,
      linkedRcaId:           linkedRcaId ?? null,
      linkedCapId:           linkedCapId ?? null,
      notes:                 notes ?? null,
      status:                'OPEN',
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'CREATE_INCIDENT_REPORT',
    entityType: 'IncidentReport',
    entityId: item.id,
    changes: { irNumber: item.irNumber, incidentType, severity, incidentDate },
    req,
  });

  return NextResponse.json(item, { status: 201 });
}
