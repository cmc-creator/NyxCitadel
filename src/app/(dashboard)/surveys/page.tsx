import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ClipboardList, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SatisfactionPushButton } from '@/components/surveys/satisfaction-push-button';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Surveys & Inspections' };

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  SCHEDULED:          { label: 'Scheduled',          class: 'status-badge-blue'   },
  IN_PROGRESS:        { label: 'In Progress',         class: 'status-badge-yellow' },
  COMPLETED:          { label: 'Completed',           class: 'status-badge-green'  },
  RESPONSE_DUE:       { label: 'Response Due',        class: 'status-badge-orange' },
  RESPONSE_SUBMITTED: { label: 'Response Submitted',  class: 'status-badge-purple' },
  CLOSED:             { label: 'Closed',              class: 'status-badge-gray'   },
};

export default async function SurveysPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const surveys = await prisma.survey.findMany({
    where: { facilityId },
    orderBy: { createdAt: 'desc' },
  });

  const total       = surveys.length;
  const open        = surveys.filter(s => !['COMPLETED', 'CLOSED'].includes(s.status)).length;
  const responseDue = surveys.filter(s => s.status === 'RESPONSE_DUE').length;
  const complete    = surveys.filter(s => ['COMPLETED', 'CLOSED'].includes(s.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-purple-400" />
            Surveys &amp; Inspections
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track regulatory surveys, mock surveys, fire inspections, and ADHS visits.
          </p>
        </div>
        <a
          href="/surveys/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          + Add Survey
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Surveys',  value: total,       icon: ClipboardList, color: 'text-slate-400',  bg: 'bg-slate-800/40'   },
          { label: 'Open / Active',  value: open,        icon: Clock,         color: 'text-blue-400',  bg: 'bg-blue-950/40'    },
          { label: 'Response Due',   value: responseDue, icon: AlertTriangle, color: 'text-orange-400',bg: 'bg-orange-950/40'  },
          { label: 'Completed',      value: complete,    icon: CheckCircle2,  color: 'text-green-400', bg: 'bg-green-950/40'   },
        ].map(card => (
          <div key={card.label} className={cn('rounded-xl border border-border p-5 flex items-start gap-4', card.bg)}>
            <card.icon className={cn('w-5 h-5 mt-0.5', card.color)} />
            <div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardList className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No surveys recorded yet.</p>
            <a href="/surveys/new" className="mt-3 text-sm text-purple-400 hover:underline">Add your first survey</a>
          </div>
        ) : (
          <table className="data-table">
            <thead className="data-table-head">
              <tr>
                <th className="data-table-th">Survey Type</th>
                <th className="data-table-th">Regulatory Body</th>
                <th className="data-table-th">Conducted Date</th>
                <th className="data-table-th">Status</th>
                <th className="data-table-th">Findings</th>
                <th className="data-table-th">Response Deadline</th>
                <th className="data-table-th">Flags</th>
                <th className="data-table-th">Satisfaction → QAPI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {surveys.map(survey => {
                const cfg = STATUS_CONFIG[survey.status] ?? { label: survey.status, class: 'status-badge-gray' };
                return (
                  <tr key={survey.id} className="data-table-row cursor-pointer">
                    <td className="data-table-td font-medium text-foreground">
                      <Link href={`/surveys/${survey.id}`} className="hover:underline">{survey.surveyType.replace(/_/g, ' ')}</Link>
                    </td>
                    <td className="data-table-td text-slate-600">{survey.regulatoryBody.replace(/_/g, ' ')}</td>
                    <td className="data-table-td text-slate-600">
                      {survey.conductedDate
                        ? new Date(survey.conductedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="data-table-td">
                      <span className={cn('status-badge', cfg.class)}>{cfg.label}</span>
                    </td>
                    <td className="data-table-td text-slate-600">{survey.findingCount ?? 0}</td>
                    <td className="data-table-td text-slate-600">
                      {survey.responseDeadline
                        ? new Date(survey.responseDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </td>
                    <td className="data-table-td">
                      <div className="flex gap-1 flex-wrap">
                        {survey.immediateJeopardy && <span className="status-badge status-badge-red">IJ</span>}
                        {survey.conditionLevel && <span className="status-badge status-badge-orange">CL</span>}
                      </div>
                    </td>
                    <td className="data-table-td">
                      <SatisfactionPushButton
                        surveyId={survey.id}
                        existingScore={(survey as Record<string, unknown>).satisfactionScore as number | null}
                        conductedDate={survey.conductedDate}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
