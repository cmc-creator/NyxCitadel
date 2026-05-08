import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ShieldAlert, Plus, ClipboardCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Risk Assessments' };

const TYPE_LABELS: Record<string, string> = {
  ANNUAL_PROACTIVE: 'Annual Proactive (LD.04.04.01)',
  INFECTION_CONTROL: 'Infection Control (ICRA)',
  SECURITY: 'Security Risk Assessment',
  MEDICATION: 'Medication Management',
  CLINICAL_PROCESS: 'Clinical Process (FMEA)',
  EMERGENCY_MANAGEMENT: 'Emergency Management',
  IT_SECURITY: 'IT / HIPAA Security',
  ENVIRONMENT_OF_CARE: 'Environment of Care',
  CONSTRUCTION: 'Construction ICRA',
  OTHER: 'Other',
};

const LEVEL_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
};

const STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-950/20 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  REVIEWED: 'bg-teal-950/20 text-teal-700',
  APPROVED: 'bg-emerald-950/20 text-emerald-700',
  ARCHIVED: 'bg-slate-100 text-slate-500',
};

export default async function RiskAssessmentsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const assessments = await prisma.riskAssessment.findMany({
    where: { facilityId },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Types that are annually required
  const requiredTypes = ['ANNUAL_PROACTIVE', 'INFECTION_CONTROL', 'IT_SECURITY', 'SECURITY'];
  const thisYear = new Date().getFullYear();
  const completedTypesThisYear = new Set(
    assessments
      .filter(a => a.conductedDate && new Date(a.conductedDate).getFullYear() === thisYear)
      .map(a => a.assessmentType)
  );
  const missingRequired = requiredTypes.filter(t => !completedTypesThisYear.has(t as any));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-teal-600" />
            Risk Assessments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            JC LD.04.04.01 · CMS 42 CFR 482.21 · AZ ADHS A.A.C. R9-10
          </p>
        </div>
        <Link
          href="/trackers/risk-assessments/new"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Assessment
        </Link>
      </div>

      {/* Missing required assessments banner */}
      {missingRequired.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Required assessments not yet completed for {thisYear}:</p>
            <ul className="mt-1 space-y-0.5">
              {missingRequired.map(t => (
                <li key={t} className="text-sm text-amber-700">
                  • {TYPE_LABELS[t]}
                </li>
              ))}
            </ul>
            <Link href="/trackers/risk-assessments/new" className="inline-block mt-2 text-xs font-medium text-amber-700 underline">
              Start a new assessment →
            </Link>
          </div>
        </div>
      )}

      {/* Required types grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {requiredTypes.map(t => {
          const done = completedTypesThisYear.has(t as any);
          return (
            <div key={t} className={`rounded-xl border p-3 ${done ? 'bg-green-500/10 border-green-500/20' : 'bg-card border-border'}`}>
              {done ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mb-1" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500 mb-1" />
              )}
              <p className="text-xs font-medium text-foreground/80 leading-snug">{TYPE_LABELS[t]}</p>
              <p className={`text-xs mt-0.5 font-semibold ${done ? 'text-green-600' : 'text-amber-600'}`}>
                {done ? `✓ ${thisYear} complete` : `${thisYear} pending`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Assessment list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-foreground">All Risk Assessments</h2>
        </div>
        {assessments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/70">
            <ClipboardCheck className="w-12 h-12 mb-3 text-slate-300" />
            <p className="text-sm font-medium">No risk assessments yet</p>
            <p className="text-xs mt-1">Create your first annual proactive risk assessment</p>
            <Link href="/trackers/risk-assessments/new" className="mt-4 text-sm text-teal-600 hover:underline font-medium">
              + New Assessment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {assessments.map((a) => (
              <Link key={a.id} href={`/trackers/risk-assessments/${a.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    {a.overallRiskLevel && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${LEVEL_COLORS[a.overallRiskLevel] ?? ''}`}>
                        {a.overallRiskLevel} RISK
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {TYPE_LABELS[a.assessmentType] ?? a.assessmentType}
                    {a.scope && ` · ${a.scope}`}
                    {a.conductedDate && ` · ${formatDate(a.conductedDate, 'MMM d, yyyy')}`}
                    {a.conductedBy && ` · ${a.conductedBy}`}
                  </p>
                  {a.nextReviewDate && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      Next review: {formatDate(a.nextReviewDate, 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-500">{a._count.items} risks</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[a.status] ?? ''}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
