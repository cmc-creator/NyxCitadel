import { Award, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ratingConfig: Record<string, { label: string; color: string }> = {
  EXCELLENT:         { label: 'Excellent',         color: 'bg-emerald-100 text-emerald-700' },
  ACCEPTABLE:        { label: 'Acceptable',         color: 'bg-blue-100 text-blue-700' },
  NEEDS_IMPROVEMENT: { label: 'Needs Improvement', color: 'bg-amber-100 text-amber-700' },
  UNSATISFACTORY:    { label: 'Unsatisfactory',     color: 'bg-red-100 text-red-700' },
};

export default async function OppePage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const records = await prisma.oppeRecord.findMany({
    where: { provider: { facilityId } },
    include: { provider: { select: { firstName: true, lastName: true } } },
    orderBy: { periodEnd: 'desc' },
    take: 50,
  });

  const needsImprovement = records.filter(r => r.overallRating === 'NEEDS_IMPROVEMENT' || r.overallRating === 'UNSATISFACTORY').length;
  const excellent         = records.filter(r => r.overallRating === 'EXCELLENT').length;

  // Derive most recent cycle label
  const latestCycle = records[0]
    ? `${records[0].periodStart.toLocaleDateString()} – ${records[0].periodEnd.toLocaleDateString()}`
    : '—';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Award className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">OPPE Records</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">TJC MS.06.01</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Ongoing Professional Practice Evaluation — quarterly performance data reviewed by Medical Executive Committee.</p>
        </div>
        <a href="/credentialing/oppe/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New OPPE Record
        </a>
      </div>

      {needsImprovement > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">{needsImprovement} provider(s) rated Needs Improvement this cycle</p>
            <p className="text-xs text-amber-200/70 mt-0.5">TJC requires MEC review and a focused improvement plan for providers below acceptable threshold. Consider initiating FPPE if issues persist next quarter.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Providers Reviewed', value: records.length,    icon: Award,         color: 'text-indigo-400' },
          { label: 'Excellent',          value: excellent,          icon: CheckCircle,   color: 'text-emerald-400' },
          { label: 'Needs Improvement',  value: needsImprovement,  icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Latest Cycle',       value: latestCycle,        icon: Clock,         color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground/70">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-x-auto">
        <div className="px-5 py-3 border-b border-white/10">
          <p className="font-semibold text-white text-sm">OPPE Results</p>
        </div>
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-900/40">
            <tr>
              {['Provider', 'Period', 'Cases Reviewed', 'Compliance Rate', 'Overall Rating', 'MEC Approved'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground/70 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500 text-sm">No OPPE records on file.</td></tr>
            ) : records.map(r => {
              const rate = r.totalCases > 0 ? (r.compliantCases / r.totalCases) * 100 : 0;
              return (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white text-xs">{r.provider.lastName}, {r.provider.firstName}</td>
                  <td className="px-4 py-3 text-muted-foreground/70 text-xs">{r.periodStart.toLocaleDateString()} – {r.periodEnd.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{r.totalCases}</td>
                  <td className={`px-4 py-3 font-bold text-sm ${rate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {rate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ratingConfig[r.overallRating ?? '']?.color ?? 'bg-slate-100 text-slate-600'}`}>
                      {ratingConfig[r.overallRating ?? '']?.label ?? r.overallRating ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.approvedByMec
                      ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                      : <Clock className="w-4 h-4 text-amber-400" />}
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


