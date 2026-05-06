'use client';

import Link from 'next/link';
import { isPast } from 'date-fns';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import { BulkSelectList } from '@/components/trackers/BulkSelectList';
import { ClipboardList } from 'lucide-react';

interface Cap {
  id: string;
  capNumber: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  source: string;
  targetDate: Date;
  correctionPlan: string | null;
  regulatoryBody: string | null;
  sourceRef: string | null;
  assignee: { name: string | null; email: string | null } | null;
}

const statusColor: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  VERIFIED: 'bg-teal-100 text-teal-800',
  OVERDUE: 'bg-red-100 text-red-800',
  EXTENDED: 'bg-orange-100 text-orange-800',
};

const sourceColor: Record<string, string> = {
  SURVEY_FINDING: 'bg-red-950/20 text-red-700',
  INCIDENT: 'bg-orange-950/20 text-orange-700',
  INTERNAL_AUDIT: 'bg-blue-950/20 text-blue-700',
  COMPLAINT: 'bg-yellow-50 text-yellow-700',
  SENTINEL_EVENT: 'bg-red-100 text-red-900',
  DEFAULT: 'bg-slate-50 text-slate-600',
};

export function CapsListClient({ caps }: { caps: Cap[] }) {
  if (caps.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground/70">
        <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-200" />
        <p className="font-medium">No corrective action plans found.</p>
        <p className="text-sm mt-1">
          <Link href="/trackers/caps/new" className="text-teal-600 hover:underline">Create your first CAP</Link>
        </p>
      </div>
    );
  }

  return (
    <BulkSelectList
      items={caps}
      bulkApiPath="/api/caps/bulk"
      closeLabel="Mark Complete"
      closeAction="complete"
      renderItem={(cap) => {
        const isOverdue = isPast(cap.targetDate) && !['COMPLETED', 'VERIFIED'].includes(cap.status);
        const { label: dueLabel, className: dueClass } = getDueDateStatus(cap.targetDate);
        return (
          <Link
            href={`/trackers/caps/${cap.id}`}
            className="block bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-teal-300 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-slate-500">{cap.capNumber}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${sourceColor[cap.source] ?? sourceColor.DEFAULT}`}>
                    {cap.source.replace(/_/g, ' ')}
                  </span>
                  {cap.regulatoryBody && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{cap.regulatoryBody.replace(/_/g, ' ')}</span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground">{cap.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{cap.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground/70">
                  <span>Assignee: {cap.assignee?.name ?? cap.assignee?.email ?? 'Unassigned'}</span>
                  {cap.sourceRef && <span>Ref: {cap.sourceRef}</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[cap.status] ?? ''}`}>
                  {cap.status.replace(/_/g, ' ')}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${isOverdue ? 'status-overdue' : dueClass}`}>
                  {isOverdue ? `Overdue \u00b7 ${formatDate(cap.targetDate)}` : `Due ${formatDate(cap.targetDate)}`}
                </span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded priority-${cap.priority.toLowerCase()}`}>
                  {cap.priority}
                </span>
              </div>
            </div>
            {cap.correctionPlan && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-1">Correction Plan:</p>
                <p className="text-sm text-foreground/80 line-clamp-2">{cap.correctionPlan}</p>
              </div>
            )}
          </Link>
        );
      }}
    />
  );
}
