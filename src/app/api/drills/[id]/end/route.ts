import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function letterGrade(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
}

// POST /api/drills/[id]/end - end an active drill, compute full scorecard, auto-remediate
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const drill = await prisma.drill.findFirst({
    where: { id: params.id, facilityId: session.user.facilityId },
    include: {
      drillActions:  { orderBy: { timestamp: 'asc' } },
      killTasks:     true,
      musterEntries: true,
    },
  });

  if (!drill)                         return NextResponse.json({ error: 'Drill not found.' },          { status: 404 });
  if (drill.status === 'COMPLETED')   return NextResponse.json({ error: 'Drill already ended.' },      { status: 409 });
  if (drill.status !== 'IN_PROGRESS') return NextResponse.json({ error: 'Drill is not in progress.' }, { status: 400 });

  const now      = new Date();
  const started  = drill.drillStartedAt ?? drill.drillActions[0]?.timestamp ?? now;

  // ── Evacuation Time ─────────────────────────────────────────────────────────
  const allClear = drill.drillActions.filter((a) => a.actionType === 'ALL_CLEAR').pop();
  const evacuationSeconds = allClear
    ? Math.round((new Date(allClear.timestamp).getTime() - new Date(started).getTime()) / 1000)
    : Math.round((now.getTime() - new Date(started).getTime()) / 1000);

  // ── Comm Lag ─────────────────────────────────────────────────────────────────
  const firstAction = drill.drillActions[0];
  const commLagSeconds = firstAction
    ? Math.round((new Date(firstAction.timestamp).getTime() - new Date(started).getTime()) / 1000)
    : null;

  // ── Accountability ────────────────────────────────────────────────────────────
  // Mark UNACCOUNTED entries as GHOSTED
  const ghostedIds = drill.musterEntries
    .filter((e) => e.status === 'UNACCOUNTED')
    .map((e) => e.id);

  if (ghostedIds.length > 0) {
    await prisma.drillMusterEntry.updateMany({
      where: { id: { in: ghostedIds } },
      data: { status: 'GHOSTED' },
    });
  }

  const totalStaff    = drill.musterEntries.length;
  const presentCount  = drill.musterEntries.filter((e) => e.status === 'PRESENT' || e.status === 'EXCUSED').length;
  const accountabilityPct = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 100;

  // ── Task Mastery ──────────────────────────────────────────────────────────────
  // Mark overdue tasks as missed
  const overdueTasks = drill.killTasks
    .filter((t) => !t.completedAt && t.isRequired)
    .map((t) => t.id);

  if (overdueTasks.length > 0) {
    await prisma.drillKillTask.updateMany({
      where: { id: { in: overdueTasks } },
      data: { isMissed: true },
    });
  }

  const requiredTasks    = drill.killTasks.filter((t) => t.isRequired);
  const onTimeTasks      = drill.killTasks.filter((t) => t.completedAt && !t.isMissed).length;
  const taskMasteryPct   = requiredTasks.length > 0 ? Math.round((onTimeTasks / requiredTasks.length) * 100) : 100;

  // ── Scorecard Weights ─────────────────────────────────────────────────────────
  // Evacuation time: benchmark = 4 min (240s) → A+ if ≤ 240s, sliding scale
  const TARGET_EVAC_SECONDS = 240;
  const evacuationScore = evacuationSeconds <= TARGET_EVAC_SECONDS
    ? 100
    : Math.max(40, Math.round(100 - ((evacuationSeconds - TARGET_EVAC_SECONDS) / 30) * 5));

  // Comm lag: benchmark = 30s → A+ if ≤ 30s
  const TARGET_COMM_LAG = 30;
  const commScore = commLagSeconds == null ? 100
    : commLagSeconds <= TARGET_COMM_LAG ? 100
    : Math.max(40, Math.round(100 - ((commLagSeconds - TARGET_COMM_LAG) / 10) * 5));

  // Composite score: Accountability 30% · Task Mastery 30% · Evac Time 25% · Comm Lag 15%
  const compositeScore = Math.round(
    accountabilityPct * 0.30 +
    taskMasteryPct    * 0.30 +
    evacuationScore   * 0.25 +
    commScore         * 0.15
  );
  const resilienceGrade = letterGrade(compositeScore);

  // ── Auto-Remediation ──────────────────────────────────────────────────────────
  let autoRemediated = false;
  const ghostedEntries = [...drill.musterEntries.filter((e) => e.status === 'UNACCOUNTED'), ...drill.musterEntries.filter((e) => e.status === 'GHOSTED')];

  if (ghostedEntries.length > 0 && accountabilityPct < 100) {
    // Create a training record for each ghosted staff member
    for (const entry of ghostedEntries) {
      await prisma.trainingRecord.create({
        data: {
          facilityId:   session.user.facilityId,
          staffName:    entry.staffName,
          staffId:      null,
          department:   entry.department ?? 'Unassigned',
          jobTitle:     entry.staffRole  ?? null,
          trainingName: `${drill.drillType.replace(/_/g, ' ')} Evacuation Protocol Refresher`,
          category:     'EMERGENCY_MANAGEMENT',
          isRequired:   true,
          status:       'PENDING',
          expiryDate:   new Date(Date.now() + 48 * 60 * 60 * 1000), // 48-hour deadline
          notes:        `Auto-assigned: Staff was GHOSTED during "${drill.drillName}" drill on ${new Date().toLocaleDateString()}. Accountability score: ${accountabilityPct}%. Completion required within 48 hours per NyxCitadel remediation policy.`,
        },
      });
    }
    autoRemediated = true;
  }

  // ── Persist scorecard ─────────────────────────────────────────────────────────
  await prisma.drill.update({
    where: { id: params.id },
    data: {
      status:            'COMPLETED',
      drillEndedAt:      now,
      conductedDate:     drill.conductedDate ?? now,
      evacuationSeconds,
      accountabilityPct,
      taskMasteryPct,
      commLagSeconds:    commLagSeconds ?? 0,
      resilienceGrade,
      autoRemediated,
    },
  });

  return NextResponse.json({
    success:           true,
    resilienceGrade,
    compositeScore,
    evacuationSeconds,
    accountabilityPct,
    taskMasteryPct,
    commLagSeconds:    commLagSeconds ?? 0,
    ghostedCount:      ghostedEntries.length,
    autoRemediated,
    trainingAssigned:  ghostedEntries.length,
  });
}
