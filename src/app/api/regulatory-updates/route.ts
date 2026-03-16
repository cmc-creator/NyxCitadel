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
  const impactLevel = searchParams.get('impactLevel');

  const where = {
    ...(impactLevel ? { impactLevel } : {}),
  };

  const [updates, total] = await Promise.all([
    prisma.regulatoryUpdate.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id:          true,
        title:       true,
        summary:     true,
        impactLevel: true,
        agency:      true,
        source:      true,
        url:         true,
        publishedAt: true,
        isRead:      true,
        isGlobal:    true,
        createdAt:   true,
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
  const { source, sourceId, title, summary, url, publishedAt, agency, docType, impactLevel } = body;

  if (!source?.trim() || !sourceId?.trim() || !title?.trim() || !url?.trim()) {
    return NextResponse.json(
      { error: 'Missing required fields: source, sourceId, title, url' },
      { status: 400 }
    );
  }

  const update = await prisma.regulatoryUpdate.upsert({
    where: { source_sourceId: { source: source.trim(), sourceId: sourceId.trim() } },
    create: {
      source:      source.trim(),
      sourceId:    sourceId.trim(),
      title:       title.trim(),
      summary:     summary?.trim() ?? null,
      url:         url.trim(),
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      agency:      agency?.trim() ?? null,
      docType:     docType?.trim() ?? null,
      impactLevel: impactLevel ?? 'INFO',
      isGlobal:    true,
    },
    update: {
      title:       title.trim(),
      summary:     summary?.trim() ?? null,
      impactLevel: impactLevel ?? 'INFO',
    },
  });

  return NextResponse.json(update, { status: 201 });
}