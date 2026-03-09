import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ── PATCH /api/regulatory-references/[id] ───────────────────────────────────
// Built-in entries: only notes / sourceUrl / lastVerified can be patched.
// Custom entries: all fields writable.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!['ADMIN', 'COMPLIANCE_OFFICER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await prisma.regulatoryReference.findFirst({
    where: {
      id: params.id,
      OR: [{ facilityId: null }, { facilityId: session.user.facilityId }],
    },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();

  let data: Record<string, unknown>;

  if (existing.isBuiltIn) {
    // Restrict built-in edits to annotation-only fields
    data = {
      notes:        body.notes        !== undefined ? body.notes        : existing.notes,
      sourceUrl:    body.sourceUrl    !== undefined ? body.sourceUrl    : existing.sourceUrl,
      lastVerified: body.lastVerified !== undefined
        ? (body.lastVerified ? new Date(body.lastVerified) : null)
        : existing.lastVerified,
    };
  } else {
    // Full edit for custom entries
    data = {
      title:          body.title          ?? existing.title,
      description:    body.description    ?? existing.description,
      standardRef:    body.standardRef    ?? existing.standardRef,
      regulatoryBody: body.regulatoryBody ?? existing.regulatoryBody,
      category:       body.category       ?? existing.category,
      frequency:      body.frequency      ?? existing.frequency,
      priority:       body.priority       ?? existing.priority,
      responsibleRole:body.responsibleRole !== undefined ? body.responsibleRole : existing.responsibleRole,
      notes:          body.notes          !== undefined ? body.notes          : existing.notes,
      sourceUrl:      body.sourceUrl      !== undefined ? body.sourceUrl      : existing.sourceUrl,
      lastVerified:   body.lastVerified   !== undefined
        ? (body.lastVerified ? new Date(body.lastVerified) : null)
        : existing.lastVerified,
      months:         body.months         !== undefined ? body.months         : existing.months,
    };
  }

  const updated = await prisma.regulatoryReference.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(updated);
}

// ── DELETE /api/regulatory-references/[id] ──────────────────────────────────
// Only custom (non-built-in) entries may be deleted.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!['ADMIN', 'COMPLIANCE_OFFICER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const existing = await prisma.regulatoryReference.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found or not deletable' }, { status: 404 });

  if (existing.isBuiltIn) {
    return NextResponse.json({ error: 'Built-in entries cannot be deleted' }, { status: 400 });
  }

  await prisma.regulatoryReference.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
