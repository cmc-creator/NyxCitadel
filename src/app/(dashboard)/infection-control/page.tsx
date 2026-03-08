'use client';

import Link from 'next/link';
import { Biohazard, TrendingDown, Activity, AlertTriangle, CheckCircle, ChevronRight, Droplets } from 'lucide-react';

const subModules = [
  {
    href: '/infection-control/icra',
    title: 'IC Risk Assessment',
    description: 'Annual ICRA — risk identification, ratings, and mitigation goals per CMS §482.42.',
    icon: '📋',
    badge: 'Annual',
    badgeColor: 'bg-blue-100 text-blue-700',
    stat: '1 Active',
    statColor: 'text-emerald-400',
  },
  {
    href: '/infection-control/hai',
    title: 'HAI Surveillance',
    description: 'Monthly HAI rate tracking — CAUTI, CLABSI, MRSA, CDI vs. NHSN benchmarks.',
    icon: '📊',
    badge: 'NHSN',
    badgeColor: 'bg-purple-100 text-purple-700',
    stat: '6 metrics tracked',
    statColor: 'text-blue-400',
  },
  {
    href: '/infection-control/outbreaks',
    title: 'Outbreak Log',
    description: 'Track active and resolved outbreaks, containment actions, and health department reporting.',
    icon: '🦠',
    badge: 'Reportable',
    badgeColor: 'bg-red-100 text-red-700',
    stat: '0 Active',
    statColor: 'text-emerald-400',
  },
  {
    href: '/infection-control/hand-hygiene',
    title: 'Hand Hygiene Audits',
    description: 'Unit-level compliance audits — opportunities observed vs. compliant events.',
    icon: '🧴',
    badge: 'JCAHO NPSG 07.01',
    badgeColor: 'bg-amber-100 text-amber-700',
    stat: '88% compliance',
    statColor: 'text-amber-400',
  },
];

const haiSnapshot = [
  { type: 'CAUTI', cases: 0, rate: 0.0, benchmark: 1.2, sir: null, month: 'Feb 2026' },
  { type: 'CLABSI', cases: 0, rate: 0.0, benchmark: 0.8, sir: null, month: 'Feb 2026' },
  { type: 'MRSA BSI', cases: 1, rate: 0.4, benchmark: 0.2, sir: 2.0, month: 'Feb 2026' },
  { type: 'CDI', cases: 2, rate: 0.8, benchmark: 0.5, sir: 1.6, month: 'Feb 2026' },
];

export default function InfectionControlPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Biohazard className="w-6 h-6 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Infection Control</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">CMS §482.42</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">JCAHO IC</span>
          </div>
          <p className="text-slate-400 text-sm">IC risk assessment, HAI surveillance, outbreak management, and hand hygiene compliance.</p>
        </div>
      </div>

      {/* Program Health */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'HAI Rate This Month', value: '0.8', sub: 'per 1000 pt-days', icon: Activity, color: 'text-amber-400' },
          { label: 'Hand Hygiene', value: '88%', sub: 'compliance (Feb)', icon: Droplets, color: 'text-teal-400' },
          { label: 'Active Outbreaks', value: '0', sub: 'all clear', icon: Biohazard, color: 'text-emerald-400' },
          { label: 'ICRA Status', value: '2026', sub: 'assessment current', icon: CheckCircle, color: 'text-blue-400' },
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

      {/* HAI Snapshot */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <p className="font-semibold text-white text-sm">HAI Snapshot — February 2026</p>
          <Link href="/infection-control/hai" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Full Dashboard <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40">
            <tr>
              {['HAI Type', 'Cases', 'Rate / 1000 pt-days', 'NHSN Benchmark', 'SIR', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {haiSnapshot.map(h => {
              const aboveBench = h.rate > h.benchmark;
              return (
                <tr key={h.type} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white">{h.type}</td>
                  <td className="px-4 py-3 text-slate-300">{h.cases}</td>
                  <td className={`px-4 py-3 font-semibold ${aboveBench ? 'text-red-400' : 'text-emerald-400'}`}>
                    {h.rate.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{h.benchmark.toFixed(1)}</td>
                  <td className={`px-4 py-3 font-semibold ${h.sir && h.sir > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {h.sir ? h.sir.toFixed(2) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${aboveBench ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {aboveBench ? 'Above Benchmark' : 'At / Below Benchmark'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
