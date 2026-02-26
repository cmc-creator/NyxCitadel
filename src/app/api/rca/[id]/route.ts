import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rca = await prisma.rootCauseAnalysis.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
  });
  if (!rca) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rca);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const result = await prisma.rootCauseAnalysis.updateMany({
    where: { id: params.id, facilityId: session.user.facilityId },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.eventTimeline !== undefined && { eventTimeline: body.eventTimeline }),
      ...(body.humanFactors !== undefined && { humanFactors: body.humanFactors }),
      ...(body.equipmentFactors !== undefined && { equipmentFactors: body.equipmentFactors }),
      ...(body.environmentFactors !== undefined && { environmentFactors: body.environmentFactors }),
      ...(body.processFactors !== undefined && { processFactors: body.processFactors }),
      ...(body.organizationalFactors !== undefined && { organizationalFactors: body.organizationalFactors }),
      ...(body.whyAnalysis !== undefined && { whyAnalysis: body.whyAnalysis }),
      ...(body.rootCauses !== undefined && { rootCauses: body.rootCauses }),
      ...(body.actionItems !== undefined && { actionItems: body.actionItems }),
      ...(body.conclusion !== undefined && { conclusion: body.conclusion }),
      ...(body.preventabilityRating !== undefined && { preventabilityRating: body.preventabilityRating }),
      ...(body.systemChangesRequired !== undefined && { systemChangesRequired: body.systemChangesRequired }),
      ...(body.policyChangesRequired !== undefined && { policyChangesRequired: body.policyChangesRequired }),
      ...(body.trainingRequired !== undefined && { trainingRequired: body.trainingRequired }),
      ...(body.approvedBy !== undefined && { approvedBy: body.approvedBy }),
      ...(body.documentUrl !== undefined && { documentUrl: body.documentUrl }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.conductedDate !== undefined && {
        conductedDate: body.conductedDate ? new Date(body.conductedDate) : null,
      }),
      ...(body.teamMembers !== undefined && { teamMembers: body.teamMembers }),
      ...(body.completedBy !== undefined && { completedBy: body.completedBy }),
    },
  });
  return NextResponse.json(result);
}
