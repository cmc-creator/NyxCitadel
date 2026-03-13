import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

// GET /api/regulatory-updates — paginated list (all authenticated users)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const urgency = searchParams.get('urgency');

  const where = {
    isActive: true,
    ...(urgency ? { urgency: urgency as any } : {}),
  };

  const [updates, total] = await Promise.all([
    prisma.regulatoryUpdate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        summary: true,
        urgency: true,
        regulatoryBody: true,
        standardRef: true,
        effectiveDate: true,
        sourceUrl: true,
        createdAt: true,
        publishedBy: { select: { name: true } },
      },
    }),
    prisma.regulatoryUpdate.count({ where }),
  ]);

  return NextResponse.json({ updates, total, page, limit });
}

// POST /api/regulatory-updates — publish a new update (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role as string;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
  }

  const body = await req.json();
  const { title, summary, body: detail, urgency, regulatoryBody, standardRef, effectiveDate, sourceUrl } = body;

  if (!title?.trim() || !summary?.trim() || !regulatoryBody?.trim()) {
    return NextResponse.json(
      { error: 'Missing required fields: title, summary, regulatoryBody' },
      { status: 400 }
    );
  }

  const update = await prisma.regulatoryUpdate.create({
    data: {
      title:          title.trim(),
      summary:        summary.trim(),
      body:           detail?.trim() ?? null,
      urgency:        urgency ?? 'INFORMATIONAL',
      regulatoryBody: regulatoryBody.trim(),
      standardRef:    standardRef?.trim() ?? null,
      effectiveDate:  effectiveDate ? new Date(effectiveDate) : null,
      sourceUrl:      sourceUrl?.trim() ?? null,
      publishedById:  session.user.id as string,
    },
  });

  // Broadcast notification to all active users across all active facilities
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, facilityId: true },
  });

  const urgencyLabel: Record<string, string> = {
    CRITICAL:      '🚨 Critical',
    HIGH:          '⚠️ High Priority',
    MEDIUM:        'ℹ️ Medium',
    INFORMATIONAL: '📋 Informational',
  };

  await prisma.notification.createMany({
    data: users.map((u: { id: string; facilityId: string }) => ({
      userId:     u.id,
      facilityId: u.facilityId,
      title:      `Regulatory Update: ${update.title}`,
      message:    `${urgencyLabel[update.urgency] ?? update.urgency} · ${update.regulatoryBody}${update.standardRef ? ` (${update.standardRef})` : ''} — ${update.summary.slice(0, 120)}${update.summary.length > 120 ? '…' : ''}`,
      type:       NotificationType.REGULATORY_UPDATE,
      linkUrl:    `/regulatory-updates/${update.id}`,
      isRead:     false,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json(update, { status: 201 });
}
