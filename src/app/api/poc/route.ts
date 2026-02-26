import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function generatePocNumber(facilityId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.planOfCorrection.count({ where: { facilityId } });
  return `POC-${year}-${String(count + 1).padStart(3, '0')}`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pocs = await prisma.planOfCorrection.findMany({
    where: { facilityId: session.user.facilityId },
    include: { findings: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(pocs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    surveyId, title, regulatoryBody, surveyDate, responseDeadline,
    findings, coverLetter, certificationStatement, submittedBy, notes,
  } = body;

  if (!title || !regulatoryBody) {
    return NextResponse.json({ error: 'Title and regulatory body are required.' }, { status: 400 });
  }

  const pocNumber = await generatePocNumber(session.user.facilityId);

  const poc = await prisma.planOfCorrection.create({
    data: {
      facilityId:              session.user.facilityId,
      pocNumber,
      surveyId:                surveyId ?? null,
      title,
      regulatoryBody,
      surveyDate:              surveyDate ? new Date(surveyDate) : null,
      responseDeadline:        responseDeadline ? new Date(responseDeadline) : null,
      status:                  'DRAFT',
      coverLetter:             coverLetter ?? null,
      certificationStatement:  certificationStatement ?? null,
      submittedBy:             submittedBy ?? null,
      notes:                   notes ?? null,
      findings: findings?.length
        ? {
            create: findings.map((f: any) => ({
              findingNumber:       f.findingNumber ?? '',
              findingDescription:  f.findingDescription ?? '',
              howCorrected:        f.howCorrected ?? null,
              howPrevented:        f.howPrevented ?? null,
              howMonitored:        f.howMonitored ?? null,
              responsibleParty:    f.responsibleParty ?? null,
              targetDate:          f.targetDate ? new Date(f.targetDate) : null,
              evidenceOfCorrection: f.evidenceOfCorrection ?? null,
              status:              'OPEN',
            })),
          }
        : undefined,
    },
    include: { findings: true },
  });

  return NextResponse.json(poc, { status: 201 });
}
