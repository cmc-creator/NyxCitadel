import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  BarChart2, Shield, FileBarChart, TrendingUp,
  AlertTriangle, CheckCircle2, ClipboardList, Activity, Radio,
} from 'lucide-react';
import ScrapeButton from '@/components/intelligence/ScrapeButton';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Intelligence' };

export default async function IntelligencePage() {
  const session = await auth();
  if (!session?.user) return null;
  const facilityId = session.user.facilityId;
  const userRole   = session.user.role;
  const canScrape  = ['ADMIN', 'COMPLIANCE_OFFICER'].includes(userRole);

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
    unreadRegUpdates,
  ] = await Promise.all([
    prisma.incident.count({ where: { facilityId, status: { not: 'CLOSED' } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.correctiveActionPlan.count({ where: { facilityId, status: 'OVERDUE' } }),
    prisma.riskAssessment.count({ where: { facilityId, overallRiskLevel: { in: ['CRITICAL', 'HIGH'] } } }),
    prisma.grievanceRecord.count({ where: { facilityId, status: { not: 'CLOSED' } } }),
    prisma.qapiProject.count({ where: { facilityId, status: { in: ['ACTIVE', 'MONITORING'] } } }),
    prisma.survey.count({ where: { facilityId, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } } }),
    prisma.regulatoryUpdate.count({ where: { isRead: false } }),
  ]);

  const stats = [
    { label: 'Open Incidents', value: openIncidents, icon: AlertTriangle, color: 'text-orange-400 bg-orange-950/40', href: '/trackers/incidents' },
    { label: 'Active CAPs', value: openCaps, icon: ClipboardList, color: 'text-blue-400 bg-blue-950/40', href: '/trackers/caps' },
    { label: 'Overdue CAPs', value: overdueCaps, icon: AlertTriangle, color: overdueCaps > 0 ? 'text-red-400 bg-red-950/40' : 'text-slate-400 bg-slate-800/40', href: '/trackers/caps' },
    { label: 'High/Critical Risks', value: criticalRisks, icon: Shield, color: criticalRisks > 0 ? 'text-red-400 bg-red-950/40' : 'text-slate-400 bg-slate-800/40', href: '/trackers/risk-assessments' },
    { label: 'Open Grievances', value: openGrievances, icon: Activity, color: 'text-purple-400 bg-purple-950/40', href: '/trackers/grievances' },
    { label: 'Active QAPI Projects', value: activeProjects, icon: TrendingUp, color: 'text-teal-400 bg-teal-950/40', href: '/quality/projects' },
  ];

  const views = [
    {
      href: '/resilience',
      title: 'Resilience Scorecard',
      description: 'Multi-domain compliance health scorecard with letter grades across incidents, CAPs, training, grievances, and surveys. Real-time risk intelligence.',
      icon: Shield,
      badge: null,
      color: 'border-purple-700/40 hover:border-purple-500',
      iconBg: 'bg-purple-950/40 text-purple-400',
    },
    {
      href: '/board-report',
      title: 'Board Compliance Report',
      description: 'Executive-level print-ready compliance summary for governing board presentations. 90-day rollup with incident trends, CAP status, and regulatory readiness.',
      icon: FileBarChart,
      badge: 'EXEC',
      color: 'border-emerald-700/40 hover:border-emerald-500',
      iconBg: 'bg-emerald-950/40 text-emerald-400',
    },
    {
      href: '/intelligence/updates',
      title: 'Regulatory Intelligence Feed',
      description: 'Live scraped updates from CMS, OSHA, DEA, HHS/OCR, AZ ADHS, and The Joint Commission — new rules, final regulations, enforcement notices, and more.',
      icon: Radio,
      badge: unreadRegUpdates > 0 ? `${unreadRegUpdates} new` : null,
      color: 'border-rose-700/40 hover:border-rose-500',
      iconBg: 'bg-rose-950/40 text-rose-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-purple-400" />
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
            className="bg-card border border-border rounded-xl px-4 py-3 hover:border-purple-500 transition-colors group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-foreground group-hover:text-purple-400 leading-none">
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
              className={`bg-card border rounded-xl p-6 flex items-start gap-4 transition-colors ${color}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-semibold text-foreground">{title}</p>
                  {badge && (
                    <span className="text-xs font-medium bg-emerald-950/40 text-emerald-400 rounded-full px-2 py-0.5">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
              <span className="text-slate-600 group-hover:text-slate-400 mt-1 text-lg">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Regulatory intelligence tools — admins only */}
      {canScrape && (
        <div className="bg-card border border-rose-700/30 rounded-xl px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-rose-400" />
                Regulatory Intelligence Feed
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Pull the latest rules, notices, and guidance from CMS, OSHA, DEA, HHS/OCR, AZ&nbsp;ADHS, and The Joint Commission.
                {unreadRegUpdates > 0 && (
                  <span className="ml-1.5 inline-flex items-center gap-0.5 bg-rose-950/40 text-rose-400 text-xs font-semibold rounded-full px-2 py-0.5">
                    {unreadRegUpdates} unread
                  </span>
                )}
              </p>
            </div>
            <ScrapeButton variant="primary" />
          </div>
        </div>
      )}

      {/* Upcoming surveys reminder */}
      {upcomingSurveys > 0 && (
        <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">
              {upcomingSurveys} upcoming survey{upcomingSurveys !== 1 ? 's' : ''} scheduled
            </p>
            <p className="text-xs text-amber-400 mt-0.5">
              Ensure all corrective actions and plans of correction are current before survey date.{' '}
              <Link href="/surveys" className="underline font-medium">View surveys →</Link>
            </p>
          </div>
        </div>
      )}

      {/* All-green when no overdue */}
      {overdueCaps === 0 && openIncidents === 0 && criticalRisks === 0 && (
        <div className="bg-emerald-950/30 border border-emerald-700/40 rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-300 font-medium">
            No overdue CAPs, open incidents, or critical risks — compliance standing is strong.
          </p>
        </div>
      )}
    </div>
  );
}
