import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import { ShieldCheck, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Compliance Tracker' };

export default async function ComplianceTrackerPage({
  searchParams,
}: {
  searchParams: { filter?: string; body?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const items = await prisma.complianceItem.findMany({
    where: {
      facilityId,
      ...(searchParams.body ? { regulatoryBody: searchParams.body as never } : {}),
    },
    orderBy: [{ status: 'asc' }, { nextDueDate: 'asc' }],
  });

  const statusCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  const statusColor: Record<string, string> = {
    COMPLIANT: 'bg-green-100 text-green-800 border-green-200',
    NON_COMPLIANT: 'bg-red-100 text-red-800 border-red-200',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACTIVE: 'bg-blue-100 text-blue-800 border-blue-200',
    WAIVED: 'bg-gray-100 text-gray-600 border-gray-200',
    NA: 'bg-gray-100 text-gray-400 border-gray-100',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Compliance Requirements
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {items.length} requirements tracked across all regulatory bodies
          </p>
        </div>
        <Link
          href="/trackers/compliance/new"
          className="inline-flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Requirement
        </Link>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white rounded-lg border border-slate-200 p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{status.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Requirement</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Regulatory Body</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Standard</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Frequency</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Next Due</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  No compliance items found.{' '}
                  <Link href="/trackers/compliance/new" className="text-purple-600 hover:underline">
                    Add your first requirement
                  </Link>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const { label, className } = getDueDateStatus(item.nextDueDate);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/trackers/compliance/${item.id}`} className="font-medium text-slate-800 hover:underline hover:text-purple-700">{item.title}</Link>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {item.regulatoryBody.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {item.standardRef ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {item.frequency}
                    </td>
                    <td className="px-4 py-3">
                      {item.nextDueDate ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
                          {formatDate(item.nextDueDate)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${statusColor[item.status] ?? ''}`}>
                        {item.status.replace(/_/g, ' ')}
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
