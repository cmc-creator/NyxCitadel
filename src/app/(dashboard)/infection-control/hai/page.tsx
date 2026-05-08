import { Activity, TrendingDown, TrendingUp, Plus, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HaiPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const records = await prisma.haiSurveillance.findMany({
    where: { facilityId },
    orderBy: [{ reportYear: 'desc' }, { reportMonth: 'desc' }],
    take: 60,
  });

  // Latest per type for metric cards
  const latestByType = new Map<string, typeof records[0]>();
  for (const r of records) {
    if (!latestByType.has(r.haiType)) latestByType.set(r.haiType, r);
  }
  const latestMetrics = Array.from(latestByType.values());
  const aboveCount = latestMetrics.filter(m => m.nhsnBenchmark != null && m.rate != null && m.rate > m.nhsnBenchmark).length;

  // 6-month trend table (group by month)
  const monthMap = new Map<string, { month: string; year: number; mth: number; counts: Record<string, number> }>();
  for (const r of records) {
    const key = `${r.reportYear}-${String(r.reportMonth).padStart(2, '0')}`;
    if (!monthMap.has(key)) monthMap.set(key, { month: key, year: r.reportYear, mth: r.reportMonth, counts: {} });
    monthMap.get(key)!.counts[r.haiType] = r.caseCount;
  }
  const trendRows = Array.from(monthMap.values()).slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Activity className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">HAI Surveillance</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">NHSN Reportable</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Monthly healthcare-associated infection rates tracked against NHSN national benchmarks.</p>
        </div>
        <a href="/infection-control/hai/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Enter Monthly Data
        </a>
      </div>

      {aboveCount > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">{aboveCount} HAI Type{aboveCount > 1 ? 's' : ''} Above NHSN Benchmark</p>
            <p className="text-xs text-amber-200/70 mt-0.5">IC committee review recommended. Consider antibiotic stewardship review.</p>
          </div>
        </div>
      )}

      {latestMetrics.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-4">
          {latestMetrics.map(m => {
            const above = m.nhsnBenchmark != null && m.rate != null && m.rate > m.nhsnBenchmark;
            return (
              <div key={m.id} className={`rounded-xl border p-4 ${above ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-slate-800/50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-white text-sm">{m.haiType.replace(/_/g, ' ')}</p>
                  {above ? <TrendingUp className="w-4 h-4 text-red-400" /> : <TrendingDown className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-xs text-muted-foreground mb-3">{m.reportMonth}/{m.reportYear}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground/70">Cases</span><span className="font-semibold text-white">{m.caseCount}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground/70">Rate / 1000 pt-days</span><span className={`font-semibold ${above ? 'text-red-400' : 'text-emerald-400'}`}>{m.rate != null ? m.rate.toFixed(1) : '—'}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground/70">NHSN Benchmark</span><span className="text-slate-300">{m.nhsnBenchmark != null ? m.nhsnBenchmark.toFixed(1) : '—'}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground/70">SIR</span><span className={`font-bold ${m.sir && m.sir > 1 ? 'text-red-400' : 'text-emerald-400'}`}>{m.sir ? m.sir.toFixed(2) : '—'}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No HAI surveillance data on record.</p>
        </div>
      )}

      {trendRows.length > 0 && (
        <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-x-auto">
          <div className="px-5 py-3 border-b border-white/10">
            <p className="font-semibold text-white text-sm">Monthly HAI Trend</p>
          </div>
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-slate-900/40">
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground/70 px-4 py-2.5">Month</th>
                {Array.from(new Set(records.map(r => r.haiType))).map(t => (
                  <th key={t} className="text-left text-xs font-semibold text-muted-foreground/70 px-4 py-2.5">{t.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trendRows.map(row => (
                <tr key={row.month} className="hover:bg-white/5">
                  <td className="px-4 py-2.5 text-slate-300 font-medium text-xs">{row.mth}/{row.year}</td>
                  {Array.from(new Set(records.map(r => r.haiType))).map(t => {
                    const cnt = row.counts[t] ?? 0;
                    return <td key={t} className={`px-4 py-2.5 text-xs font-semibold ${cnt > 0 ? 'text-amber-400' : 'text-muted-foreground'}`}>{cnt}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


