'use client';

import Link from 'next/link';
import { Building2, ChevronRight, Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const subModules = [
  {
    href: '/governance/committees',
    title: 'Committee Meetings',
    description: 'Medical Executive Committee, QA/QAPI, P&T, Safety, Ethics, and Peer Review — meeting minutes, quorum, and action items.',
    icon: '🏛️',
    badge: 'JCAHO LD.03.01',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    stat: 'All Q1 2026 meetings complete',
    statColor: 'text-emerald-400',
  },
  {
    href: '/governance/documents',
    title: 'Governance Documents',
    description: 'Board bylaws, medical staff bylaws, organizational charts, policies, and self-assessment documents.',
    icon: '📄',
    badge: 'JCAHO LD.01.01',
    badgeColor: 'bg-blue-100 text-blue-700',
    stat: '3 Documents Due for Review',
    statColor: 'text-amber-400',
  },
];

const recentActivity = [
  { type: 'MEC Meeting', date: '2026-03-04', action: 'Credentialing approvals: 2 providers — Dr. Patel, NP Santos', status: 'Complete' },
  { type: 'QA/QAPI Committee', date: '2026-02-18', action: 'Reviewed Q4 2025 PI Projects — 3 action items assigned', status: 'Complete' },
  { type: 'P&T Committee', date: '2026-02-20', action: 'Formulary update: 2 additions, 1 removal', status: 'Complete' },
  { type: 'Safety Committee', date: '2026-02-12', action: 'EOC rounds results reviewed — 1 corrective action', status: 'In Progress' },
  { type: 'Ethics Committee', date: '2026-01-30', action: 'Patient rights consultation — capacity determination', status: 'Complete' },
];

export default function GovernancePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Governance</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">JCAHO LD</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">CMS §482.12</span>
          </div>
          <p className="text-slate-400 text-sm">Committee meetings, governance documents, board oversight, and organizational leadership compliance.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Committees', value: 5, icon: Users, color: 'text-indigo-400' },
          { label: 'YTD Meetings Held', value: 14, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Docs Due for Review', value: 3, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Open Action Items', value: 4, icon: FileText, color: 'text-amber-400' },
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
      <div className="grid md:grid-cols-2 gap-4">
        {subModules.map(m => (
          <Link key={m.href} href={m.href}
            className="rounded-xl bg-slate-800/50 border border-white/10 p-5 hover:border-indigo-500/40 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{m.title}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${m.badgeColor}`}>{m.badge}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </div>
            <p className="text-xs text-slate-400 mb-3">{m.description}</p>
            <p className={`text-sm font-semibold ${m.statColor}`}>{m.stat}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
        <p className="text-sm font-semibold text-white mb-3">Recent Committee Activity</p>
        <div className="space-y-3">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-slate-300">{a.type}</span>
                  <span className="text-xs text-slate-500">{a.date}</span>
                </div>
                <p className="text-xs text-slate-400">{a.action}</p>
              </div>
              <span className={`text-xs font-semibold flex-shrink-0 ${a.status === 'Complete' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
