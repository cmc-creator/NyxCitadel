import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ClipboardCheck, Plus, CheckCircle2, Clock, ListChecks } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mock Surveys' };

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  SCHEDULED:        { label: 'Scheduled',       cls: 'bg-blue-900/40 text-blue-300' },
  IN_PROGRESS:      { label: 'In Progress',     cls: 'bg-yellow-900/40 text-yellow-300' },
  COMPLETED:        { label: 'Completed',        cls: 'bg-green-900/40 text-green-300' },
  REPORT_GENERATED: { label: 'Report Ready',    cls: 'bg-teal-900/40 text-teal-300' },
};

const TYPE_LABELS: Record<string, string> = {
  JC_FULL:              'JC Full Survey',
  JC_FOCUSED:           'JC Focused Survey',
  JC_DISEASE_SPECIFIC:  'JC Disease-Specific',
  CMS_CONDITION_LEVEL:  'CMS Condition Level',
  ADHS_LICENSING:       'ADHS Licensing',
  INTERNAL_AUDIT:       'Internal Audit',
};

export default async function MockSurveyListPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const surveys = await prisma.mockSurvey.findMany({
    where: { facilityId },
    include: { findings: { select: { score: true } } },
    orderBy: { scheduledDate: 'desc' },
  });

  const scheduled   = surveys.filter(s => s.status === 'SCHEDULED').length;
  const inProgress  = surveys.filter(s => s.status === 'IN_PROGRESS').length;
  const complete    = surveys.filter(s => ['COMPLETED', 'REPORT_GENERATED'].includes(s.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-teal-400" />
            Mock Surveys
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Chapter-by-chapter tracer tool — score each Element of Performance, generate findings reports, and link deficiencies to the POC tracker.
          </p>
        </div>
        <Link
          href="/surveys/mock/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Mock Survey
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-foreground">{scheduled}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <ListChecks className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-foreground">{inProgress}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-foreground">{complete}</p>
          </div>
        </div>
      </div>

      {/* Survey table */}
      {surveys.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No mock surveys yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create your first mock survey to begin chapter-by-chapter EP scoring.
          </p>
          <Link
            href="/surveys/mock/new"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Mock Survey
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-900/40">
                <th className="text-left p-3 text-slate-400 font-medium">Title</th>
                <th className="text-left p-3 text-slate-400 font-medium">Type</th>
                <th className="text-left p-3 text-slate-400 font-medium">Date</th>
                <th className="text-left p-3 text-slate-400 font-medium">Chapters</th>
                <th className="text-left p-3 text-slate-400 font-medium">Score</th>
                <th className="text-left p-3 text-slate-400 font-medium">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey, i) => {
                const metCount    = survey.findings.filter(f => f.score === 'MET').length;
                const notMetCount = survey.findings.filter(f => f.score === 'NOT_MET').length;
                const scored      = metCount + notMetCount;
                const pct         = scored > 0 ? Math.round((metCount / scored) * 100) : null;
                const cfg         = STATUS_CONFIG[survey.status] ?? STATUS_CONFIG.SCHEDULED;

                return (
                  <tr key={survey.id} className={`border-b border-border last:border-0 hover:bg-slate-800/30 transition-colors ${i % 2 === 1 ? 'bg-slate-900/20' : ''}`}>
                    <td className="p-3 font-medium text-foreground">{survey.title}</td>
                    <td className="p-3 text-slate-400">{TYPE_LABELS[survey.surveyType] ?? survey.surveyType}</td>
                    <td className="p-3 text-slate-400">{formatDate(survey.scheduledDate)}</td>
                    <td className="p-3 text-slate-400">{survey.chaptersScoped.join(', ')}</td>
                    <td className="p-3">
                      {pct !== null ? (
                        <span className={`font-semibold ${pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {pct}% <span className="text-xs text-muted-foreground font-normal">({metCount}/{scored})</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/surveys/mock/${survey.id}`}
                        className="text-teal-400 hover:text-teal-300 text-xs font-medium"
                      >
                        Open Tracer →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
