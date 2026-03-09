import { Award, Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
          <p className="text-slate-400 text-sm">Ongoing Professional Practice Evaluation — quarterly performance data reviewed by Medical Executive Committee.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New OPPE Record
        </button>
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
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <p className="font-semibold text-white text-sm">OPPE Results</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40">
            <tr>
              {['Provider', 'Period', 'Cases Reviewed', 'Compliance Rate', 'Overall Rating', 'MEC Approved', 'Review Date'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {records.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-slate-500 text-sm">No OPPE records on file.</td></tr>
            ) : records.map(r => {
              const rate = r.totalCases > 0 ? (r.compliantCases / r.totalCases) * 100 : 0;
              return (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white text-xs">{r.provider.lastName}, {r.provider.firstName}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{r.periodStart.toLocaleDateString()} – {r.periodEnd.toLocaleDateString()}</td>
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
                  <td className="px-4 py-3 text-slate-400 text-xs">{r.minutesApprovedDate ? r.minutesApprovedDate.toLocaleDateString() : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


const oppeRecords = [
  {
    id: '1', provider: 'Dr. A. Martinez', cycle: 'Q4 2025', period: 'Oct – Dec 2025',
    totalCases: 48, compliantCases: 46, complianceRate: 95.8, rating: 'EXCELLENT',
    approved: true, reviewedBy: 'MEC Committee', reviewDate: '2026-01-20',
  },
  {
    id: '2', provider: 'Dr. S. Chen', cycle: 'Q4 2025', period: 'Oct – Dec 2025',
    totalCases: 42, compliantCases: 39, complianceRate: 92.9, rating: 'ACCEPTABLE',
    approved: true, reviewedBy: 'MEC Committee', reviewDate: '2026-01-20',
  },
  {
    id: '3', provider: 'Dr. R. Williams', cycle: 'Q4 2025', period: 'Oct – Dec 2025',
    totalCases: 35, compliantCases: 31, complianceRate: 88.6, rating: 'NEEDS_IMPROVEMENT',
    approved: true, reviewedBy: 'MEC Committee', reviewDate: '2026-01-20',
  },
  {
    id: '4', provider: 'Dr. T. Thompson', cycle: 'Q4 2025', period: 'Oct – Dec 2025',
    totalCases: 28, compliantCases: 27, complianceRate: 96.4, rating: 'EXCELLENT',
    approved: true, reviewedBy: 'MEC Committee', reviewDate: '2026-01-20',
  },
  {
    id: '5', provider: 'L. Torres, PMHNP', cycle: 'Q4 2025', period: 'Oct – Dec 2025',
    totalCases: 38, compliantCases: 37, complianceRate: 97.4, rating: 'EXCELLENT',
    approved: true, reviewedBy: 'MEC Committee', reviewDate: '2026-01-20',
  },
];

const ratingConfig: Record<string, { label: string; color: string }> = {
  EXCELLENT:         { label: 'Excellent',          color: 'bg-emerald-100 text-emerald-700' },
  ACCEPTABLE:        { label: 'Acceptable',          color: 'bg-blue-100 text-blue-700' },
  NEEDS_IMPROVEMENT: { label: 'Needs Improvement',  color: 'bg-amber-100 text-amber-700' },
  UNSATISFACTORY:    { label: 'Unsatisfactory',      color: 'bg-red-100 text-red-700' },
};

export default function OppePage() {
  const [cycle, setCycle] = useState('Q4 2025');
  const needsImprovement = oppeRecords.filter(r => r.rating === 'NEEDS_IMPROVEMENT' || r.rating === 'UNSATISFACTORY').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Award className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">OPPE Records</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">TJC MS.06.01</span>
          </div>
          <p className="text-slate-400 text-sm">Ongoing Professional Practice Evaluation — quarterly performance data reviewed by Medical Executive Committee.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New OPPE Record
        </button>
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
          { label: 'Providers Reviewed', value: oppeRecords.length, icon: Award, color: 'text-indigo-400' },
          { label: 'Excellent', value: oppeRecords.filter(r => r.rating === 'EXCELLENT').length, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Needs Improvement', value: needsImprovement, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Current Cycle', value: 'Q4 2025', icon: Clock, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <p className="font-semibold text-white text-sm">OPPE Results — Q4 2025</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40">
            <tr>
              {['Provider', 'Period', 'Cases Reviewed', 'Compliance Rate', 'Overall Rating', 'MEC Approved', 'Review Date'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {oppeRecords.map(r => (
              <tr key={r.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-semibold text-white text-xs">{r.provider}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.period}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{r.totalCases}</td>
                <td className={`px-4 py-3 font-bold text-sm ${r.complianceRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {r.complianceRate.toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ratingConfig[r.rating]?.color}`}>
                    {ratingConfig[r.rating]?.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.approved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{r.reviewDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
