import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import type { ResponseStatus, ResponseTemplateCategory } from '@prisma/client';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');

  const responses = await prisma.generatedResponse.findMany({
    where: {
      facilityId: session.user.facilityId,
      ...(status ? { status: status as ResponseStatus } : {}),
      ...(category ? { category: category as ResponseTemplateCategory } : {}),
    },
    include: { template: { select: { name: true, category: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(responses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    templateId, title, category, recipientName, recipientRole, recipientAddress,
    subject, body: responseBody, sourceType, sourceId, sourceRef,
    dueDate, draftedBy, aiGenerated, notes,
  } = body;

  if (!title || !category || !subject || !responseBody) {
    return NextResponse.json({ error: 'Title, category, subject, and body are required.' }, { status: 400 });
  }

  const response = await prisma.generatedResponse.create({
    data: {
      facilityId:       session.user.facilityId,
      templateId:       templateId ?? null,
      title,
      category,
      recipientName:    recipientName ?? null,
      recipientRole:    recipientRole ?? null,
      recipientAddress: recipientAddress ?? null,
      subject,
      body:             responseBody,
      status:           'DRAFT',
      sourceType:       sourceType ?? null,
      sourceId:         sourceId ?? null,
      sourceRef:        sourceRef ?? null,
      dueDate:          dueDate ? new Date(dueDate) : null,
      draftedBy:        draftedBy ?? session.user.name ?? null,
      aiGenerated:      aiGenerated ?? false,
      notes:            notes ?? null,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'GeneratedResponse', entityId: response.id, req });
  return NextResponse.json(response, { status: 201 });
}
