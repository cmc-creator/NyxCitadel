import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const reports = await prisma.boardReport.findMany({
    where: { facilityId: session.user.facilityId },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ reportYear: 'desc' }, { reportMonth: 'desc' }],
    take: 24,
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.facilityId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, reportMonth, reportYear, content } = body;

  if (!title || !reportMonth || !reportYear || !content) {
    return NextResponse.json({ error: 'title, reportMonth, reportYear, content required' }, { status: 400 });
  }

  const report = await prisma.boardReport.create({
    data: {
      facilityId: session.user.facilityId,
      generatedBy: session.user.id,
      title,
      reportMonth: Number(reportMonth),
      reportYear: Number(reportYear),
      content,
    },
  });

  await logAudit({
    userId: session.user.id,
    action: 'CREATE_BOARD_REPORT',
    entityType: 'BoardReport',
    entityId: report.id,
    changes: { title, reportMonth, reportYear },
  });

  return NextResponse.json(report, { status: 201 });
}
