import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';
import { logAudit } from '@/lib/audit';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
];

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

function isAllowedMimeType(mimeType: string) {
  if (!mimeType) return false;
  if (mimeType.startsWith('image/')) return true;
  if (mimeType.startsWith('video/')) return true;
  if (mimeType.startsWith('audio/')) return true;
  return ALLOWED_TYPES.includes(mimeType);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const pathFromClient = String(formData.get('path') ?? '');

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 });
  }

  if (!isAllowedMimeType(file.type)) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type || 'unknown'}` }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
  const safePath = pathFromClient
    .replace(/^\/+/, '')
    .replace(/\.\.+/g, '')
    .replace(/[^a-zA-Z0-9/_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/\/{2,}/g, '/');
  const basePath = safePath || `policies/${session.user.facilityId}`;
  const safeName = `${basePath}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const blob = await put(safeName, file, { access: 'public' });

  await logAudit({
    userId: session.user.id,
    action: 'UPLOAD_FILE',
    entityType: 'BlobFile',
    entityId: blob.pathname,
    changes: { name: file.name, type: file.type, size: file.size, path: basePath },
    req,
  });

  return NextResponse.json({
    url:  blob.url,
    name: file.name,
    size: file.size,
    type: file.type,
  });
}
