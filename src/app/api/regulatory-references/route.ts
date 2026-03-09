import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── GET /api/regulatory-references ──────────────────────────────────────────
// Query params:
//   q         – keyword search in title / standardRef / description / notes
//   body      – regulatoryBody exact match (e.g. "CMS", "DEA")
//   priority  – "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
//   frequency – "ANNUAL" | "MONTHLY" | ...
//   builtin   – "true" | "false" | omit for all
//   page      – page number (default 1)
//   limit     – results per page (default 100)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const q         = searchParams.get('q')?.trim() ?? '';
  const body      = searchParams.get('body') ?? '';
  const priority  = searchParams.get('priority') ?? '';
  const frequency = searchParams.get('frequency') ?? '';
  const builtin   = searchParams.get('builtin');
  const page      = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit     = Math.min(200, parseInt(searchParams.get('limit') ?? '100', 10));

  const where: Record<string, unknown> = {
    OR: [
      { facilityId: null },
      { facilityId: session.user.facilityId },
    ],
  };

  if (body)      where['regulatoryBody'] = { equals: body, mode: 'insensitive' };
  if (priority)  where['priority'] = priority;
  if (frequency) where['frequency'] = frequency;

  if (builtin === 'true')  where['isBuiltIn'] = true;
  if (builtin === 'false') where['isBuiltIn'] = false;

  if (q) {
    where['AND'] = [
      {
        OR: [
          { title:          { contains: q, mode: 'insensitive' } },
          { standardRef:    { contains: q, mode: 'insensitive' } },
          { description:    { contains: q, mode: 'insensitive' } },
          { notes:          { contains: q, mode: 'insensitive' } },
          { regulatoryBody: { contains: q, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.regulatoryReference.count({ where }),
    prisma.regulatoryReference.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { regulatoryBody: 'asc' }, { refId: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

// ── POST /api/regulatory-references ─────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only ADMIN and COMPLIANCE_OFFICER can add entries
  if (!['ADMIN', 'COMPLIANCE_OFFICER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, description, standardRef, regulatoryBody,
    category, frequency, priority, responsibleRole,
    notes, sourceUrl, lastVerified, months,
  } = body;

  if (!title || !standardRef || !regulatoryBody || !category || !frequency || !priority) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Generate a stable custom refId
  const refId = `custom-${session.user.facilityId}-${Date.now()}`;

  const record = await prisma.regulatoryReference.create({
    data: {
      refId,
      title,
      description: description ?? '',
      standardRef,
      regulatoryBody,
      category,
      frequency,
      priority,
      responsibleRole: responsibleRole ?? null,
      notes: notes ?? null,
      sourceUrl: sourceUrl ?? null,
      lastVerified: lastVerified ? new Date(lastVerified) : null,
      months: months ?? [],
      isBuiltIn: false,
      facilityId: session.user.facilityId,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
