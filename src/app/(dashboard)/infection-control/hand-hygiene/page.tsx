import { Droplets, Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HandHygienePage({ searchParams }: { searchParams: { unit?: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const audits = await prisma.handHygieneAudit.findMany({
    where: {
      facilityId,
      ...(searchParams.unit ? { unit: searchParams.unit } : {}),
    },
    orderBy: { auditDate: 'desc' },
    take: 50,
  });

  const allUnits = await prisma.handHygieneAudit.findMany({
    where: { facilityId },
    select: { unit: true },
    distinct: ['unit'],
    orderBy: { unit: 'asc' },
  });

  const avgRate = audits.length > 0
    ? audits.reduce((s, a) => s + a.complianceRate, 0) / audits.length
    : null;

  // Per-unit summary
  const unitMap = new Map<string, { rates: number[]; latest: number }>();
  for (const a of audits) {
    if (!unitMap.has(a.unit)) unitMap.set(a.unit, { rates: [], latest: a.complianceRate });
    unitMap.get(a.unit)!.rates.push(a.complianceRate);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Droplets className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Hand Hygiene Audits</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">TJC NPSG 07.01</span>
          </div>
          <p className="text-slate-400 text-sm">Unit-level direct observation audits — compliance rate vs. 90% facility goal.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Enter Audit
        </button>
      </div>

      {avgRate != null && avgRate < 90 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-300">
            Overall compliance ({avgRate.toFixed(1)}%) is below the 90% facility goal. Targeted education recommended.
          </p>
        </div>
      )}

      {unitMap.size > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from(unitMap.entries()).map(([unit, data]) => {
            const avg = data.rates.reduce((s, r) => s + r, 0) / data.rates.length;
            const latest = data.latest;
            const prev = data.rates[1] ?? latest;
            const up = latest >= prev;
            return (
              <div key={unit} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
                <p className="font-semibold text-white text-sm mb-1">{unit}</p>
                <div className="flex items-end gap-2 mb-2">
                  <p className={`text-3xl font-bold ${latest >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{latest.toFixed(1)}%</p>
                  <div className="flex items-center gap-1 mb-1">
                    {up ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                <p className="text-xs text-slate-500">Avg: {avg.toFixed(1)}% · {data.rates.length} audit{data.rates.length !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <a href="/infection-control/hand-hygiene"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!searchParams.unit ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
          All Units
        </a>
        {allUnits.map(u => (
          <a key={u.unit} href={`/infection-control/hand-hygiene?unit=${encodeURIComponent(u.unit)}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${searchParams.unit === u.unit ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
            {u.unit}
          </a>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Date', 'Unit', 'Staff Type', 'Auditor', 'Opportunities', 'Compliant', 'Rate'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {audits.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-slate-500 text-sm">No audits on record.</td></tr>
            ) : audits.map(a => {
              const below = a.complianceRate < 90;
              return (
                <tr key={a.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(a.auditDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 font-semibold text-white text-xs">{a.unit}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{a.staffType ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{a.auditor}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{a.opportunities}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{a.compliant}</td>
                  <td className={`px-4 py-3 font-bold text-sm ${below ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {a.complianceRate.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
