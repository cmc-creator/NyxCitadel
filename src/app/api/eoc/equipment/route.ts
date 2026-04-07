import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Auto-update status based on dates before returning
  const today = new Date();
  const thirtyDays = new Date(today);
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  // Mark overdue
  await prisma.equipmentPm.updateMany({
    where: {
      facilityId: session.user.facilityId,
      nextServiceDate: { lt: today },
      status: { notIn: ['COMPLETED', 'IN_PROGRESS'] },
    },
    data: { status: 'OVERDUE' },
  });

  // Mark due soon
  await prisma.equipmentPm.updateMany({
    where: {
      facilityId: session.user.facilityId,
      nextServiceDate: { gte: today, lte: thirtyDays },
      status: { notIn: ['COMPLETED', 'IN_PROGRESS', 'OVERDUE'] },
    },
    data: { status: 'DUE_SOON' },
  });

  const equipment = await prisma.equipmentPm.findMany({
    where: { facilityId: session.user.facilityId },
    orderBy: [{ status: 'asc' }, { nextServiceDate: 'asc' }],
  });

  return NextResponse.json(equipment);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    equipmentName, equipmentId, location, category,
    frequency, lastServiceDate, nextServiceDate, vendor, contactPhone, notes,
  } = body;

  if (!equipmentName || !location || !category || !frequency || !nextServiceDate) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  const today = new Date();
  const nextDate = new Date(nextServiceDate);
  const thirtyDays = new Date(today);
  thirtyDays.setDate(thirtyDays.getDate() + 30);

  let status: 'UPCOMING' | 'DUE_SOON' | 'OVERDUE' = 'UPCOMING';
  if (nextDate < today) status = 'OVERDUE';
  else if (nextDate <= thirtyDays) status = 'DUE_SOON';

  const equipment = await prisma.equipmentPm.create({
    data: {
      facilityId: session.user.facilityId,
      equipmentName,
      equipmentId: equipmentId ?? null,
      location,
      category,
      frequency,
      lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
      nextServiceDate: nextDate,
      vendor: vendor ?? null,
      contactPhone: contactPhone ?? null,
      status,
      notes: notes ?? null,
    },
  });

  await logAudit({ userId: session.user.id, action: 'CREATE', entityType: 'EquipmentPm', entityId: equipment.id, req });
  return NextResponse.json(equipment, { status: 201 });
}
