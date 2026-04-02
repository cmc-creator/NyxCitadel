import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { GraduationCap, Plus, AlertTriangle, Download } from 'lucide-react';
import Link from 'next/link';
import { isPast, isWithinInterval, addDays } from 'date-fns';
import { PrintButton } from '@/components/ui/PrintButton';

export const dynamic = 'force-dynamic';

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
    PENDING: 'bg-muted/50 text-foreground/80',
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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-teal-600" />
            Training &amp; Competency
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {records.length} records · {expiredCount} expired · {expiringCount} expiring in 30 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/api/export/training"
            className="inline-flex items-center gap-1.5 text-sm bg-card border border-border hover:bg-muted/30 text-foreground/80 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Link>
          <PrintButton />
          <Link
            href="/trackers/training/new"
            className="inline-flex items-center gap-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Record
          </Link>
        </div>
      </div>

      {/* Archive year banner */}
      {year && (
        <div className="bg-amber-950/20 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <strong>{year} Archive View</strong> - showing training records completed within {year}.
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
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Compliance by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryStats.map(([cat, { total, completed }]) => {
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[80%]">{cat}</span>
                    <span className={`text-xs font-bold ${
                      pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground/70">{completed}/{total} complete</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter tabs */}
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
                ? 'bg-teal-600 text-white'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted/30'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Staff Name</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Department</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Training</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Completed</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Expires</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground/70">
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
                  <tr key={record.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link href={`/trackers/training/${record.id}`} className="hover:underline">{record.staffName}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{record.department ?? '-'}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground/80">{record.trainingName}</p>
                      {record.provider && (
                        <p className="text-xs text-muted-foreground/70">{record.provider}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {record.category.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {record.completedDate ? formatDate(record.completedDate) : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {record.expiryDate ? (
                        <span
                          className={`font-medium ${
                            isExpired
                              ? 'text-red-600'
                              : isExpiring
                              ? 'text-yellow-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatDate(record.expiryDate)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/70">No expiry</span>
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
