import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { PrintButton } from '@/components/ui/PrintButton';
import { ShieldCheck, AlertTriangle, ChevronRight, Award } from 'lucide-react';

function gradeToColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-600';
  if (grade.startsWith('B')) return 'text-blue-600';
  if (grade.startsWith('C')) return 'text-yellow-600';
  if (grade.startsWith('D')) return 'text-orange-600';
  return 'text-red-600';
}

function gradeScore(grade: string): number {
  const map: Record<string, number> = {
    'A+': 98, A: 94, 'A-': 91,
    'B+': 88, B: 84, 'B-': 81,
    'C+': 78, C: 74, 'C-': 71,
    'D+': 68, D: 61, F: 50,
  };
  return map[grade] ?? 0;
}

function scoreToGrade(score: number): string {
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

function formatTime(seconds: number | null | undefined): string {
  if (seconds == null) return 'N/A';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default async function DrillScorecardPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const drill = await prisma.drill.findUnique({
    where: { id: params.id },
    include: {
      killTasks: true,
      musterEntries: true,
      facility: { select: { name: true } },
    },
  });

  if (!drill) notFound();

  const ghostedStaff = drill.musterEntries.filter((e: any) => e.status === 'GHOSTED');
  const presentStaff = drill.musterEntries.filter((e: any) => e.status === 'PRESENT');

  // Re-derive metric grades
  const evacuationScore = drill.evacuationSeconds != null
    ? drill.evacuationSeconds <= 240
      ? 100
      : Math.max(40, 100 - Math.floor((drill.evacuationSeconds - 240) / 30) * 5)
    : null;

  const commScore = drill.commLagSeconds != null
    ? drill.commLagSeconds <= 30
      ? 100
      : Math.max(40, 100 - Math.floor((drill.commLagSeconds - 30) / 10) * 5)
    : null;

  const rows = [
    {
      metric: 'Total Evacuation Time',
      weight: '25%',
      goal: '< 4:00',
      actual: formatTime(drill.evacuationSeconds ?? null),
      rawScore: evacuationScore,
      grade: evacuationScore != null ? scoreToGrade(evacuationScore) : '—',
    },
    {
      metric: 'Staff Accountability',
      weight: '30%',
      goal: '100%',
      actual: drill.accountabilityPct != null ? `${drill.accountabilityPct.toFixed(1)}%` : 'N/A',
      rawScore: drill.accountabilityPct ?? null,
      grade: drill.accountabilityPct != null ? scoreToGrade(drill.accountabilityPct) : '—',
    },
    {
      metric: 'Critical Task Mastery',
      weight: '30%',
      goal: '100%',
      actual: drill.taskMasteryPct != null ? `${drill.taskMasteryPct.toFixed(1)}%` : 'N/A',
      rawScore: drill.taskMasteryPct ?? null,
      grade: drill.taskMasteryPct != null ? scoreToGrade(drill.taskMasteryPct) : '—',
    },
    {
      metric: 'Comm Response Lag',
      weight: '15%',
      goal: '< 30s',
      actual: drill.commLagSeconds != null ? `${drill.commLagSeconds}s` : 'N/A',
      rawScore: commScore,
      grade: commScore != null ? scoreToGrade(commScore) : '—',
    },
  ];

  const finalGrade = drill.resilienceGrade ?? '—';

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start print:mb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Link href="/emergency/drills" className="hover:underline print:hidden">Drills</Link>
            <ChevronRight className="w-3 h-3 print:hidden" />
            <Link href={`/emergency/drills/${params.id}`} className="hover:underline print:hidden">{drill.drillType}</Link>
            <span className="print:hidden"><ChevronRight className="w-3 h-3 inline" /></span>
            <span>Resilience Scorecard</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Resilience Report Card
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {drill.drillType} — {drill.facility.name} —{' '}
            {drill.drillEndedAt
              ? new Date(drill.drillEndedAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })
              : 'In Progress'}
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Auto-remediation banner */}
      {drill.autoRemediated && ghostedStaff.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-orange-800 text-sm">Auto-Remediation Triggered</p>
            <p className="text-sm text-orange-700 mt-0.5">
              Drill underperformance detected. Automated &ldquo;Evacuation Protocol&rdquo; refresher training
              has been assigned to{' '}
              <strong>{ghostedStaff.length} &ldquo;Ghosted&rdquo; employee{ghostedStaff.length !== 1 ? 's' : ''}</strong>
              : {ghostedStaff.map((g: any) => g.staffName).join(', ')}.{' '}
              <strong>Deadline: 48 hours.</strong>
            </p>
          </div>
        </div>
      )}

      {/* Overall grade */}
      <div className="bg-slate-900 rounded-2xl p-6 flex items-center gap-6 text-white">
        <div className="text-center">
          <Award className="w-8 h-8 text-yellow-400 mx-auto mb-1" />
          <p className="text-xs text-slate-400 uppercase tracking-wide">Overall</p>
          <p
            className={`text-7xl font-black leading-none mt-1 ${
              finalGrade.startsWith('A')
                ? 'text-emerald-400'
                : finalGrade.startsWith('B')
                ? 'text-blue-400'
                : finalGrade.startsWith('C')
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {finalGrade}
          </p>
          <p className="text-xs text-slate-400 mt-1">Resilience Grade</p>
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-slate-300 text-sm font-medium">Composite Score Breakdown</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Chip label="Staff Accountability" pct={drill.accountabilityPct} weight={30} />
            <Chip label="Task Mastery" pct={drill.taskMasteryPct} weight={30} />
            <Chip label="Evacuation Speed" pct={evacuationScore} weight={25} />
            <Chip label="Comm Response" pct={commScore} weight={15} />
          </div>
        </div>
      </div>

      {/* Scorecard table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-slate-600">Drill Metric</th>
              <th className="text-center px-3 py-3 font-semibold text-slate-600">Weight</th>
              <th className="text-center px-3 py-3 font-semibold text-slate-600">Goal</th>
              <th className="text-center px-3 py-3 font-semibold text-slate-600">Actual</th>
              <th className="text-center px-3 py-3 font-semibold text-slate-600">Performance Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.metric} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-800">{row.metric}</td>
                <td className="px-3 py-4 text-center text-slate-500">{row.weight}</td>
                <td className="px-3 py-4 text-center text-slate-500">{row.goal}</td>
                <td className="px-3 py-4 text-center font-semibold text-slate-800">{row.actual}</td>
                <td className="px-3 py-4 text-center">
                  <span className={`text-xl font-black ${gradeToColor(row.grade)}`}>{row.grade}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Muster detail */}
      {drill.musterEntries.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <p className="font-semibold text-slate-700 text-sm">Staff Accountability Detail</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {presentStaff.length} Accounted · {ghostedStaff.length} Ghosted ·{' '}
              {drill.musterEntries.filter((e: any) => e.status === 'EXCUSED').length} Excused ·{' '}
              {drill.musterEntries.filter((e: any) => e.status === 'UNACCOUNTED').length} Unaccounted
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {drill.musterEntries.map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{entry.staffName}</p>
                  {entry.staffRole && <p className="text-xs text-slate-400">{entry.staffRole}</p>}
                </div>
                <StatusBadge status={entry.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kill task detail */}
      {drill.killTasks.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <p className="font-semibold text-slate-700 text-sm">Critical Task Detail</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {drill.killTasks.filter((t: any) => t.completedAt && !t.isMissed).length} On-Time ·{' '}
              {drill.killTasks.filter((t: any) => t.isMissed).length} Missed
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {drill.killTasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-800">{task.taskName}</p>
                  <p className="text-xs text-slate-400">{task.locationLabel} · {task.assignedRole}</p>
                </div>
                <div className="text-right">
                  {task.completedAt && !task.isMissed ? (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">COMPLETE</span>
                  ) : task.isMissed ? (
                    <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">MISSED</span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">N/A</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex gap-3 print:hidden">
        <Link
          href={`/emergency/drills/${params.id}/aar`}
          className="flex-1 text-center border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl text-sm transition-colors"
        >
          View Full AAR
        </Link>
        <Link
          href={`/emergency/drills/${params.id}`}
          className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl text-sm transition-colors"
        >
          Back to War Room
        </Link>
      </div>
    </div>
  );
}

function Chip({ label, pct, weight }: { label: string; pct: number | null; weight: number }) {
  return (
    <div className="bg-slate-800 rounded-lg px-3 py-1.5 flex justify-between items-center gap-2">
      <span className="text-slate-400 text-xs truncate">{label}</span>
      <span className="text-white font-bold text-xs whitespace-nowrap">
        {pct != null ? `${pct.toFixed(0)}%` : '—'} <span className="text-slate-500">·{weight}%</span>
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PRESENT: 'bg-emerald-100 text-emerald-700',
    GHOSTED: 'bg-red-100 text-red-700',
    EXCUSED: 'bg-blue-100 text-blue-700',
    UNACCOUNTED: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}
