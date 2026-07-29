import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { sendEmail } from '@/lib/email';
import { getGrievanceCreatedEmail } from '@/lib/email-templates';

// Generate a unique grievance number  e.g. GR-2025-001
async function generateGrievanceNumber(facilityId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.grievanceRecord.count({ where: { facilityId } });
  return `GR-${year}-${String(count + 1).padStart(3, '0')}`;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const grievances = await prisma.grievanceRecord.findMany({
    where: {
      facilityId: session.user.facilityId,
      ...(status ? { status: status as never } : {}),
    },
    orderBy: { dateReceived: 'desc' },
  });
  return NextResponse.json(grievances);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    dateReceived, complainantName, complainantType, complainantPhone, complainantEmail,
    patientName, patientDOB, patientMRN, admissionDate, dischargeDate,
    summary, category, severity, assignedTo,
    reportableToAdhs, linkedIncidentId, notes,
  } = body;

  if (!dateReceived || !complainantName || !complainantType || !summary || !category) {
    return NextResponse.json({ error: 'Date received, complainant name/type, summary, and category are required.' }, { status: 400 });
  }

  const received = new Date(dateReceived);
  const acknowledgmentDueDate = new Date(received);
  acknowledgmentDueDate.setDate(acknowledgmentDueDate.getDate() + 7);  // CMS 482.13(e) - 7 days
  const resolutionDueDate = new Date(received);
  resolutionDueDate.setDate(resolutionDueDate.getDate() + 30);         // CMS 482.13(e) - 30 days

  const grievanceNumber = await generateGrievanceNumber(session.user.facilityId);

  const grievance = await prisma.grievanceRecord.create({
    data: {
      facilityId:           session.user.facilityId,
      grievanceNumber,
      dateReceived:         received,
      complainantName,
      complainantType,
      complainantPhone:     complainantPhone ?? null,
      complainantEmail:     complainantEmail ?? null,
      patientName:          patientName ?? null,
      patientDOB:           patientDOB ? new Date(patientDOB) : null,
      patientMRN:           patientMRN ?? null,
      admissionDate:        admissionDate ? new Date(admissionDate) : null,
      dischargeDate:        dischargeDate ? new Date(dischargeDate) : null,
      summary,
      category,
      severity:             severity ?? 'STANDARD',
      assignedTo:           assignedTo ?? null,
      acknowledgmentDueDate,
      resolutionDueDate,
      status:               'OPEN',
      reportableToAdhs:     reportableToAdhs ?? false,
      linkedIncidentId:     linkedIncidentId ?? null,
      notes:                notes ?? null,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'GrievanceRecord', entityId: grievance.id, req });

  // Email the assigned staff member if set
  if (assignedTo) {
    const assignee = await prisma.user.findUnique({ where: { id: assignedTo }, select: { email: true, name: true } });
    if (assignee?.email) {
      const emailData = getGrievanceCreatedEmail({
        recipientName: assignee.name ?? assignee.email,
        grievanceNumber,
        complainantName,
        category,
        severity: severity ?? 'STANDARD',
        ackDueDate: acknowledgmentDueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        resDueDate: resolutionDueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      });
      sendEmail({ to: assignee.email, subject: emailData.subject, html: emailData.html }).catch(() => {});
    }
  }

  return NextResponse.json(grievance, { status: 201 });
}
