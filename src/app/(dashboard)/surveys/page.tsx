import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ClipboardList, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Surveys & Inspections' };

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  SCHEDULED:   { label: 'Scheduled',   class: 'status-badge-blue' },
  IN_PROGRESS: { label: 'In Progress', class: 'status-badge-yellow' },
  COMPLETE:    { label: 'Complete',    class: 'status-badge-green' },
  OVERDUE:     { label: 'Overdue',     class: 'status-badge-red' },
};

export default async function SurveysPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const surveys = await prisma.survey.findMany({
    where: { facilityId },
    orderBy: { surveyDate: 'desc' },
  });

  const total   = surveys.length;
  const open    = surveys.filter(s => s.status !== 'COMPLETE').length;
  const overdue = surveys.filter(s => s.status === 'OVERDUE').length;
  const complete = surveys.filter(s => s.status === 'COMPLETE').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-purple-600" />
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
          { label: 'Total Surveys',  value: total,   icon: ClipboardList, color: 'text-slate-600', bg: 'bg-slate-50'  },
          { label: 'Open / Active',  value: open,    icon: Clock,         color: 'text-blue-600',  bg: 'bg-blue-50'   },
          { label: 'Overdue',        value: overdue, icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50'    },
          { label: 'Completed',      value: complete,icon: CheckCircle2,  color: 'text-green-600', bg: 'bg-green-50'  },
        ].map(card => (
          <div key={card.label} className={cn('rounded-xl border border-slate-200 p-5 flex items-start gap-4', card.bg)}>
            <card.icon className={cn('w-5 h-5 mt-0.5', card.color)} />
            <div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {surveys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardList className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">No surveys recorded yet.</p>
            <a href="/surveys/new" className="mt-3 text-sm text-purple-600 hover:underline">Add your first survey</a>
          </div>
        ) : (
          <table className="data-table">
            <thead className="data-table-head">
              <tr>
                <th className="data-table-th">Survey / Inspection</th>
                <th className="data-table-th">Type</th>
                <th className="data-table-th">Agency</th>
                <th className="data-table-th">Survey Date</th>
                <th className="data-table-th">Status</th>
                <th className="data-table-th">Findings</th>
                <th className="data-table-th">Next Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {surveys.map(survey => {
                const cfg = STATUS_CONFIG[survey.status] ?? { label: survey.status, class: 'status-badge-gray' };
                return (
                  <tr key={survey.id} className="data-table-row">
                    <td className="data-table-td font-medium text-slate-900">{survey.title}</td>
                    <td className="data-table-td text-slate-600">{survey.surveyType.replace(/_/g, ' ')}</td>
                    <td className="data-table-td text-slate-600">{survey.agency ?? '—'}</td>
                    <td className="data-table-td text-slate-600">
                      {survey.surveyDate
                        ? new Date(survey.surveyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="data-table-td">
                      <span className={cn('status-badge', cfg.class)}>{cfg.label}</span>
                    </td>
                    <td className="data-table-td text-slate-600">{survey.findingsCount ?? 0}</td>
                    <td className="data-table-td text-slate-600">
                      {survey.nextDue
                        ? new Date(survey.nextDue).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
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
