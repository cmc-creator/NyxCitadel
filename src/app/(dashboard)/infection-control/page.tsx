import Link from 'next/link';
import { Biohazard, Activity, AlertTriangle, CheckCircle, ChevronRight, Droplets } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function InfectionControlPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const [icraActive, activeOutbreaks, recentHai, recentHhAudits] = await Promise.all([
    prisma.icRiskAssessment.findFirst({
      where: { facilityId, status: 'APPROVED' },
      orderBy: { assessmentYear: 'desc' },
      select: { assessmentYear: true, conductedDate: true, approvedBy: true },
    }),
    prisma.icOutbreak.count({ where: { facilityId, status: { in: ['ACTIVE', 'SURVEILLANCE'] } } }),
    prisma.haiSurveillance.findMany({
      where: { facilityId, reportYear: thisYear, reportMonth: { lte: thisMonth } },
      orderBy: [{ reportYear: 'desc' }, { reportMonth: 'desc' }],
      take: 6,
    }),
    prisma.handHygieneAudit.findMany({
      where: { facilityId },
      orderBy: { auditDate: 'desc' },
      take: 10,
    }),
  ]);

  const avgHhRate = recentHhAudits.length > 0
    ? Math.round(recentHhAudits.reduce((s, a) => s + a.complianceRate, 0) / recentHhAudits.length)
    : null;

  // Latest HAI records grouped by type for snapshot
  const haiByType = new Map<string, typeof recentHai[0]>();
  for (const h of recentHai) {
    if (!haiByType.has(h.haiType)) haiByType.set(h.haiType, h);
  }
  const haiSnapshot = Array.from(haiByType.values());
  const aboveBenchCount = haiSnapshot.filter(h => h.nhsnBenchmark != null && h.rate != null && h.rate > h.nhsnBenchmark).length;

  const subModules = [
    { href: '/infection-control/icra', title: 'IC Risk Assessment', description: 'Annual ICRA — risk identification, ratings, and mitigation goals per CMS §482.42.', icon: '📋', badge: 'Annual', badgeColor: 'bg-blue-100 text-blue-700', stat: icraActive ? `${icraActive.assessmentYear} ICRA Approved` : 'No active ICRA', statColor: icraActive ? 'text-emerald-400' : 'text-amber-400' },
    { href: '/infection-control/hai', title: 'HAI Surveillance', description: 'Monthly HAI rate tracking — CAUTI, CLABSI, MRSA, CDI vs. NHSN benchmarks.', icon: '📊', badge: 'NHSN', badgeColor: 'bg-purple-100 text-purple-700', stat: `${recentHai.length} records`, statColor: 'text-blue-400' },
    { href: '/infection-control/outbreaks', title: 'Outbreak Log', description: 'Track active and resolved outbreaks, containment actions, and health department reporting.', icon: '🦠', badge: 'Reportable', badgeColor: 'bg-red-100 text-red-700', stat: `${activeOutbreaks} Active`, statColor: activeOutbreaks > 0 ? 'text-red-400' : 'text-emerald-400' },
    { href: '/infection-control/hand-hygiene', title: 'Hand Hygiene Audits', description: 'Unit-level compliance audits — opportunities observed vs. compliant events.', icon: '🧴', badge: 'TJC NPSG 07.01', badgeColor: 'bg-amber-100 text-amber-700', stat: avgHhRate != null ? `${avgHhRate}% compliance` : 'No audits', statColor: avgHhRate != null && avgHhRate < 90 ? 'text-amber-400' : 'text-emerald-400' },
  ];
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Biohazard className="w-6 h-6 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Infection Control</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">CMS §482.42</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">TJC IC</span>
          </div>
          <p className="text-slate-400 text-sm">IC risk assessment, HAI surveillance, outbreak management, and hand hygiene compliance.</p>
        </div>
      </div>

      {/* Program Health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'HAI Records (YTD)', value: String(recentHai.length), sub: 'entries logged', icon: Activity, color: aboveBenchCount > 0 ? 'text-amber-400' : 'text-teal-400' },
          { label: 'Hand Hygiene', value: avgHhRate != null ? `${avgHhRate}%` : 'N/A', sub: 'avg compliance', icon: Droplets, color: avgHhRate != null && avgHhRate < 90 ? 'text-amber-400' : 'text-teal-400' },
          { label: 'Active Outbreaks', value: String(activeOutbreaks), sub: activeOutbreaks === 0 ? 'all clear' : 'requires attention', icon: Biohazard, color: activeOutbreaks > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'ICRA Status', value: icraActive ? String(icraActive.assessmentYear) : 'Needed', sub: icraActive ? 'assessment current' : 'no approved ICRA', icon: CheckCircle, color: icraActive ? 'text-blue-400' : 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {aboveBenchCount > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{aboveBenchCount} HAI type(s) above NHSN benchmark this reporting period. IC committee review recommended.</p>
        </div>
      )}

      {/* HAI Snapshot */}
      {haiSnapshot.length > 0 && (
        <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
            <p className="font-semibold text-white text-sm">HAI Snapshot — Latest Data</p>
            <Link href="/infection-control/hai" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Full Dashboard <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-900/40">
              <tr>
                {['HAI Type', 'Month', 'Cases', 'Rate / 1000 pt-days', 'NHSN Benchmark', 'SIR', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {haiSnapshot.map(h => {
                const aboveBench = h.nhsnBenchmark != null && h.rate != null && h.rate > h.nhsnBenchmark;
                return (
                  <tr key={h.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-white">{h.haiType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{h.reportMonth}/{h.reportYear}</td>
                    <td className="px-4 py-3 text-slate-300">{h.caseCount}</td>
                    <td className={`px-4 py-3 font-semibold ${aboveBench ? 'text-red-400' : 'text-emerald-400'}`}>
                      {h.rate != null ? h.rate.toFixed(1) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{h.nhsnBenchmark != null ? h.nhsnBenchmark.toFixed(1) : '—'}</td>
                    <td className={`px-4 py-3 font-semibold ${h.sir && h.sir > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {h.sir ? h.sir.toFixed(2) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${aboveBench ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {aboveBench ? 'Above Benchmark' : 'At / Below'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-modules */}
      <div className="grid md:grid-cols-2 gap-4">
        {subModules.map(m => (
          <Link key={m.href} href={m.href}
            className="rounded-xl bg-slate-800/50 border border-white/10 p-5 hover:border-teal-500/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-teal-300 transition-colors">{m.title}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-400 mb-3">{m.description}</p>
            <p className={`text-sm font-semibold ${m.statColor}`}>{m.stat}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
