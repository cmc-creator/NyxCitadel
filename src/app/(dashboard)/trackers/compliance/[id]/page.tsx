import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  ShieldCheck, ArrowLeft, Calendar, AlertTriangle,
  CheckCircle2, Clock, ExternalLink, FileText, RefreshCw,
} from 'lucide-react';
import { isPast, isWithinInterval, addDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Compliance Requirement Detail' };

const STATUS_COLORS: Record<string, string> = {
  COMPLIANT:      'bg-green-100 text-green-800 border-green-200',
  NON_COMPLIANT:  'bg-red-100 text-red-800 border-red-200',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACTIVE:         'bg-blue-100 text-blue-800 border-blue-200',
  WAIVED:         'bg-gray-100 text-gray-600 border-gray-200',
  NA:             'bg-gray-100 text-gray-400 border-gray-100',
};

export default async function ComplianceItemDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const item = await prisma.complianceItem.findFirst({
    where: { id: params.id, facilityId },
  });
  if (!item) notFound();

  const now = new Date();
  const isOverdue = item.nextDueDate && isPast(item.nextDueDate) && !['WAIVED', 'NA'].includes(item.status);
  const isDueSoon = item.nextDueDate && !isOverdue && isWithinInterval(item.nextDueDate, { start: now, end: addDays(now, 14) });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Back + header */}
      <div>
        <Link href="/trackers/compliance" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Compliance Tracker
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <ShieldCheck className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${STATUS_COLORS[item.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {item.status.replace(/_/g, ' ')}
            </span>
            {item.isRequired && (
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded">Required</span>
            )}
          </div>
          {item.evidenceUrl && (
            <a href={item.evidenceUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              <ExternalLink className="w-3.5 h-3.5" /> View Evidence
            </a>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1 ml-9">
          {item.regulatoryBody.replace(/_/g, ' ')} · {item.category}
          {item.standardRef && ` · ${item.standardRef}`}
        </p>
      </div>

      {/* Alerts */}
      {isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Compliance Item Overdue</p>
            <p className="text-xs text-red-600">Was due {formatDate(item.nextDueDate!)}. Review and update compliance status immediately.</p>
          </div>
        </div>
      )}
      {isDueSoon && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 font-medium">Due in the next 14 days — {formatDate(item.nextDueDate!)}.</p>
        </div>
      )}
      {item.status === 'NON_COMPLIANT' && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-700">This item is currently marked Non-Compliant. A corrective action plan may be required.</p>
        </div>
      )}
      {item.status === 'COMPLIANT' && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-700">Compliant</p>
        </div>
      )}

      {/* Key info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" /> Requirement Details
        </h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-slate-500">Regulatory Body</dt>
            <dd className="text-slate-800 font-medium mt-0.5">{item.regulatoryBody.replace(/_/g, ' ')}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Category</dt>
            <dd className="text-slate-800 mt-0.5">{item.category}</dd>
          </div>
          {item.standardRef && (
            <div>
              <dt className="text-xs font-medium text-slate-500">Standard Reference</dt>
              <dd className="font-mono text-xs text-slate-700 mt-0.5">{item.standardRef}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Frequency
            </dt>
            <dd className="text-slate-800 mt-0.5">{item.frequency.replace(/_/g, ' ')}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Last Done
            </dt>
            <dd className="text-slate-800 mt-0.5">{item.lastDoneDate ? formatDate(item.lastDoneDate) : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Next Due
            </dt>
            <dd className={`font-medium mt-0.5 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-slate-800'}`}>
              {item.nextDueDate ? formatDate(item.nextDueDate) : '—'}
            </dd>
          </div>
          {item.responsibleRole && (
            <div>
              <dt className="text-xs font-medium text-slate-500">Responsible Role</dt>
              <dd className="text-slate-800 mt-0.5">{item.responsibleRole.replace(/_/g, ' ')}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs font-medium text-slate-500">Required</dt>
            <dd className="mt-0.5">
              {item.isRequired
                ? <span className="text-xs text-purple-700 font-semibold">Yes</span>
                : <span className="text-xs text-slate-400">No</span>}
            </dd>
          </div>
        </dl>
      </div>

      {item.description && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Description</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.description}</p>
        </div>
      )}

      {item.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Notes</h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/trackers/caps/new"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg hover:bg-purple-100"
        >
          + Create CAP
        </Link>
        <Link
          href="/trackers/compliance"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50"
        >
          ← All Requirements
        </Link>
      </div>
    </div>
  );
}
