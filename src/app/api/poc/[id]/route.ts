import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const poc = await prisma.planOfCorrection.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: { findings: true },
  });
  if (!poc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(poc);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = await prisma.planOfCorrection.updateMany({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.submittedDate !== undefined && {
        submittedDate: body.submittedDate ? new Date(body.submittedDate) : null,
      }),
      ...(body.submittedBy !== undefined && { submittedBy: body.submittedBy }),
      ...(body.approvedBy !== undefined && { approvedBy: body.approvedBy }),
      ...(body.coverLetter !== undefined && { coverLetter: body.coverLetter }),
      ...(body.certificationStatement !== undefined && { certificationStatement: body.certificationStatement }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json(result);
}
