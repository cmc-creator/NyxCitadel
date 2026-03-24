import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
  const { title, summary, regulatoryBody, urgency, standardRef, effectiveDate, sourceUrl, isGlobal } = body;

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
      regulatoryBody: regulatoryBody.trim(),
      urgency:        urgency ?? 'INFORMATIONAL',
      standardRef:    standardRef?.trim() ?? null,
      effectiveDate:  effectiveDate ? new Date(effectiveDate) : null,
      sourceUrl:      sourceUrl?.trim() ?? null,
      isGlobal:       isGlobal ?? true,
      publishedById:  session.user.id,
    },
  });

  return NextResponse.json(update, { status: 201 });
}