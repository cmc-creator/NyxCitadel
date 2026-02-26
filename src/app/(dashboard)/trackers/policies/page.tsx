import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import { FileText, Plus, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { isPast, differenceInCalendarDays } from 'date-fns';

export const metadata = { title: 'Policy & Procedure Tracker' };

export default async function PoliciesPage({
  searchParams,
}: {
  searchParams: { filter?: string; category?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const filter = searchParams.filter;
  const now = new Date();

  const policies = await prisma.policy.findMany({
    where: {
      facilityId,
      ...(filter === 'overdue'
        ? { nextReviewDate: { lt: now }, status: { not: 'ARCHIVED' } }
        : {}),
      ...(searchParams.category ? { category: searchParams.category as never } : {}),
    },
    orderBy: [{ nextReviewDate: 'asc' }],
  });

  const overdueCount = policies.filter(
    (p) => p.nextReviewDate && isPast(p.nextReviewDate) && p.status !== 'ARCHIVED'
  ).length;

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    ARCHIVED: 'bg-gray-100 text-gray-500 border-gray-200',
    OVERDUE_REVIEW: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-600" />
            Policies &amp; Procedures
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {policies.length} policies · {overdueCount} overdue for review
          </p>
        </div>
        <Link
          href="/trackers/policies/new"
          className="inline-flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Policy
        </Link>
      </div>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">
            <span className="font-semibold">{overdueCount} policies</span> are past their review date.{' '}
            <Link href="/trackers/policies?filter=overdue" className="underline">
              View overdue policies
            </Link>
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: `All (${policies.length})` },
          { value: '?filter=overdue', label: `Overdue (${overdueCount})` },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/trackers/policies${tab.value}`}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              (filter ?? '') === tab.value.replace('?filter=', '')
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Policy #</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Version</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Effective Date</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Next Review</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {policies.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No policies found.{' '}
                  <Link href="/trackers/policies/new" className="text-purple-600 hover:underline">
                    Add your first policy
                  </Link>
                </td>
              </tr>
            ) : (
              policies.map((policy) => {
                const isOverdue =
                  policy.nextReviewDate &&
                  isPast(policy.nextReviewDate) &&
                  policy.status !== 'ARCHIVED';
                const { label, className } = getDueDateStatus(policy.nextReviewDate);

                return (
                  <tr key={policy.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {policy.policyNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{policy.title}</p>
                      {policy.owner && (
                        <p className="text-xs text-slate-400">{policy.owner}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {policy.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">v{policy.version}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDate(policy.effectiveDate)}
                    </td>
                    <td className="px-4 py-3">
                      {policy.nextReviewDate ? (() => {
                        const days = differenceInCalendarDays(policy.nextReviewDate, now);
                        const overdue = days < 0;
                        const urgent = days >= 0 && days <= 30;
                        return (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                            overdue ? 'bg-red-100 text-red-700 border-red-200' :
                            urgent  ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                      'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `Due in ${days}d`}
                          </span>
                        );
                      })() : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${statusColor[policy.status] ?? ''}`}>
                        {policy.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
