import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const incident = await prisma.incident.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: { cap: { select: { id: true, capNumber: true, status: true, title: true } } },
  });
  if (!incident) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(incident);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = await prisma.incident.updateMany({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...(body.status              !== undefined && { status: body.status }),
      ...(body.severity            !== undefined && { severity: body.severity }),
      ...(body.rootCauseAnalysis   !== undefined && { rootCauseAnalysis: body.rootCauseAnalysis }),
      ...(body.correctionRequired  !== undefined && { correctionRequired: body.correctionRequired }),
      ...(body.reportableToState   !== undefined && { reportableToState: body.reportableToState }),
      ...(body.reportedToState     !== undefined && { reportedToState: body.reportedToState }),
      ...(body.stateReportDate     !== undefined && {
        stateReportDate: body.stateReportDate ? new Date(body.stateReportDate) : null,
      }),
      ...(body.reportableToJC      !== undefined && { reportableToJC: body.reportableToJC }),
      ...(body.jcReportDate        !== undefined && {
        jcReportDate: body.jcReportDate ? new Date(body.jcReportDate) : null,
      }),
      ...(body.closedDate          !== undefined && {
        closedDate: body.closedDate ? new Date(body.closedDate) : null,
      }),
      ...(body.capId               !== undefined && { capId: body.capId }),
      ...(body.immediateActions    !== undefined && { immediateActions: body.immediateActions }),
    },
  });
  return NextResponse.json(result);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const existing = await prisma.incident.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  await prisma.incident.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
