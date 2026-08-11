import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Audit Log' };

const ACTION_BADGE: Record<string, string> = {
  CREATE: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
  UPDATE: 'bg-blue-950/40 text-blue-400 border-blue-800/40',
  DELETE: 'bg-red-950/40 text-red-400 border-red-800/40',
  LOGIN: 'bg-teal-950/40 text-teal-400 border-teal-800/40',
  BULK: 'bg-amber-950/40 text-amber-400 border-amber-800/40',
};

function actionColor(action: string) {
  const key = Object.keys(ACTION_BADGE).find((k) => action.startsWith(k));
  return key ? ACTION_BADGE[key] : 'bg-muted/30 text-muted-foreground border-border';
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { page?: string; entityType?: string; action?: string };
}) {
  const session = await auth();
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const page = Math.max(1, parseInt(searchParams.page ?? '1'));
  const limit = 50;
  const skip = (page - 1) * limit;
  const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

  let userIdFilter: string[] | undefined;
  if (!isSuperAdmin) {
    const facilityUsers = await prisma.user.findMany({
      where: { facilityId: session.user.facilityId },
      select: { id: true },
    });
    userIdFilter = facilityUsers.map((u) => u.id);
  }

  const where = {
    ...(userIdFilter ? { userId: { in: userIdFilter } } : {}),
    ...(searchParams.entityType ? { entityType: searchParams.entityType } : {}),
    ...(searchParams.action ? { action: { contains: searchParams.action, mode: 'insensitive' as const } } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const pages = Math.ceil(total / limit);

  const entityTypes = [
    'CorrectiveActionPlan', 'IncidentReport', 'GrievanceRecord',
    'RootCauseAnalysis', 'User', 'Facility', 'Policy', 'TrainingRecord',
  ];

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { page: String(page), entityType: searchParams.entityType, action: searchParams.action, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) sp.set(k, v); });
    return `/admin/audit-log?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Admin
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" /> Audit Log
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">{total.toLocaleString()} entries</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <form method="GET" className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Entity Type</label>
            <select
              name="entityType"
              defaultValue={searchParams.entityType ?? ''}
              className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground"
            >
              <option value="">All</option>
              {entityTypes.map((et) => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Action contains</label>
            <input
              name="action"
              defaultValue={searchParams.action ?? ''}
              placeholder="e.g. CREATE, DELETE"
              className="text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground/50 w-44"
            />
          </div>
          <input type="hidden" name="page" value="1" />
          <button
            type="submit"
            className="self-end text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            Filter
          </button>
          {(searchParams.entityType || searchParams.action) && (
            <Link
              href="/admin/audit-log"
              className="self-end text-sm text-muted-foreground hover:text-foreground underline py-1.5"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Timestamp</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">User</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Action</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Entity</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt, 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    <div className="font-medium text-foreground/80">{log.user?.name ?? '-'}</div>
                    <div className="text-muted-foreground/60">{log.user?.email ?? 'System'}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${actionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-foreground/70">{log.entityType}</td>
                  <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground/60 max-w-[120px] truncate">{log.entityId}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground/60">{log.ipAddress ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">No audit log entries found.</p>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={buildUrl({ page: String(page - 1) })} className="px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                Previous
              </Link>
            )}
            {page < pages && (
              <Link href={buildUrl({ page: String(page + 1) })} className="px-3 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
