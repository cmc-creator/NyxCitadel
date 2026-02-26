import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const item = await prisma.qocComplaint.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // Recalculate response due if LOI date changes
  let responseDueDate: Date | null | undefined = undefined;
  if (body.loiReceivedDate) {
    responseDueDate = addBusinessDays(new Date(body.loiReceivedDate), 10);
  }

  const updated = await prisma.qocComplaint.update({
    where: { id: params.id },
    data: {
      ...body,
      loiReceivedDate:       body.loiReceivedDate ? new Date(body.loiReceivedDate) : undefined,
      responseDueDate:       responseDueDate ?? undefined,
      responseSubmittedDate: body.responseSubmittedDate
        ? new Date(body.responseSubmittedDate) : undefined,
      surveyDate:            body.surveyDate ? new Date(body.surveyDate) : undefined,
      closedDate:            body.closedDate ? new Date(body.closedDate) : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.qocComplaint.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
