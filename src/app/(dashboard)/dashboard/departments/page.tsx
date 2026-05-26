import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart2, Users, BookOpen, AlertTriangle, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Department Scorecards' };

export default async function DepartmentScorecardsPage() {
  const session = await auth();
  if (!session?.user?.facilityId) redirect('/login');

  const facilityId = session.user.facilityId;

  const [users, trainingRecords] = await Promise.all([
    prisma.user.findMany({
      where: { facilityId, isActive: true },
      select: { department: true },
    }),
    prisma.trainingRecord.findMany({
      where: { facilityId, department: { not: null } },
      select: { department: true, status: true, isRequired: true },
    }),
  ]);

  type DeptStats = {
    userCount: number;
    trainingTotal: number;
    trainingCompleted: number;
    trainingOverdue: number;
    trainingRequired: number;
    trainingRequiredCompleted: number;
  };

  const deptMap: Record<string, DeptStats> = {};

  function ensureDept(d: string) {
    if (!deptMap[d]) {
      deptMap[d] = {
        userCount: 0,
        trainingTotal: 0,
        trainingCompleted: 0,
        trainingOverdue: 0,
        trainingRequired: 0,
        trainingRequiredCompleted: 0,
      };
    }
    return deptMap[d];
  }

  for (const u of users) {
    const d = u.department ?? 'Unassigned';
    ensureDept(d).userCount++;
  }

  for (const t of trainingRecords) {
    const d = t.department!;
    const s = ensureDept(d);
    s.trainingTotal++;
    if (t.status === 'COMPLETED') s.trainingCompleted++;
    if (t.status === 'OVERDUE' || t.status === 'EXPIRED') s.trainingOverdue++;
    if (t.isRequired) {
      s.trainingRequired++;
      if (t.status === 'COMPLETED') s.trainingRequiredCompleted++;
    }
  }

  const departments = Object.entries(deptMap)
    .filter(([name]) => name !== 'Unassigned')
    .map(([name, stats]) => ({
      name,
      ...stats,
      complianceRate:
        stats.trainingTotal > 0
          ? Math.round((stats.trainingCompleted / stats.trainingTotal) * 100)
          : null,
      requiredRate:
        stats.trainingRequired > 0
          ? Math.round((stats.trainingRequiredCompleted / stats.trainingRequired) * 100)
          : null,
    }))
    .sort((a, b) => {
      const ra = a.complianceRate ?? 101;
      const rb = b.complianceRate ?? 101;
      return ra - rb;
    });

  const overallTotal = trainingRecords.length;
  const overallCompleted = trainingRecords.filter((t) => t.status === 'COMPLETED').length;
  const overallRate = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-teal-400" />
            Department Scorecards
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Training compliance breakdown by department
          </p>
        </div>
        {overallRate !== null && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Facility-wide</p>
            <p className={`text-3xl font-bold ${overallRate >= 90 ? 'text-emerald-400' : overallRate >= 75 ? 'text-yellow-400' : 'text-red-400'}`}>
              {overallRate}%
            </p>
            <p className="text-xs text-muted-foreground">{overallCompleted}/{overallTotal} completed</p>
          </div>
        )}
      </div>

      {departments.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground/70">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="font-medium">No department data found.</p>
          <p className="text-sm mt-1">Assign departments to users and training records to see scorecards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const rate = dept.complianceRate;
            const rateColor =
              rate === null ? 'text-muted-foreground'
              : rate >= 90 ? 'text-emerald-400'
              : rate >= 75 ? 'text-yellow-400'
              : 'text-red-400';
            const barColor =
              rate === null ? 'bg-slate-600'
              : rate >= 90 ? 'bg-emerald-500'
              : rate >= 75 ? 'bg-yellow-500'
              : 'bg-red-500';
            const borderColor =
              rate === null ? 'border-border'
              : rate >= 90 ? 'border-emerald-800/40'
              : rate >= 75 ? 'border-yellow-800/40'
              : 'border-red-800/40';

            return (
              <div
                key={dept.name}
                className={`bg-card border ${borderColor} rounded-xl p-5 space-y-4`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{dept.name}</h3>
                  {dept.userCount > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Users className="w-3 h-3" /> {dept.userCount} staff
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Training Compliance</span>
                    <span className={`text-2xl font-bold ${rateColor}`}>
                      {rate !== null ? `${rate}%` : '\u2014'}
                    </span>
                  </div>
                  {dept.trainingTotal > 0 && (
                    <div className="w-full bg-slate-700/40 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${barColor}`}
                        style={{ width: `${rate ?? 0}%` }}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/70 flex-wrap">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {dept.trainingCompleted}/{dept.trainingTotal} completed
                    </span>
                    {dept.trainingRequired > 0 && (
                      <span>
                        {dept.trainingRequiredCompleted}/{dept.trainingRequired} required
                      </span>
                    )}
                    {dept.trainingOverdue > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        {dept.trainingOverdue} overdue
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/education/training?department=${encodeURIComponent(dept.name)}`}
                  className="block text-center text-xs text-teal-400 hover:text-teal-300 border border-teal-800/40 hover:border-teal-600/60 rounded-lg py-1.5 transition-colors"
                >
                  View training records
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
