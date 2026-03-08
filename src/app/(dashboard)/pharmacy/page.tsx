'use client';

import Link from 'next/link';
import { Pill, AlertTriangle, ChevronRight, CheckCircle, Clipboard } from 'lucide-react';

const subModules = [
  {
    href: '/pharmacy/controlled-substances',
    title: 'Controlled Substance Log',
    description: 'Shift count verification, waste reconciliation, discrepancy tracking, and DEA reporting.',
    icon: '💊',
    badge: 'DEA Schedule II–V',
    badgeColor: 'bg-red-100 text-red-700',
    stat: '0 Open Discrepancies',
    statColor: 'text-emerald-400',
  },
  {
    href: '/pharmacy/high-alert',
    title: 'High-Alert Med Audits',
    description: 'ISMP high-alert medications — storage, labeling, double-check compliance audits.',
    icon: '⚠️',
    badge: 'ISMP / TJC MM',
    badgeColor: 'bg-amber-100 text-amber-700',
    stat: '1 Action Required',
    statColor: 'text-amber-400',
  },
  {
    href: '/pharmacy/pdmp',
    title: 'PDMP Check Log',
    description: 'Prescription Drug Monitoring Program — compliance log for Arizona mandatory PDMP checks.',
    icon: '🔍',
    badge: 'ARS §36-2606',
    badgeColor: 'bg-blue-100 text-blue-700',
    stat: 'Compliant',
    statColor: 'text-emerald-400',
  },
];

const ptMeetings = [
  { date: '2026-02-20', chair: 'Dr. Kim, PharmD', attendees: 6, formularyChanges: 2, medErrors: 3, quorum: true },
  { date: '2025-11-20', chair: 'Dr. Kim, PharmD', attendees: 5, formularyChanges: 0, medErrors: 5, quorum: true },
  { date: '2025-08-21', chair: 'Dr. Kim, PharmD', attendees: 7, formularyChanges: 1, medErrors: 4, quorum: true },
];

export default function PharmacyPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Pill className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Medication Management</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">CMS MM CoP</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">TJC MM.04</span>
          </div>
          <p className="text-slate-400 text-sm">Controlled substance reconciliation, high-alert medication audits, PDMP compliance, and P&T committee records.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'CS Discrepancies YTD', value: 0, icon: Clipboard, color: 'text-emerald-400' },
          { label: 'High-Alert Audits This Month', value: 6, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'PDMP Checks This Month', value: 18, icon: CheckCircle, color: 'text-blue-400' },
          { label: 'Next P&T Meeting', value: 'May 2026', icon: Pill, color: 'text-emerald-400' },
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

      {/* Sub-modules */}
      <div className="grid md:grid-cols-3 gap-4">
        {subModules.map(m => (
          <Link key={m.href} href={m.href}
            className="rounded-xl bg-slate-800/50 border border-white/10 p-5 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">{m.title}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-400 mb-3">{m.description}</p>
            <p className={`text-sm font-semibold ${m.statColor}`}>{m.stat}</p>
          </Link>
        ))}
      </div>

      {/* P&T Meeting Log */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <p className="font-semibold text-white text-sm">Pharmacy & Therapeutics Committee Meetings</p>
          <span className="text-xs text-slate-400">Quarterly — Next: May 2026</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40">
            <tr>
              {['Date', 'Chair', 'Attendees', 'Quorum', 'Formulary Changes', 'Med Errors Trended'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ptMeetings.map(m => (
              <tr key={m.date} className="hover:bg-white/5">
                <td className="px-4 py-3 text-slate-300 text-xs font-semibold">{m.date}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{m.chair}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{m.attendees}</td>
                <td className="px-4 py-3">
                  {m.quorum ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs">{m.formularyChanges}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{m.medErrors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
