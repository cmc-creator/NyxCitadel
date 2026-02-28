import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  BarChart2, Shield, FileBarChart, TrendingUp,
  AlertTriangle, CheckCircle2, ClipboardList, Activity,
} from 'lucide-react';

export const metadata = { title: 'Intelligence' };

export default async function IntelligencePage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [
    openIncidents,
    openCaps,
    overdueCaps,
    criticalRisks,
    openGrievances,
    activeProjects,
    upcomingSurveys,
  ] = await Promise.all([
    prisma.incident.count({ where: { facilityId, status: { not: 'CLOSED' } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: 'OVERDUE' } }),
    prisma.riskAssessment.count({ where: { facilityId, overallRiskLevel: { in: ['CRITICAL', 'HIGH'] } } }),
    prisma.grievanceRecord.count({ where: { facilityId, status: { not: 'CLOSED' } } }),
    prisma.qapiProject.count({ where: { facilityId, status: { in: ['ACTIVE', 'MONITORING'] } } }),
    prisma.survey.count({ where: { facilityId, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } } }),
  ]);

  const stats = [
    { label: 'Open Incidents', value: openIncidents, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50', href: '/trackers/incidents' },
    { label: 'Active CAPs', value: openCaps, icon: ClipboardList, color: 'text-blue-600 bg-blue-50', href: '/trackers/caps' },
    { label: 'Overdue CAPs', value: overdueCaps, icon: AlertTriangle, color: overdueCaps > 0 ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50', href: '/trackers/caps' },
    { label: 'High/Critical Risks', value: criticalRisks, icon: Shield, color: criticalRisks > 0 ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50', href: '/trackers/risk-assessments' },
    { label: 'Open Grievances', value: openGrievances, icon: Activity, color: 'text-purple-600 bg-purple-50', href: '/trackers/grievances' },
    { label: 'Active QAPI Projects', value: activeProjects, icon: TrendingUp, color: 'text-teal-600 bg-teal-50', href: '/quality/projects' },
  ];

  const views = [
    {
      href: '/resilience',
      title: 'Resilience Scorecard',
      description: 'Multi-domain compliance health scorecard with letter grades across incidents, CAPs, training, grievances, and surveys. Real-time risk intelligence.',
      icon: Shield,
      badge: null,
      color: 'border-purple-200 hover:border-purple-400',
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      href: '/board-report',
      title: 'Board Compliance Report',
      description: 'Executive-level print-ready compliance summary for governing board presentations. 90-day rollup with incident trends, CAP status, and regulatory readiness.',
      icon: FileBarChart,
      badge: 'EXEC',
      color: 'border-emerald-200 hover:border-emerald-400',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-purple-600" />
          Intelligence
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Compliance analytics, risk intelligence, and executive reporting.
        </p>
      </div>

      {/* Live KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-purple-300 transition-colors group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900 group-hover:text-purple-700 leading-none">
              {value}
            </p>
            <p className="text-xs text-slate-500 mt-1 leading-tight">{label}</p>
          </Link>
        ))}
      </div>

      {/* View cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Reports & Scorecards</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {views.map(({ href, title, description, icon: Icon, badge, color, iconBg }) => (
            <Link
              key={href}
              href={href}
              className={`bg-white border rounded-xl p-6 flex items-start gap-4 transition-colors ${color}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-semibold text-slate-900">{title}</p>
                  {badge && (
                    <span className="text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
              <span className="text-slate-300 group-hover:text-slate-500 mt-1 text-lg">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming surveys reminder */}
      {upcomingSurveys > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {upcomingSurveys} upcoming survey{upcomingSurveys !== 1 ? 's' : ''} scheduled
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Ensure all corrective actions and plans of correction are current before survey date.{' '}
              <Link href="/surveys" className="underline font-medium">View surveys →</Link>
            </p>
          </div>
        </div>
      )}

      {/* All-green when no overdue */}
      {overdueCaps === 0 && openIncidents === 0 && criticalRisks === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">
            No overdue CAPs, open incidents, or critical risks — compliance standing is strong.
          </p>
        </div>
      )}
    </div>
  );
}
