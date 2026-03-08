'use client';

import Link from 'next/link';
import { Users2, ChevronRight, AlertTriangle, CheckCircle, HeartHandshake, Shield } from 'lucide-react';

const subModules = [
  {
    href: '/workforce-health/employee-health',
    title: 'Employee Health Records',
    description: 'TB testing, flu vaccine compliance, hepatitis B series, and annual health screenings for clinical staff.',
    icon: '🩺',
    badge: 'CDC / CMS',
    badgeColor: 'bg-teal-100 text-teal-700',
    stat: '94% Flu Vaccination Rate',
    statColor: 'text-emerald-400',
  },
  {
    href: '/workforce-health/osha',
    title: 'OSHA 300 Log',
    description: 'Workplace injuries and illnesses — recordable events, days away, restricted duty, and illness tracking.',
    icon: '⛑️',
    badge: 'OSHA 29 CFR 1904',
    badgeColor: 'bg-amber-100 text-amber-700',
    stat: '3 Recordable Events YTD',
    statColor: 'text-amber-400',
  },
];

const healthStats = [
  { label: 'TB Tests Current', value: '98%', color: 'text-emerald-400' },
  { label: 'Flu Vaccination Rate', value: '94%', color: 'text-emerald-400' },
  { label: 'OSHA Recordables YTD', value: 3, color: 'text-amber-400' },
  { label: 'Hep B Series Complete', value: '87%', color: 'text-amber-400' },
];

export default function WorkforceHealthPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Users2 className="w-6 h-6 text-teal-400" />
            <h1 className="text-2xl font-bold text-white">Workforce Health & Safety</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">CMS CoP</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">OSHA</span>
          </div>
          <p className="text-slate-400 text-sm">Employee health screening, vaccination compliance, workplace safety, and OSHA recordable event log.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {healthStats.map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
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

      {/* Compliance Summary */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
        <p className="text-sm font-semibold text-white mb-3">Annual Compliance Calendar</p>
        <div className="space-y-2">
          {[
            { item: 'Flu Vaccination Campaign', deadline: 'Oct–Dec 2025', status: true },
            { item: 'Annual TB Tests (clinical staff)', deadline: 'Rolling — by hire anniversary', status: true },
            { item: 'Hepatitis B Series Completion', deadline: 'Within 6 months of hire', status: false },
            { item: 'OSHA 300A Annual Summary Posted', deadline: 'Feb 1 – Apr 30 annually', status: true },
            { item: 'Blood-borne Pathogen Training', deadline: 'Annual', status: true },
            { item: 'Emergency Action Plan Review', deadline: 'Annual', status: true },
          ].map(r => (
            <div key={r.item} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                {r.status ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                <p className={`text-xs ${r.status ? 'text-slate-300' : 'text-amber-300'}`}>{r.item}</p>
              </div>
              <span className="text-xs text-slate-500">{r.deadline}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
