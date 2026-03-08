'use client';

import Link from 'next/link';
import { UserCheck, Award, FileCheck, AlertTriangle, ChevronRight, Clock, CheckCircle } from 'lucide-react';

const subModules = [
  {
    href: '/credentialing/providers',
    title: 'Provider Directory',
    description: 'All credentialed providers — status, specialty, privileges, and reappointment dates.',
    icon: '👩‍⚕️',
    badge: 'CVO',
    badgeColor: 'bg-blue-100 text-blue-700',
    stat: '12 Active Providers',
    statColor: 'text-emerald-400',
  },
  {
    href: '/credentialing/licenses',
    title: 'License Tracking',
    description: 'Medical, DEA, APRN, and state licenses — expiry alerts, verification, and renewal workflow.',
    icon: '📜',
    badge: 'Auto-Alert',
    badgeColor: 'bg-amber-100 text-amber-700',
    stat: '2 Expiring <90 days',
    statColor: 'text-amber-400',
  },
  {
    href: '/credentialing/oppe',
    title: 'OPPE Records',
    description: 'Ongoing Professional Practice Evaluation — quarterly metrics per provider reviewed by MEC.',
    icon: '📊',
    badge: 'JCAHO MS.06',
    badgeColor: 'bg-purple-100 text-purple-700',
    stat: 'Q1 2026 in progress',
    statColor: 'text-blue-400',
  },
];

const expiringProviders = [
  { name: 'Dr. A. Martinez', credential: 'State Medical License', expiry: '2026-04-30', daysLeft: 54 },
  { name: 'Dr. S. Chen', credential: 'DEA Certificate', expiry: '2026-05-15', daysLeft: 69 },
  { name: 'L. Torres, APRN', credential: 'CDS – Controlled Dangerous Substances', expiry: '2026-03-31', daysLeft: 24 },
];

const activeProviders = [
  { name: 'Dr. A. Martinez', credentials: 'MD', specialty: 'Psychiatry', type: 'PHYSICIAN', reappointment: '2027-01-15', status: 'ACTIVE' },
  { name: 'Dr. S. Chen', credentials: 'MD', specialty: 'Psychiatry', type: 'PHYSICIAN', reappointment: '2027-03-01', status: 'ACTIVE' },
  { name: 'Dr. R. Williams', credentials: 'MD', specialty: 'Geriatric Psychiatry', type: 'PHYSICIAN', reappointment: '2026-08-15', status: 'ACTIVE' },
  { name: 'Dr. T. Thompson', credentials: 'DO', specialty: 'Internal Medicine', type: 'PHYSICIAN', reappointment: '2026-11-01', status: 'ACTIVE' },
  { name: 'L. Torres', credentials: 'PMHNP-BC', specialty: 'Psych Mental Health NP', type: 'ADVANCED_PRACTICE', reappointment: '2027-01-15', status: 'ACTIVE' },
  { name: 'M. Nguyen', credentials: 'PhD', specialty: 'Clinical Psychology', type: 'PSYCHOLOGIST', reappointment: '2026-09-01', status: 'ACTIVE' },
];

export default function CredentialingPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Credentialing & Privileging</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">JCAHO MS.06.01</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">CMS CoP</span>
          </div>
          <p className="text-slate-400 text-sm">Provider licenses, clinical privileges, OPPE/FPPE, and medical staff committee records.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Providers', value: 12, icon: UserCheck, color: 'text-indigo-400' },
          { label: 'Licenses Expiring <90 days', value: 3, icon: Clock, color: 'text-amber-400' },
          { label: 'OPPE Current', value: 12, icon: Award, color: 'text-emerald-400' },
          { label: 'Active FPPE', value: 1, icon: FileCheck, color: 'text-blue-400' },
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

      {/* Expiring Licenses Alert */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 overflow-hidden">
        <div className="px-5 py-3 border-b border-amber-500/20 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-semibold text-amber-300">Licenses Expiring Within 90 Days</p>
        </div>
        <div className="divide-y divide-white/5">
          {expiringProviders.map(p => (
            <div key={p.name} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-slate-400">{p.credential}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Expires {p.expiry}</p>
                <span className={`text-xs font-bold ${p.daysLeft <= 30 ? 'text-red-400' : 'text-amber-400'}`}>
                  {p.daysLeft} days
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-modules */}
      <div className="grid md:grid-cols-3 gap-4">
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

      {/* Active Providers Quick View */}
      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <p className="font-semibold text-white text-sm">Active Medical Staff</p>
          <Link href="/credentialing/providers" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40">
            <tr>
              {['Provider', 'Credentials', 'Specialty', 'Type', 'Reappointment', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activeProviders.map(p => (
              <tr key={p.name} className="hover:bg-white/5">
                <td className="px-4 py-2.5 font-semibold text-white text-xs">{p.name}</td>
                <td className="px-4 py-2.5 text-indigo-300 text-xs font-semibold">{p.credentials}</td>
                <td className="px-4 py-2.5 text-slate-300 text-xs">{p.specialty}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs">{p.type.replace('_', ' ')}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs">{p.reappointment}</td>
                <td className="px-4 py-2.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
