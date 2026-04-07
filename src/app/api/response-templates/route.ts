import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const templates = await prisma.responseTemplate.findMany({
    where: { facilityId: session.user.facilityId, isActive: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    name, category, description, subject, bodyTemplate,
    variables, regulatoryRef, daysRequired, instructions,
  } = body;

  if (!name || !category || !bodyTemplate) {
    return NextResponse.json({ error: 'Name, category, and body template are required.' }, { status: 400 });
  }

  const template = await prisma.responseTemplate.create({
    data: {
      facilityId:    session.user.facilityId,
      name,
      category,
      description:   description ?? null,
      subject:       subject ?? null,
      bodyTemplate,
      variables:     variables ?? [],
      regulatoryRef: regulatoryRef ?? null,
      daysRequired:  daysRequired ? Number(daysRequired) : null,
      instructions:  instructions ?? null,
      isDefault:     false,
      isActive:      true,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'ResponseTemplate', entityId: template.id, req });
  return NextResponse.json(template, { status: 201 });
}
