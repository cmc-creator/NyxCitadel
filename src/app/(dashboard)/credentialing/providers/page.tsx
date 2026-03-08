'use client';

import { useState } from 'react';
import { UserCheck, Plus, AlertTriangle, CheckCircle, Search } from 'lucide-react';

const mockProviders = [
  { id: '1', name: 'Dr. Elena Martinez', type: 'PHYSICIAN', specialty: 'Psychiatry — General Adult', npi: '1234567890', licenseNum: 'AZ-MD-12345', licenseExpiry: '2026-09-30', privilegesStatus: 'ACTIVE', oppeStatus: 'CURRENT', credentialedSince: '2018-04-01', reappointmentDue: '2026-04-01' },
  { id: '2', name: 'Dr. James Chen', type: 'PHYSICIAN', specialty: 'Psychiatry — Child & Adolescent', npi: '2345678901', licenseNum: 'AZ-MD-23456', licenseExpiry: '2026-03-31', privilegesStatus: 'ACTIVE', oppeStatus: 'CURRENT', credentialedSince: '2020-08-15', reappointmentDue: '2026-08-15' },
  { id: '3', name: 'NP Rosa Santos', type: 'APRN', specialty: 'Psychiatric NP', npi: '3456789012', licenseNum: 'AZ-NP-34567', licenseExpiry: '2025-12-31', privilegesStatus: 'ACTIVE', oppeStatus: 'CURRENT', credentialedSince: '2023-01-20', reappointmentDue: '2025-01-20' },
  { id: '4', name: 'Dr. Mark Williams', type: 'PHYSICIAN', specialty: 'Internal Medicine (Consult)', npi: '4567890123', licenseNum: 'AZ-MD-45678', licenseExpiry: '2027-01-15', privilegesStatus: 'PROVISIONAL', oppeStatus: 'FPPE_ACTIVE', credentialedSince: '2025-09-01', reappointmentDue: '2027-09-01' },
  { id: '5', name: 'Dr. Sarah Kim', type: 'PHYSICIAN', specialty: 'Psychiatry — Geriatric', npi: '5678901234', licenseNum: 'AZ-MD-56789', licenseExpiry: '2025-08-01', privilegesStatus: 'ACTIVE', oppeStatus: 'CURRENT', credentialedSince: '2016-06-01', reappointmentDue: '2025-06-01' },
];

const typeConfig: Record<string, { label: string; color: string }> = {
  PHYSICIAN:    { label: 'MD/DO',       color: 'bg-indigo-100 text-indigo-700' },
  APRN:         { label: 'APRN/NP',     color: 'bg-violet-100 text-violet-700' },
  PA:           { label: 'PA',          color: 'bg-blue-100 text-blue-700' },
  PSYCHOLOGIST: { label: 'PhD',         color: 'bg-purple-100 text-purple-700' },
};

const privilegeConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:        { label: 'Active',      color: 'bg-emerald-100 text-emerald-700' },
  PROVISIONAL:   { label: 'Provisional', color: 'bg-amber-100 text-amber-700' },
  SUSPENDED:     { label: 'Suspended',   color: 'bg-red-100 text-red-700' },
  INACTIVE:      { label: 'Inactive',    color: 'bg-slate-100 text-slate-600' },
};

export default function ProvidersPage() {
  const [search, setSearch] = useState('');
  const today = new Date();
  const soonDate = new Date(); soonDate.setDate(today.getDate() + 90);

  const expiringSoon = mockProviders.filter(p => {
    const exp = new Date(p.licenseExpiry);
    return exp <= soonDate;
  });

  const filtered = mockProviders.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UserCheck className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Provider Directory</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">TJC MS.06.01</span>
          </div>
          <p className="text-slate-400 text-sm">Active medical staff — credentials, privileges, license expiry, and OPPE/FPPE status.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Provider
        </button>
      </div>

      {expiringSoon.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            {expiringSoon.length} provider license(s) expiring within 90 days: {expiringSoon.map(p => p.name.split(' ')[1]).join(', ')}
          </p>
        </div>
      )}

      <div className="flex gap-3 items-center bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or specialty..."
          className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none flex-1" />
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Provider', 'Type', 'Specialty', 'NPI', 'License Expiry', 'Privileges', 'OPPE/FPPE', 'Reappointment'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(p => {
              const expiry = new Date(p.licenseExpiry);
              const isExpiringSoon = expiry <= soonDate;
              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-3 font-semibold text-white text-xs">{p.name}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeConfig[p.type]?.color}`}>
                      {typeConfig[p.type]?.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{p.specialty}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs font-mono">{p.npi}</td>
                  <td className={`px-3 py-3 text-xs font-semibold ${isExpiringSoon ? 'text-amber-400' : 'text-slate-400'}`}>
                    {p.licenseExpiry}
                    {isExpiringSoon && <span className="ml-1 text-amber-400">⚠️</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${privilegeConfig[p.privilegesStatus]?.color}`}>
                      {privilegeConfig[p.privilegesStatus]?.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {p.oppeStatus === 'FPPE_ACTIVE'
                      ? <span className="text-amber-400 font-semibold">FPPE Active</span>
                      : <span className="text-emerald-400">Current</span>}
                  </td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{p.reappointmentDue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
