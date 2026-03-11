import Link from 'next/link';
import { AlertTriangle, Filter } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const fmt = (d: Date | string | null): string =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const categoryBadge: Record<string, string> = {
  LIFE_SAFETY: 'bg-sky-950/50 text-sky-300 border border-sky-700/40',
  LIGATURE_RISK: 'bg-amber-950/50 text-amber-300 border border-amber-700/40',
  FIRE_SAFETY: 'bg-red-950/50 text-red-300 border border-red-700/40',
  INFECTION_CONTROL: 'bg-teal-950/50 text-teal-300 border border-teal-700/40',
  SECURITY: 'bg-purple-950/50 text-purple-300 border border-purple-700/40',
  UTILITIES: 'bg-orange-950/50 text-orange-300 border border-orange-700/40',
  EQUIPMENT_FAILURE: 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
  CLEANLINESS: 'bg-green-950/50 text-green-300 border border-green-700/40',
  PATIENT_SAFETY: 'bg-rose-950/50 text-rose-300 border border-rose-700/40',
  STRUCTURAL: 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/40',
  OTHER: 'bg-slate-700/50 text-slate-300 border border-slate-600/40',
};

const severityBadge: Record<string, string> = {
  IMMEDIATE_JEOPARDY: 'bg-red-950/60 text-red-300 border border-red-600/50 font-semibold',
  HIGH: 'bg-orange-950/60 text-orange-300 border border-orange-600/50',
  MEDIUM: 'bg-amber-950/60 text-amber-300 border border-amber-600/50',
  LOW: 'bg-slate-700/60 text-slate-300 border border-slate-600/50',
  OBSERVATION: 'bg-slate-800/60 text-slate-400 border border-slate-600/50',
};

const statusBadge: Record<string, string> = {
  OPEN: 'bg-red-950/40 text-red-400',
  IN_PROGRESS: 'bg-amber-950/40 text-amber-400',
  RESOLVED: 'bg-emerald-950/40 text-emerald-400',
  VERIFIED: 'bg-sky-950/40 text-sky-400',
  ACCEPTED: 'bg-slate-700/40 text-slate-400',
};

const daysPastDue = (dueDate: Date | null, resolvedDate: Date | null) => {
  if (!dueDate || resolvedDate) return null;
  const now = new Date();
  const diff = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
};

export default async function DeficienciesPage({
  searchParams,
}: {
  searchParams: { cat?: string; status?: string };
}) {
  const session = await auth();
  if (!session?.user?.facilityId) redirect('/login');
  const { facilityId } = session.user;

  const catFilter = searchParams?.cat ?? 'ALL';
  const statusFilter = searchParams?.status ?? 'ALL';

  const where: Record<string, unknown> = { facilityId };
  if (catFilter !== 'ALL') where.category = catFilter;
  if (statusFilter !== 'ALL') where.status = statusFilter;

  const [allDeficiencies, filtered] = await Promise.all([
    prisma.eocDeficiency.findMany({ where: { facilityId }, orderBy: { createdAt: 'desc' } }),
    prisma.eocDeficiency.findMany({ where, orderBy: { createdAt: 'desc' } }),
  ]);

  const usedCategories = ['ALL', ...Array.from(new Set(allDeficiencies.map(d => d.category as string)))];

  const openCount = allDeficiencies.filter(d => d.status === 'OPEN').length;
  const inProgressCount = allDeficiencies.filter(d => d.status === 'IN_PROGRESS').length;
  const resolvedCount = allDeficiencies.filter(d => d.status === 'RESOLVED').length;
  const overdueCount = allDeficiencies.filter(d => daysPastDue(d.dueDate, d.resolvedDate) !== null).length;

  const buildUrl = (newCat: string, newStatus: string) => {
    const p = new URLSearchParams();
    if (newCat !== 'ALL') p.set('cat', newCat);
    if (newStatus !== 'ALL') p.set('status', newStatus);
    const qs = p.toString();
    return `/eoc/deficiencies${qs ? '?' + qs : ''}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/eoc" className="text-sm text-slate-400 hover:text-slate-300">Environment of Care</Link>
            <span className="text-slate-600">›</span>
            <span className="text-sm text-foreground font-medium">Deficiencies</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Deficiency Tracker</h1>
          <p className="text-sm text-slate-400 mt-0.5">All environment-of-care findings from rounds, surveys, and ad-hoc observations</p>
        </div>
        <a href="/eoc/deficiencies/new" className="px-3 py-1.5 text-sm rounded-md bg-red-700 hover:bg-red-600 text-white font-medium transition-colors">
          + Log Deficiency
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-700/40 text-center">
          <p className="text-2xl font-bold text-red-400">{openCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Open</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-700/40 text-center">
          <p className="text-2xl font-bold text-amber-400">{inProgressCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">In Progress</p>
        </div>
        <div className="p-3 rounded-lg bg-orange-950/30 border border-orange-700/40 text-center">
          <p className="text-2xl font-bold text-orange-400">{overdueCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Past Due Date</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-700/40 text-center">
          <p className="text-2xl font-bold text-emerald-400">{resolvedCount}</p>
          <p className="text-xs text-slate-500 mt-0.5">Resolved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {usedCategories.map(c => (
            <a
              key={c}
              href={buildUrl(c, statusFilter)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${catFilter === c ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {c === 'ALL' ? 'All' : c.replace(/_/g, ' ')}
            </a>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap ml-2">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED'] as const).map(s => (
            <a
              key={s}
              href={buildUrl(catFilter, s)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
            </a>
          ))}
        </div>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} deficiencies</span>
      </div>

      {/* Deficiency table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-border">
                <th className="text-left px-4 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Severity</th>
                <th className="text-left px-4 py-3 font-medium">Assigned To</th>
                <th className="text-left px-4 py-3 font-medium">Due Date</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map(d => {
                const overdue = daysPastDue(d.dueDate, d.resolvedDate);
                return (
                  <tr key={d.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono text-slate-400">{d.defNumber}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{d.unit}</p>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm text-foreground leading-snug">{d.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{d.location}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${categoryBadge[d.category] ?? 'bg-slate-800 text-slate-400'}`}>
                        {d.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${severityBadge[d.severity]}`}>
                        {d.severity === 'IMMEDIATE_JEOPARDY' ? 'IMM. JEOPARDY' : d.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{d.assignedTo ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-xs font-medium ${overdue ? 'text-red-400' : 'text-slate-300'}`}>
                        {d.resolvedDate ? fmt(d.resolvedDate) : fmt(d.dueDate)}
                      </p>
                      {overdue && (
                        <p className="text-xs text-red-500 mt-0.5">{overdue}d overdue</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${statusBadge[d.status]}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                        {d.notes && (
                          <p className="text-xs text-slate-600 leading-tight max-w-48 truncate">{d.notes}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">No deficiencies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
