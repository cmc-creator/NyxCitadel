import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import { ShieldCheck, Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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
    COMPLIANT:       'bg-emerald-950/40 text-emerald-400 border-emerald-700/50',
    NON_COMPLIANT:   'bg-red-950/40 text-red-400 border-red-700/50',
    PENDING_REVIEW:  'bg-yellow-950/40 text-yellow-400 border-yellow-700/50',
    ACTIVE:          'bg-blue-950/40 text-blue-400 border-blue-700/50',
    WAIVED:          'bg-slate-800/40 text-slate-400 border-slate-700/50',
    NA:              'bg-slate-800/40 text-slate-500 border-slate-700/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            Compliance Requirements
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {items.length} requirements tracked across all regulatory bodies
          </p>
        </div>
        <Link
          href="/trackers/compliance/new"
          className="inline-flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Requirement
        </Link>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
          <div key={status} className="bg-card rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{status.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Requirement</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Regulatory Body</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Standard</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Frequency</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Next Due</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  No compliance items found.{' '}
                  <Link href="/trackers/compliance/new" className="text-purple-400 hover:underline">
                    Add your first requirement
                  </Link>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const { label, className } = getDueDateStatus(item.nextDueDate);
                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/trackers/compliance/${item.id}`} className="font-medium text-foreground/90 hover:underline hover:text-purple-400">{item.title}</Link>
                      <p className="text-xs text-muted-foreground/60">{item.category}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {item.regulatoryBody.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground/70 text-xs font-mono">
                      {item.standardRef ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {item.frequency}
                    </td>
                    <td className="px-4 py-3">
                      {item.nextDueDate ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${className}`}>
                          {formatDate(item.nextDueDate)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
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
