import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sourceType = req.nextUrl.searchParams.get('sourceType');
  const sourceId = req.nextUrl.searchParams.get('sourceId');

  if (!sourceType || !sourceId) {
    return NextResponse.json({ error: 'sourceType and sourceId are required.' }, { status: 400 });
  }

  const attachments = await prisma.attachment.findMany({
    where: {
      facilityId: session.user.facilityId,
      sourceType: sourceType as never,
      sourceId,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(attachments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    title,
    description,
    kind,
    mimeType,
    fileName,
    fileUrl,
    thumbnailUrl,
    fileSizeBytes,
    durationSeconds,
    checksum,
    sourceType,
    sourceId,
    sourceLabel,
    category,
    tags,
    isEvidence,
    isPublic,
    capturedAt,
    uploadedBy,
  } = body;

  if (!title || !kind || !fileName || !fileUrl || !sourceType || !sourceId) {
    return NextResponse.json(
      { error: 'Missing required fields: title, kind, fileName, fileUrl, sourceType, sourceId.' },
      { status: 400 }
    );
  }

  const attachment = await prisma.attachment.create({
    data: {
      facilityId: session.user.facilityId,
      title,
      description: description ?? null,
      kind,
      mimeType: mimeType ?? null,
      fileName,
      fileUrl,
      thumbnailUrl: thumbnailUrl ?? null,
      fileSizeBytes: fileSizeBytes != null ? Number(fileSizeBytes) : null,
      durationSeconds: durationSeconds != null ? Number(durationSeconds) : null,
      checksum: checksum ?? null,
      sourceType,
      sourceId,
      sourceLabel: sourceLabel ?? null,
      category: category ?? null,
      tags: Array.isArray(tags) ? tags : [],
      isEvidence: isEvidence !== false,
      isPublic: isPublic === true,
      capturedAt: capturedAt ? new Date(capturedAt) : null,
      uploadedBy: uploadedBy ?? session.user.name ?? session.user.email ?? 'Unknown',
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}