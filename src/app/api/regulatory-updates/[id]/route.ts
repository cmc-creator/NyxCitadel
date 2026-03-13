import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/regulatory-updates/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const update = await prisma.regulatoryUpdate.findUnique({
    where: { id: params.id },
    include: { publishedBy: { select: { name: true } } },
  });

  if (!update || !update.isActive) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(update);
}

// PATCH /api/regulatory-updates/[id] — admin can edit or archive
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role as string;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const update = await prisma.regulatoryUpdate.update({
    where: { id: params.id },
    data: {
      ...(body.title        != null ? { title:          body.title.trim()        } : {}),
      ...(body.summary      != null ? { summary:        body.summary.trim()      } : {}),
      ...(body.body         != null ? { body:           body.body.trim()         } : {}),
      ...(body.urgency      != null ? { urgency:        body.urgency             } : {}),
      ...(body.regulatoryBody != null ? { regulatoryBody: body.regulatoryBody.trim() } : {}),
      ...(body.standardRef  != null ? { standardRef:    body.standardRef.trim()  } : {}),
      ...(body.effectiveDate != null ? { effectiveDate: new Date(body.effectiveDate) } : {}),
      ...(body.sourceUrl    != null ? { sourceUrl:      body.sourceUrl.trim()    } : {}),
      ...(body.isActive     != null ? { isActive:       body.isActive            } : {}),
    },
  });

  return NextResponse.json(update);
}

// DELETE /api/regulatory-updates/[id] — soft-delete (isActive = false)
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role as string;
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.regulatoryUpdate.update({
    where: { id: params.id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
