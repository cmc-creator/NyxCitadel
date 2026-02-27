import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { scoreToGrade5, incidentScore, capScore, grievanceScore, grade12ToScore } from '@/lib/grading';
import {
  Shield,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  GraduationCap,
  ClipboardList,
  MessageSquareWarning,
} from 'lucide-react';

export const metadata = { title: 'Resilience Scorecard' };

// Helpers imported from @/lib/grading

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ResilienceScorecardPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const since60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  // Parallel data fetching
  const [trainingAll, trainingCompleted, recentIR, openCaps, openGrievances, openIR, facility, recentDrills] =
    await Promise.all([
      // All required training records – group by department
      prisma.trainingRecord.findMany({
        where: { facilityId, isRequired: true },
        select: { department: true, status: true },
      }),
      // Completed
      prisma.trainingRecord.count({
        where: { facilityId, isRequired: true, status: 'COMPLETED' },
      }),
      // IR last 60 days by unit
      prisma.incidentReport.findMany({
        where: { facilityId, incidentDate: { gte: since60 } },
        select: { unitName: true, incidentType: true, aiTriageSeverity: true },
      }),
      // Open CAPs
      prisma.correctiveActionPlan.count({
        where: { facilityId, status: { in: ['OPEN', 'IN_PROGRESS', 'OVERDUE'] } },
      }),
      // Open grievances
      prisma.grievanceRecord.count({
        where: { facilityId, status: { in: ['OPEN', 'UNDER_REVIEW', 'ACKNOWLEDGMENT_SENT', 'PENDING_RESOLUTION'] } },
      }),
      // All open IR
      prisma.incidentReport.count({
        where: { facilityId, status: { notIn: ['CLOSED'] } },
      }),
      prisma.facility.findUnique({ where: { id: facilityId }, select: { name: true } }),
      // Recent completed drills with grades
      prisma.drill.findMany({
        where: { facilityId, status: 'COMPLETED', resilienceGrade: { not: null } },
        select: { resilienceGrade: true, drillName: true, drillEndedAt: true },
        orderBy: { drillEndedAt: 'desc' },
        take: 6,
      }),
    ]);

  // ─── Department training breakdown ────────────────────────────────────────
  const deptMap = new Map<string, { total: number; completed: number }>();
  for (const r of trainingAll) {
    const key = r.department ?? 'Unassigned';
    const entry = deptMap.get(key) ?? { total: 0, completed: 0 };
    entry.total++;
    if (r.status === 'COMPLETED') entry.completed++;
    deptMap.set(key, entry);
  }

  // Drill average score
  const drillScores = recentDrills.map((d: any) => grade12ToScore(d.resilienceGrade ?? 'F'));
  const drillAvgScore = drillScores.length > 0
    ? Math.round(drillScores.reduce((a: number, b: number) => a + b, 0) / drillScores.length)
    : null;

  // IR counts by unitName
  const unitIRMap = new Map<string, number>();
  for (const ir of recentIR) {
    const key = ir.unitName ?? 'Unassigned';
    unitIRMap.set(key, (unitIRMap.get(key) ?? 0) + 1);
  }

  // Critical / High IR this period
  const criticalCount = recentIR.filter(
    (ir) => ir.aiTriageSeverity === 'CRITICAL' || ir.aiTriageSeverity === 'HIGH'
  ).length;

  // ─── Build department scorecards ─────────────────────────────────────────
  const departments = Array.from(deptMap.entries()).map(([dept, { total, completed }]) => {
    const trainingPct = total > 0 ? Math.round((completed / total) * 100) : 100;
    const irCount = unitIRMap.get(dept) ?? 0;
    const irPct = incidentScore(irCount);

    // Weighted score: Training 60%, IR 40% (dept-level, no CAP/grievance split at dept)
    const deptScore = Math.round(trainingPct * 0.6 + irPct * 0.4);
    const g = scoreToGrade5(deptScore);

    // Cascading risk: training < 70% → elevate emergency preparedness flag
    const emergencyRisk = trainingPct < 70;
    const warningFlag = trainingPct < 80;

    return { dept, total, completed, trainingPct, irCount, deptScore, grade: g, emergencyRisk, warningFlag };
  }).sort((a, b) => a.deptScore - b.deptScore); // Worst first

  // ─── Facility-wide composite score ────────────────────────────────────────
  const facilityTrainingPct = trainingAll.length > 0
    ? Math.round((trainingCompleted / trainingAll.length) * 100)
    : 100;
  const facilityIRScore     = incidentScore(recentIR.length);
  const facilityCapScore    = capScore(openCaps);
  const facilityGrvScore    = grievanceScore(openGrievances);

  // Weighted composite — includes drill performance when data exists
  // With drills: Training 35%, IR 25%, CAPs 20%, Grievances 10%, Drills 10%
  // Without drills: Training 40%, IR 30%, CAPs 20%, Grievances 10%
  const facilityScore = drillAvgScore != null
    ? Math.round(
        facilityTrainingPct * 0.35 +
        facilityIRScore     * 0.25 +
        facilityCapScore    * 0.20 +
        facilityGrvScore    * 0.10 +
        drillAvgScore       * 0.10
      )
    : Math.round(
        facilityTrainingPct * 0.40 +
        facilityIRScore     * 0.30 +
        facilityCapScore    * 0.20 +
        facilityGrvScore    * 0.10
      );
  const facilityGrade = scoreToGrade5(facilityScore);

  const cascadeDepts = departments.filter((d) => d.emergencyRisk);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Resilience Scorecard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Facility-wide compliance health — training gaps cascade into emergency readiness risk flags.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Rolling 60-day snapshot · {facility?.name}</span>
          {drillAvgScore != null && (
            <p className="text-xs text-slate-400 mt-0.5">Drill avg: <strong className="text-slate-600">{drillAvgScore}/100</strong> ({recentDrills.length} scored)</p>
          )}
        </div>
      </div>

      {/* Facility Score Banner */}
      <div className={`rounded-xl border-2 p-6 flex items-center justify-between ${facilityGrade.bg}`}>
        <div className="flex items-center gap-5">
          <div className={`text-6xl font-black ${facilityGrade.color}`}>{facilityGrade.label}</div>
          <div>
            <p className={`text-xl font-bold ${facilityGrade.color}`}>Facility Resilience Score: {facilityScore}/100</p>
            <p className="text-sm text-slate-600 mt-1">
              Training {facilityTrainingPct}% · Incidents (60d): {recentIR.length} · Open CAPs: {openCaps} · Open Grievances: {openGrievances}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
              <AlertTriangle className="w-3 h-3" /> {criticalCount} Critical/High IR
            </span>
          )}
          {cascadeDepts.length > 0 && (
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                <ShieldAlert className="w-3 h-3" /> {cascadeDepts.length} dept(s) below emergency training threshold
              </span>
            </div>
          )}
          {drillAvgScore != null && drillAvgScore < 70 && (
            <div>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                <AlertTriangle className="w-3 h-3" /> Drill performance below threshold ({drillAvgScore}/100)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cascading Risk Banner */}
      {cascadeDepts.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-800">Emergency Readiness Risk — Cascading Alert</p>
              <p className="text-sm text-red-700 mt-0.5">
                The following departments have training compliance below 70%, which elevates risk during emergency activations:
              </p>
              <ul className="mt-2 space-y-1">
                {cascadeDepts.map((d) => (
                  <li key={d.dept} className="text-sm text-red-700 flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5" />
                    <strong>{d.dept}</strong> — {d.trainingPct}% training compliance
                    ({d.completed}/{d.total} completed)
                  </li>
                ))}
              </ul>
              <p className="text-xs text-red-600 mt-2">
                Recommendation: Complete emergency management training before the next drill activation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<GraduationCap className="w-5 h-5 text-blue-600" />}
          label="Training Compliance"
          value={`${facilityTrainingPct}%`}
          sub={`${trainingCompleted} of ${trainingAll.length} required`}
          trend={facilityTrainingPct >= 90 ? 'good' : facilityTrainingPct >= 75 ? 'warn' : 'bad'}
        />
        <MetricCard
          icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
          label="Incidents (60d)"
          value={String(recentIR.length)}
          sub={`${openIR} total open`}
          trend={recentIR.length === 0 ? 'good' : recentIR.length <= 3 ? 'warn' : 'bad'}
        />
        <MetricCard
          icon={<ClipboardList className="w-5 h-5 text-purple-600" />}
          label="Open CAPs"
          value={String(openCaps)}
          sub="corrective action plans"
          trend={openCaps === 0 ? 'good' : openCaps <= 3 ? 'warn' : 'bad'}
        />
        <MetricCard
          icon={<MessageSquareWarning className="w-5 h-5 text-pink-600" />}
          label="Open Grievances"
          value={String(openGrievances)}
          sub="patient grievances"
          trend={openGrievances === 0 ? 'good' : openGrievances <= 2 ? 'warn' : 'bad'}
        />
      </div>

      {/* Department Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Department Health Breakdown
          </h2>
          <Link href="/trackers/training" className="text-xs text-indigo-600 hover:underline">
            View training records →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Department</th>
                <th className="px-4 py-3 text-center font-medium">Grade</th>
                <th className="px-4 py-3 text-center font-medium">Score</th>
                <th className="px-4 py-3 text-center font-medium">Training</th>
                <th className="px-4 py-3 text-center font-medium">IR (60d)</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-sm">
                    No training records found. Add training data to generate department scores.
                  </td>
                </tr>
              ) : (
                departments.map((d) => (
                  <tr key={d.dept} className={d.emergencyRisk ? 'bg-red-50' : ''}>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {d.dept}
                      {d.emergencyRisk && (
                        <span className="ml-2 text-xs text-red-600 font-normal">(emergency risk)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-lg font-black ${d.grade.color}`}>{d.grade.label}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${d.deptScore >= 80 ? 'bg-emerald-500' : d.deptScore >= 65 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${d.deptScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-8">{d.deptScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${d.trainingPct >= 80 ? 'text-emerald-700' : d.trainingPct >= 65 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {d.trainingPct}%
                      </span>
                      <span className="text-xs text-slate-400 ml-1">({d.completed}/{d.total})</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${d.irCount === 0 ? 'text-emerald-700' : d.irCount <= 2 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {d.irCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.emergencyRisk ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                          <XCircle className="w-3.5 h-3.5" /> High Risk
                        </span>
                      ) : d.warningFlag ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
                          <AlertTriangle className="w-3.5 h-3.5" /> Monitor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink href="/trackers/training" label="Manage Training" color="blue" />
        <QuickLink href="/trackers/ir-iad" label="View All IR" color="orange" />
        <QuickLink href="/trackers/caps" label="Open CAPs" color="purple" />
        <QuickLink href="/emergency/drills" label="View Drills" color="red" />
        <QuickLink href="/board-report" label="Board Report" color="indigo" />
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  icon, label, value, sub, trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  trend: 'good' | 'warn' | 'bad';
}) {
  const bg = trend === 'good' ? 'bg-emerald-50' : trend === 'warn' ? 'bg-yellow-50' : 'bg-red-50';
  const val = trend === 'good' ? 'text-emerald-700' : trend === 'warn' ? 'text-yellow-700' : 'text-red-700';
  const TrendIcon = trend === 'good' ? TrendingUp : trend === 'bad' ? TrendingDown : TrendingUp;

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <TrendIcon className={`w-4 h-4 ${val}`} />
      </div>
      <p className={`text-2xl font-bold ${val}`}>{value}</p>
      <p className="text-xs font-medium text-slate-700 mt-0.5">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </div>
  );
}

function QuickLink({ href, label, color }: { href: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-600 hover:bg-blue-700',
    orange: 'bg-orange-600 hover:bg-orange-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    red:    'bg-red-600 hover:bg-red-700',
  };
  return (
    <Link
      href={href}
      className={`${colors[color] ?? 'bg-slate-600 hover:bg-slate-700'} text-white text-sm font-medium text-center py-2.5 rounded-lg transition-colors`}
    >
      {label}
    </Link>
  );
}
