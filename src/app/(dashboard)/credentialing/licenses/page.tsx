import { FileText, Plus, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:          { label: 'Active',          color: 'bg-emerald-100 text-emerald-700' },
  EXPIRED:         { label: 'EXPIRED',         color: 'bg-red-100 text-red-700' },
  EXPIRING_SOON:   { label: 'Expiring Soon',   color: 'bg-amber-100 text-amber-700' },
  PENDING_RENEWAL: { label: 'Renewal Pending', color: 'bg-blue-100 text-blue-700' },
};

export default async function LicensesPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  const licenses = await prisma.providerLicense.findMany({
    where: { provider: { facilityId } },
    include: { provider: { select: { firstName: true, lastName: true } } },
    orderBy: { expiryDate: 'asc' },
  });

  const expired     = licenses.filter(l => l.expiryDate < now).length;
  const expiringSoon = licenses.filter(l => l.expiryDate >= now && l.expiryDate <= in60).length;
  const current     = licenses.filter(l => l.expiryDate > in60).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">License Tracker</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">TJC MS.06.01</span>
          </div>
          <p className="text-slate-400 text-sm">Medical licenses, APRN licenses, and DEA registrations — expiry tracking with automated alerts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add License
        </button>
      </div>

      {(expired > 0 || expiringSoon > 0) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            {expired > 0 && <p className="text-sm font-semibold text-red-300">{expired} license(s) EXPIRED — providers may not exercise clinical privileges until renewed.</p>}
            {expiringSoon > 0 && <p className="text-sm text-amber-300 mt-1">{expiringSoon} license(s) expiring within 60 days — initiate renewal immediately.</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Expired Licenses',        value: expired,      color: expired > 0      ? 'text-red-400'   : 'text-emerald-400' },
          { label: 'Expiring Within 60 Days', value: expiringSoon, color: expiringSoon > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Active & Current',        value: current,      color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Provider', 'License Type', 'License #', 'State', 'Expiry', 'Days', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {licenses.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-slate-500 text-sm">No licenses on record.</td></tr>
            ) : licenses.map(l => {
              const daysLeft = Math.ceil((l.expiryDate.getTime() - now.getTime()) / 86400000);
              const isExpired = daysLeft < 0;
              const isSoon    = !isExpired && daysLeft <= 60;
              return (
                <tr key={l.id} className={`hover:bg-white/5 transition-colors ${isExpired ? 'bg-red-500/5' : isSoon ? 'bg-amber-500/5' : ''}`}>
                  <td className="px-3 py-3 font-semibold text-white text-xs">{l.provider.lastName}, {l.provider.firstName}</td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{l.licenseType}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs font-mono">{l.licenseNumber}</td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{l.state}</td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{l.expiryDate.toLocaleDateString()}</td>
                  <td className={`px-3 py-3 text-xs font-bold ${isExpired ? 'text-red-400' : isSoon ? 'text-amber-400' : 'text-slate-500'}`}>
                    {isExpired ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[l.status]?.color ?? 'bg-slate-100 text-slate-600'}`}>
                      {statusConfig[l.status]?.label ?? l.status}
                    </span>
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


const mockLicenses = [
  { id: '1', providerName: 'Dr. Elena Martinez', licenseType: 'Medical License (MD)', licenseNum: 'AZ-MD-12345', issuingState: 'Arizona', issueDate: '2016-09-15', expiryDate: '2026-09-30', daysUntilExpiry: 207, status: 'ACTIVE', deaExpiry: '2027-06-30', deaStatus: 'ACTIVE' },
  { id: '2', providerName: 'Dr. James Chen', licenseType: 'Medical License (MD)', licenseNum: 'AZ-MD-23456', issuingState: 'Arizona', issueDate: '2018-03-01', expiryDate: '2026-03-31', daysUntilExpiry: 24, status: 'ACTIVE', deaExpiry: '2026-05-31', deaStatus: 'ACTIVE' },
  { id: '3', providerName: 'NP Rosa Santos', licenseType: 'APRN License', licenseNum: 'AZ-NP-34567', issuingState: 'Arizona', issueDate: '2021-12-31', expiryDate: '2025-12-31', daysUntilExpiry: -67, status: 'EXPIRED', deaExpiry: '2026-11-30', deaStatus: 'ACTIVE' },
  { id: '4', providerName: 'Dr. Mark Williams', licenseType: 'Medical License (MD)', licenseNum: 'AZ-MD-45678', issuingState: 'Arizona', issueDate: '2020-01-15', expiryDate: '2027-01-15', daysUntilExpiry: 315, status: 'ACTIVE', deaExpiry: '2026-08-31', deaStatus: 'ACTIVE' },
  { id: '5', providerName: 'Dr. Sarah Kim', licenseType: 'Medical License (MD)', licenseNum: 'AZ-MD-56789', issuingState: 'Arizona', issueDate: '2015-08-01', expiryDate: '2025-08-01', daysUntilExpiry: -219, status: 'EXPIRED', deaExpiry: '2025-07-31', deaStatus: 'EXPIRED' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:          { label: 'Active',          color: 'bg-emerald-100 text-emerald-700' },
  EXPIRED:         { label: 'EXPIRED',          color: 'bg-red-100 text-red-700' },
  EXPIRING_SOON:   { label: 'Expiring Soon',   color: 'bg-amber-100 text-amber-700' },
  PENDING_RENEWAL: { label: 'Renewal Pending', color: 'bg-blue-100 text-blue-700' },
};

export default function LicensesPage() {
  const expired = mockLicenses.filter(l => l.status === 'EXPIRED').length;
  const expiringSoon = mockLicenses.filter(l => l.daysUntilExpiry > 0 && l.daysUntilExpiry <= 60).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">License Tracker</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">TJC MS.06.01</span>
          </div>
          <p className="text-slate-400 text-sm">Medical licenses, APRN licenses, and DEA registrations — expiry tracking with automated alerts.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add License
        </button>
      </div>

      {(expired > 0 || expiringSoon > 0) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            {expired > 0 && <p className="text-sm font-semibold text-red-300">{expired} license(s) EXPIRED — providers may not exercise clinical privileges until renewed.</p>}
            {expiringSoon > 0 && <p className="text-sm text-amber-300 mt-1">{expiringSoon} license(s) expiring within 60 days — initiate renewal immediately.</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Expired Licenses', value: expired, color: expired > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Expiring Within 60 Days', value: expiringSoon, color: expiringSoon > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Active & Current', value: mockLicenses.filter(l => l.status === 'ACTIVE' && l.daysUntilExpiry > 60).length, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Provider', 'License Type', 'License #', 'State', 'Expiry', 'Days', 'Status', 'DEA Expiry', 'DEA Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockLicenses.map(l => (
              <tr key={l.id} className={`hover:bg-white/5 transition-colors ${l.status === 'EXPIRED' ? 'bg-red-500/5' : l.daysUntilExpiry <= 60 && l.daysUntilExpiry > 0 ? 'bg-amber-500/5' : ''}`}>
                <td className="px-3 py-3 font-semibold text-white text-xs">{l.providerName}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{l.licenseType}</td>
                <td className="px-3 py-3 text-slate-500 text-xs font-mono">{l.licenseNum}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{l.issuingState}</td>
                <td className="px-3 py-3 text-slate-400 text-xs">{l.expiryDate}</td>
                <td className={`px-3 py-3 text-xs font-bold ${l.daysUntilExpiry < 0 ? 'text-red-400' : l.daysUntilExpiry <= 60 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {l.daysUntilExpiry < 0 ? `${Math.abs(l.daysUntilExpiry)}d overdue` : `${l.daysUntilExpiry}d`}
                </td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[l.status]?.color}`}>
                    {statusConfig[l.status]?.label}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-400 text-xs">{l.deaExpiry ?? '—'}</td>
                <td className="px-3 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.deaStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {l.deaStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
