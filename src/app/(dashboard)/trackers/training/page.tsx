import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { GraduationCap, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { isPast, isWithinInterval, addDays } from 'date-fns';

export const metadata = { title: 'Training & Competency Tracker' };

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: { filter?: string; department?: string; year?: string };
}) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const filter = searchParams.filter;
  const year = searchParams.year ? parseInt(searchParams.year, 10) : null;
  const now = new Date();
  const yearStart = year ? new Date(year, 0, 1) : null;
  const yearEnd   = year ? new Date(year + 1, 0, 1) : null;

  const records = await prisma.trainingRecord.findMany({
    where: {
      facilityId,
      ...(yearStart && yearEnd ? { completedDate: { gte: yearStart, lt: yearEnd } } : {}),
      ...(filter === 'expiring'
        ? { expiryDate: { gte: now, lte: addDays(now, 30) }, status: { not: 'EXEMPT' } }
        : filter === 'overdue'
        ? { expiryDate: { lt: now }, status: { not: 'EXEMPT' } }
        : filter === 'pending'
        ? { status: 'PENDING' }
        : {}),
      ...(searchParams.department ? { department: searchParams.department } : {}),
    },
    orderBy: [{ expiryDate: 'asc' }, { staffName: 'asc' }],
  });

  const expiredCount = records.filter(
    (r) => r.expiryDate && isPast(r.expiryDate) && r.status !== 'EXEMPT'
  ).length;
  const expiringCount = records.filter(
    (r) =>
      r.expiryDate &&
      isWithinInterval(r.expiryDate, { start: now, end: addDays(now, 30) }) &&
      r.status !== 'EXEMPT'
  ).length;

  // Compliance by category
  const categoryMap: Record<string, { total: number; completed: number }> = {};
  for (const r of records) {
    if (r.status === 'EXEMPT') continue;
    if (!r.isRequired) continue;
    const key = r.category.replace(/_/g, ' ');
    if (!categoryMap[key]) categoryMap[key] = { total: 0, completed: 0 };
    categoryMap[key].total++;
    if (r.status === 'COMPLETED') categoryMap[key].completed++;
  }
  const categoryStats = Object.entries(categoryMap).sort((a, b) => {
    const pctA = a[1].total ? a[1].completed / a[1].total : 1;
    const pctB = b[1].total ? b[1].completed / b[1].total : 1;
    return pctA - pctB; // lowest compliance first
  });

  const statusColor: Record<string, string> = {
    PENDING: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-red-100 text-red-800',
    OVERDUE: 'bg-red-100 text-red-800',
    EXEMPT: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            Training &amp; Competency
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {records.length} records · {expiredCount} expired · {expiringCount} expiring in 30 days
          </p>
        </div>
        <Link
          href="/trackers/training/new"
          className="inline-flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Record
        </Link>
      </div>

      {/* Archive year banner */}
      {year && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{year} Archive View</strong> — showing training records completed within {year}.
          </p>
          <Link href="/trackers/training" className="text-xs text-amber-700 underline">Return to live view</Link>
        </div>
      )}

      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800">
            {expiredCount > 0 && (
              <span className="font-semibold">{expiredCount} expired</span>
            )}
            {expiredCount > 0 && expiringCount > 0 && ' and '}
            {expiringCount > 0 && (
              <span className="font-semibold">{expiringCount} expiring in 30 days</span>
            )}
            {' '}training records require action.
          </p>
        </div>
      )}

      {/* Compliance by category */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Compliance by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryStats.map(([cat, { total, completed }]) => {
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[80%]">{cat}</span>
                    <span className={`text-xs font-bold ${
                      pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400">{completed}/{total} complete</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter tabs */}}
      <div className="flex gap-2 flex-wrap">
        {[
          { href: '/trackers/training', label: 'All', active: !filter },
          { href: '/trackers/training?filter=overdue', label: `Expired (${expiredCount})`, active: filter === 'overdue' },
          { href: '/trackers/training?filter=expiring', label: `Expiring Soon (${expiringCount})`, active: filter === 'expiring' },
          { href: '/trackers/training?filter=pending', label: 'Pending', active: filter === 'pending' },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              tab.active
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
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Staff Name</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Department</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Training</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Completed</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Expires</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No training records found.
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const isExpired =
                  record.expiryDate && isPast(record.expiryDate) && record.status !== 'EXEMPT';
                const isExpiring =
                  record.expiryDate &&
                  isWithinInterval(record.expiryDate, { start: now, end: addDays(now, 30) });

                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{record.staffName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{record.department ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{record.trainingName}</p>
                      {record.provider && (
                        <p className="text-xs text-slate-400">{record.provider}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {record.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {record.completedDate ? formatDate(record.completedDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {record.expiryDate ? (
                        <span
                          className={`font-medium ${
                            isExpired
                              ? 'text-red-600'
                              : isExpiring
                              ? 'text-yellow-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {formatDate(record.expiryDate)}
                        </span>
                      ) : (
                        <span className="text-slate-400">No expiry</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${statusColor[record.status] ?? ''}`}>
                        {record.status}
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
