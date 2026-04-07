import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const docs = await prisma.governanceDocument.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: { effectiveDate: 'desc' },
  });

  return NextResponse.json(docs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { docType, title, version, effectiveDate, reviewDate, approvedBy, status, documentUrl, notes } = body;

  if (!docType || !title || !effectiveDate) {
    return NextResponse.json(
      { error: 'Document type, title, and effective date are required.' },
      { status: 400 }
    );
  }

  const doc = await prisma.governanceDocument.create({
    data: {
      facilityId:  session.user.facilityId,
      docType,
      title,
      version:     version || null,
      effectiveDate: new Date(effectiveDate),
      reviewDate:  reviewDate ? new Date(reviewDate) : null,
      approvedBy:  approvedBy || null,
      status:      status || 'ACTIVE',
      documentUrl: documentUrl || null,
      notes:       notes || null,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'GovernanceDocument', entityId: doc.id, req });
  return NextResponse.json(doc, { status: 201 });
}
