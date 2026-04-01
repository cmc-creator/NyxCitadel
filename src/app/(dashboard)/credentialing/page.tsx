import Link from 'next/link';
import { UserCheck, Award, FileCheck, AlertTriangle, ChevronRight, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function CredentialingPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [activeProviders, expiringLicenses, activeFppe] = await Promise.all([
    prisma.provider.findMany({
      where: { facilityId, status: 'ACTIVE' },
      orderBy: [{ lastName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, credentials: true, specialty: true, providerType: true, reappointmentDate: true, status: true },
      take: 10,
    }),
    prisma.providerLicense.findMany({
      where: { provider: { facilityId }, expiryDate: { lte: in90, gte: now }, status: 'ACTIVE' },
      include: { provider: { select: { firstName: true, lastName: true } } },
      orderBy: { expiryDate: 'asc' },
    }),
    prisma.fppeRecord.count({ where: { provider: { facilityId }, status: 'IN_PROGRESS' } }),
  ]);

  const totalActive = await prisma.provider.count({ where: { facilityId, status: 'ACTIVE' } });

  const subModules = [
    { href: '/credentialing/providers', title: 'Provider Directory', description: 'All credentialed providers — status, specialty, privileges, and reappointment dates.', icon: '👩‍⚕️', badge: 'CVO', badgeColor: 'bg-blue-100 text-blue-700', stat: `${totalActive} Active Providers`, statColor: 'text-emerald-400' },
    { href: '/credentialing/licenses', title: 'License Tracking', description: 'Medical, DEA, APRN, and state licenses — expiry alerts, verification, and renewal workflow.', icon: '📜', badge: 'Auto-Alert', badgeColor: 'bg-amber-100 text-amber-700', stat: expiringLicenses.length > 0 ? `${expiringLicenses.length} Expiring <90 days` : 'All licenses current', statColor: expiringLicenses.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
    { href: '/credentialing/oppe', title: 'OPPE Records', description: 'Ongoing Professional Practice Evaluation — quarterly metrics per provider reviewed by MEC.', icon: '📊', badge: 'TJC MS.06', badgeColor: 'bg-teal-100 text-teal-700', stat: 'OPPE tracking', statColor: 'text-blue-400' },
  ];

  const statusConfig: Record<string, { label: string; color: string }> = {
    ACTIVE:      { label: 'Active',      color: 'bg-emerald-100 text-emerald-700' },
    PENDING:     { label: 'Pending',     color: 'bg-amber-100 text-amber-700' },
    SUSPENDED:   { label: 'Suspended',   color: 'bg-red-100 text-red-700' },
    RESIGNED:    { label: 'Resigned',    color: 'bg-slate-100 text-slate-600' },
    EXPIRED:     { label: 'Expired',     color: 'bg-red-100 text-red-700' },
    REVOKED:     { label: 'Revoked',     color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <UserCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white">Credentialing &amp; Privileging</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">TJC MS.06.01</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">CMS CoP</span>
          </div>
          <p className="text-slate-400 text-sm">Provider licenses, clinical privileges, OPPE/FPPE, and medical staff committee records.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Providers', value: totalActive, icon: UserCheck, color: 'text-indigo-400' },
          { label: 'Licenses Expiring <90 days', value: expiringLicenses.length, icon: Clock, color: 'text-amber-400' },
          { label: 'Active Providers', value: totalActive, icon: Award, color: 'text-emerald-400' },
          { label: 'Active FPPE', value: activeFppe, icon: FileCheck, color: 'text-blue-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl bg-slate-800/50 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {expiringLicenses.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-500/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-semibold text-amber-300">Licenses Expiring Within 90 Days</p>
          </div>
          <div className="divide-y divide-white/5">
            {expiringLicenses.map(l => {
              const daysLeft = Math.ceil((l.expiryDate.getTime() - now.getTime()) / 86400000);
              return (
                <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{l.provider.lastName}, {l.provider.firstName}</p>
                    <p className="text-xs text-slate-400">{l.licenseType} — {l.licenseNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Expires {l.expiryDate.toLocaleDateString()}</p>
                    <span className={`text-xs font-bold ${daysLeft <= 30 ? 'text-red-400' : 'text-amber-400'}`}>{daysLeft} days</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
            {activeProviders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500 text-sm">No active providers on record.</td></tr>
            ) : activeProviders.map(p => (
              <tr key={p.id} className="hover:bg-white/5">
                <td className="px-4 py-2.5 font-semibold text-white text-xs">{p.lastName}, {p.firstName}</td>
                <td className="px-4 py-2.5 text-indigo-300 text-xs font-semibold">{p.credentials}</td>
                <td className="px-4 py-2.5 text-slate-300 text-xs">{p.specialty}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs">{p.providerType.replace(/_/g, ' ')}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs">{p.reappointmentDate ? p.reappointmentDate.toLocaleDateString() : '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[p.status]?.color ?? 'bg-slate-100 text-slate-600'}`}>
                    {statusConfig[p.status]?.label ?? p.status}
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


