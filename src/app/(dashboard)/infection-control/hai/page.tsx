'use client';

import { useState } from 'react';
import { Activity, TrendingDown, TrendingUp, Plus, AlertTriangle } from 'lucide-react';

const haiData = [
  { month: 'Sep 2025', cauti: 1, clabsi: 0, mrsa: 0, cdi: 1, haiTotal: 2 },
  { month: 'Oct 2025', cauti: 0, clabsi: 0, mrsa: 1, cdi: 2, haiTotal: 3 },
  { month: 'Nov 2025', cauti: 0, clabsi: 0, mrsa: 0, cdi: 1, haiTotal: 1 },
  { month: 'Dec 2025', cauti: 1, clabsi: 0, mrsa: 0, cdi: 0, haiTotal: 1 },
  { month: 'Jan 2026', cauti: 0, clabsi: 0, mrsa: 1, cdi: 1, haiTotal: 2 },
  { month: 'Feb 2026', cauti: 0, clabsi: 0, mrsa: 1, cdi: 2, haiTotal: 3 },
];

const latestMetrics = [
  { type: 'CAUTI', full: 'Catheter-Associated UTI', cases: 0, rate: 0.0, benchmark: 1.2, sir: 0.0, trend: 'stable' },
  { type: 'CLABSI', full: 'Central Line BSI', cases: 0, rate: 0.0, benchmark: 0.8, sir: 0.0, trend: 'stable' },
  { type: 'MRSA BSI', full: 'MRSA Bacteremia', cases: 1, rate: 0.4, benchmark: 0.2, sir: 2.0, trend: 'up' },
  { type: 'CDI', full: 'C. difficile Infection', cases: 2, rate: 0.8, benchmark: 0.5, sir: 1.6, trend: 'up' },
  { type: 'HAP', full: 'Hospital-Acquired Pneumonia', cases: 0, rate: 0.0, benchmark: 0.3, sir: 0.0, trend: 'stable' },
  { type: 'SSI', full: 'Surgical Site Infection', cases: 0, rate: 0.0, benchmark: 0.2, sir: 0.0, trend: 'stable' },
];

export default function HaiPage() {
  const [selectedMonth, setSelectedMonth] = useState('Feb 2026');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Activity className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">HAI Surveillance</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">NHSN Reportable</span>
          </div>
          <p className="text-slate-400 text-sm">Monthly healthcare-associated infection rates tracked against NHSN national benchmarks.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Enter Monthly Data
        </button>
      </div>

      {/* Above-benchmark alert */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-300">2 HAI Types Above NHSN Benchmark — February 2026</p>
          <p className="text-xs text-amber-200/70 mt-0.5">MRSA BSI (SIR 2.0) and CDI (SIR 1.6) exceed national benchmarks. IC committee review recommended. Consider antibiotic stewardship intervention for CDI.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {latestMetrics.map(m => {
          const above = m.rate > m.benchmark;
          return (
            <div key={m.type} className={`rounded-xl border p-4 ${above ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-slate-800/50'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-white text-sm">{m.type}</p>
                {m.trend === 'up'
                  ? <TrendingUp className="w-4 h-4 text-red-400" />
                  : <TrendingDown className="w-4 h-4 text-emerald-400" />
                }
              </div>
              <p className="text-xs text-slate-500 mb-3">{m.full}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Cases (Feb)</span>
                  <span className="font-semibold text-white">{m.cases}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Rate / 1000 pt-days</span>
                  <span className={`font-semibold ${above ? 'text-red-400' : 'text-emerald-400'}`}>{m.rate.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">NHSN Benchmark</span>
                  <span className="text-slate-300">{m.benchmark.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">SIR</span>
                  <span className={`font-bold ${m.sir > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {m.sir > 0 ? m.sir.toFixed(2) : '—'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Table */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <p className="font-semibold text-white text-sm">6-Month HAI Trend</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40">
            <tr>
              {['Month', 'CAUTI', 'CLABSI', 'MRSA BSI', 'CDI', 'Total HAIs'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {haiData.map(d => (
              <tr key={d.month} className="hover:bg-white/5">
                <td className="px-4 py-2.5 text-slate-300 font-medium text-xs">{d.month}</td>
                <td className={`px-4 py-2.5 text-xs font-semibold ${d.cauti > 0 ? 'text-red-400' : 'text-slate-500'}`}>{d.cauti}</td>
                <td className={`px-4 py-2.5 text-xs font-semibold ${d.clabsi > 0 ? 'text-red-400' : 'text-slate-500'}`}>{d.clabsi}</td>
                <td className={`px-4 py-2.5 text-xs font-semibold ${d.mrsa > 0 ? 'text-amber-400' : 'text-slate-500'}`}>{d.mrsa}</td>
                <td className={`px-4 py-2.5 text-xs font-semibold ${d.cdi > 1 ? 'text-red-400' : d.cdi === 1 ? 'text-amber-400' : 'text-slate-500'}`}>{d.cdi}</td>
                <td className="px-4 py-2.5 text-xs font-bold text-white">{d.haiTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
