import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfDay } from 'date-fns';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ overdue: 0 }, { status: 401 });

  const facilityId = session.user.facilityId;
  const cutoff = startOfDay(new Date());

  const [poc, qoc, grievAck, grievRes, caps, policies, responses, adhs, calendar, regUpdates] = await Promise.all([
    prisma.planOfCorrection.count({
      where: { facilityId, responseDeadline: { lt: cutoff }, status: { notIn: ['SUBMITTED', 'ACCEPTED', 'CLOSED'] } },
    }),
    prisma.qocComplaint.count({
      where: { facilityId, responseDueDate: { lt: cutoff }, responseSubmittedDate: null, status: 'LOI_RECEIVED' },
    }),
    prisma.grievanceRecord.count({
      where: { facilityId, acknowledgmentDate: null, acknowledgmentDueDate: { lt: cutoff }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
    }),
    prisma.grievanceRecord.count({
      where: { facilityId, resolutionDate: null, resolutionDueDate: { lt: cutoff }, status: { notIn: ['CLOSED', 'RESOLVED'] } },
    }),
    prisma.correctiveActionPlan.count({
      where: { facilityId, targetDate: { lt: cutoff }, status: { notIn: ['COMPLETED', 'VERIFIED'] } },
    }),
    prisma.policy.count({
      where: { facilityId, nextReviewDate: { lt: cutoff }, status: { in: ['ACTIVE', 'OVERDUE_REVIEW'] } },
    }),
    prisma.generatedResponse.count({
      where: { facilityId, dueDate: { lt: cutoff }, status: { notIn: ['SENT', 'FILED'] } },
    }),
    prisma.incidentReport.count({
      where: { facilityId, adhsReportable: true, adhsReported: false, adhsReportDue: { lt: cutoff } },
    }),
    prisma.calendarEvent.count({
      where: { facilityId, dueDate: { lt: cutoff }, completedDate: null, status: { notIn: ['COMPLETED', 'NA', 'WAIVED'] } },
    }),
    // Unacknowledged CRITICAL / HIGH regulatory updates count as overdue action items
    prisma.regulatoryUpdateAck.findMany({
      where: { userId: session.user.id },
      select: { updateId: true },
    }).then(async (acks) => {
      const ackedIds = acks.map(a => a.updateId);
      return prisma.regulatoryUpdate.count({
        where: {
          isActive: true,
          urgency: { in: ['CRITICAL', 'HIGH'] },
          ...(ackedIds.length > 0 ? { id: { notIn: ackedIds } } : {}),
        },
      });
    }),
  ]);

  const overdue = poc + qoc + grievAck + grievRes + caps + policies + responses + adhs + calendar + regUpdates;
  return NextResponse.json({ overdue });
}
