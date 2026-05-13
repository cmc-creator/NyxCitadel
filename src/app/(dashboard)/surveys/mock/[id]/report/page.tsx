import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CHAPTER_LABELS } from '@/lib/jc-standards';
import { BulkCreatePocsButton } from '@/components/mock-survey/bulk-create-pocs-button';

export const dynamic = 'force-dynamic';

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props) {
  const survey = await prisma.mockSurvey.findFirst({ where: { id: params.id }, select: { title: true } });
  return { title: survey ? `Report: ${survey.title}` : 'Survey Report' };
}

export default async function SurveyReportPage({ params }: Props) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const survey = await prisma.mockSurvey.findFirst({
    where: { id: params.id, facilityId },
    include: {
      findings: { orderBy: [{ chapter: 'asc' }, { standardRef: 'asc' }, { epNumber: 'asc' }] },
    },
  });

  if (!survey) notFound();

  const notMetFindings = survey.findings.filter(f => f.score === 'NOT_MET');
  const metFindings    = survey.findings.filter(f => f.score === 'MET');
  const scored         = notMetFindings.length + metFindings.length;
  const pct            = scored > 0 ? Math.round((metFindings.length / scored) * 100) : null;

  // Group not-met by chapter
  const byChapter = new Map<string, typeof notMetFindings>();
  notMetFindings.forEach(f => {
    const arr = byChapter.get(f.chapter) ?? [];
    arr.push(f);
    byChapter.set(f.chapter, arr);
  });

  const TYPE_LABELS: Record<string, string> = {
    JC_FULL: 'JC Full Survey', JC_FOCUSED: 'JC Focused',
    JC_DISEASE_SPECIFIC: 'JC Disease-Specific', CMS_CONDITION_LEVEL: 'CMS Condition Level',
    ADHS_LICENSING: 'ADHS Licensing', INTERNAL_AUDIT: 'Internal Audit',
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between print:hidden">
        <div>
          <Link href={`/surveys/mock/${survey.id}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-foreground mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tracer
          </Link>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-400" />
            Findings Report
          </h1>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden inline-flex items-center gap-1.5 px-3 py-2 border border-border text-slate-300 hover:text-foreground text-sm rounded-lg transition-colors"
        >
          Print / Export PDF
        </button>
      </div>

      {/* Report header block */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-1">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{survey.title}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {TYPE_LABELS[survey.surveyType]} &middot; Date: {formatDate(survey.scheduledDate)}
              {survey.surveyorName && ` · Surveyor: ${survey.surveyorName}`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chapters: {survey.chaptersScoped.join(', ')}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${
              pct === null ? 'text-muted-foreground' :
              pct >= 80 ? 'text-green-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {pct !== null ? `${pct}%` : '—'}
            </div>
            <div className="text-xs text-muted-foreground">Overall Compliance</div>
          </div>
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{metFindings.length}</div>
            <div className="text-xs text-muted-foreground">Met</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{notMetFindings.length}</div>
            <div className="text-xs text-muted-foreground">Not Met</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{survey.naCount}</div>
            <div className="text-xs text-muted-foreground">N/A</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{survey.findings.filter(f => f.score === 'NOT_EVALUATED').length}</div>
            <div className="text-xs text-muted-foreground">Not Evaluated</div>
          </div>
        </div>
      </div>

      {/* Not Met Findings */}
      {notMetFindings.length === 0 ? (
        <div className="bg-green-950/30 border border-green-800 rounded-xl p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
          <p className="text-green-300 font-semibold">No findings — all scored EPs met!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Not Met Findings ({notMetFindings.length})
            </h2>
            <BulkCreatePocsButton surveyId={survey.id} surveyTitle={survey.title} notMetCount={notMetFindings.length} />
          </div>

          {Array.from(byChapter.entries()).map(([chapter, items]) => (
            <div key={chapter} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-red-950/20 border-b border-border flex items-center justify-between">
                <div>
                  <span className="font-mono text-red-400 font-semibold text-sm">{chapter}</span>
                  <span className="text-slate-400 text-sm ml-2">{CHAPTER_LABELS[chapter] ?? chapter}</span>
                </div>
                <span className="text-red-400 text-xs font-medium">{items.length} finding{items.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-border">
                {items.map(f => (
                  <div key={f.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-mono text-xs text-teal-400">{f.standardRef} {f.epNumber}</div>
                        <div className="text-sm text-slate-300 mt-1 leading-relaxed">{f.epText}</div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-red-400 font-medium">Not Met</span>
                        {f.pocCreated && (
                          <Link href={f.pocId ? `/quality/poc/${f.pocId}` : '/quality/poc'} className="text-xs text-teal-400 hover:underline">
                            POC →
                          </Link>
                        )}
                      </div>
                    </div>

                    {f.surveyorNotes && (
                      <div className="bg-slate-900/50 rounded p-2 text-xs text-slate-400">
                        <span className="font-medium text-muted-foreground">Notes: </span>{f.surveyorNotes}
                      </div>
                    )}
                    {f.evidence && (
                      <div className="bg-slate-900/50 rounded p-2 text-xs text-slate-400">
                        <span className="font-medium text-muted-foreground">Evidence: </span>{f.evidence}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Met findings summary */}
      {metFindings.length > 0 && (
        <details className="bg-card border border-border rounded-xl">
          <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-slate-400 hover:text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            Met Findings ({metFindings.length}) — click to expand
          </summary>
          <div className="px-4 pb-4">
            <div className="divide-y divide-border">
              {metFindings.map(f => (
                <div key={f.id} className="py-2 flex items-center gap-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="font-mono text-xs text-teal-400">{f.standardRef} {f.epNumber}</span>
                  <span className="text-xs text-slate-400 flex-1">{f.epText}</span>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
