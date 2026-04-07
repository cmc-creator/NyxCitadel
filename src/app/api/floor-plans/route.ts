import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { logAudit } from '@/lib/audit';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'floor-plans');

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const floorPlans = await prisma.facilityFloorPlan.findMany({
    where: { facilityId: session.user.facilityId, isActive: true },
    orderBy: [{ floor: 'asc' }, { name: 'asc' }],
  });

  return NextResponse.json(floorPlans);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file     = formData.get('file') as File | null;
    const name     = formData.get('name') as string;
    const floor    = parseInt(formData.get('floor') as string ?? '1', 10);
    const notes    = formData.get('notes') as string | null;

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    let imageUrl = '/images/placeholder-floorplan.svg';

    if (file && file.size > 0) {
      // Ensure upload dir exists
      await mkdir(UPLOAD_DIR, { recursive: true });

      const ext      = file.name.split('.').pop() ?? 'png';
      const filename = `${session.user.facilityId}-${Date.now()}.${ext}`;
      const buffer   = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(UPLOAD_DIR, filename), buffer);
      imageUrl = `/uploads/floor-plans/${filename}`;
    }

    const plan = await prisma.facilityFloorPlan.create({
      data: {
        facilityId: session.user.facilityId,
        name,
        floor: isNaN(floor) ? 1 : floor,
        imageUrl,
        notes: notes || null,
        isActive: true,
      },
    });

    await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'FacilityFloorPlan', entityId: plan.id, req });
    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    console.error('Floor plan upload error:', err);
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.facilityFloorPlan.updateMany({
    where: { id, facilityId: session.user.facilityId },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
