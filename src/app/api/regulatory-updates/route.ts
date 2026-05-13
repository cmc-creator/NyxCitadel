import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

// GET /api/regulatory-updates - paginated list (all authenticated users)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page        = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit       = Math.min(50, parseInt(searchParams.get('limit') ?? '20', 10));
  const urgency     = searchParams.get('urgency');

  const where = {
    ...(urgency ? { urgency: urgency as any } : {}),
  };

  const [updates, total] = await Promise.all([
    prisma.regulatoryUpdate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id:             true,
        title:          true,
        summary:        true,
        urgency:        true,
        regulatoryBody: true,
        sourceUrl:      true,
        standardRef:    true,
        effectiveDate:  true,
        isGlobal:       true,
        isActive:       true,
        createdAt:      true,
      },
    }),
    prisma.regulatoryUpdate.count({ where }),
  ]);

  return NextResponse.json({ updates, total, page, limit });
}

// POST /api/regulatory-updates - upsert from scraper (admin/service only)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role as string;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, summary, body: bodyText, regulatoryBody, urgency,
    standardRef, effectiveDate, sourceUrl, isGlobal,
    affectedAreas, actionRequired,
  } = body;

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
      body:           bodyText?.trim() ?? null,
      regulatoryBody: regulatoryBody.trim(),
      urgency:        urgency ?? 'INFORMATIONAL',
      standardRef:    standardRef?.trim() ?? null,
      effectiveDate:  effectiveDate ? new Date(effectiveDate) : null,
      sourceUrl:      sourceUrl?.trim() ?? null,
      isGlobal:       isGlobal ?? true,
      affectedAreas:  Array.isArray(affectedAreas) ? affectedAreas : [],
      actionRequired: actionRequired?.trim() ?? null,
      publishedById:  session.user.id,
    },
  });

  // Fan-out in-app notifications to all active users
  // CRITICAL/HIGH → immediate; others → still created so unread badge shows
  const notifyRoles = ['ADMIN', 'SUPER_ADMIN', 'COMPLIANCE_OFFICER', 'RISK_MANAGER', 'QUALITY', 'EM_COORDINATOR'];
  const users = await prisma.user.findMany({
    where: { isActive: true, role: { in: notifyRoles as any[] } },
    select: { id: true, facilityId: true },
  });

  const urgencyLabel: Record<string, string> = {
    CRITICAL:      'CRITICAL – Immediate Action Required',
    HIGH:          'High Priority – Review Within 7 Days',
    MEDIUM:        'Medium – Review Within 30 Days',
    INFORMATIONAL: 'Informational',
  };

  if (users.length > 0) {
    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId:     u.id,
        facilityId: u.facilityId,
        type:       'REGULATORY_UPDATE' as const,
        title:      `[${urgencyLabel[urgency] ?? urgency}] ${title.trim()}`,
        message:    summary.trim().slice(0, 300),
        linkUrl:    `/regulatory-updates/${update.id}`,
      })),
      skipDuplicates: true,
    });
  }

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'RegulatoryUpdate', entityId: update.id, req });
  return NextResponse.json(update, { status: 201 });
}