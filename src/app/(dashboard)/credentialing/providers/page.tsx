import { UserCheck, Plus, AlertTriangle, Search } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const typeConfig: Record<string, { label: string; color: string }> = {
  PHYSICIAN:    { label: 'MD/DO',   color: 'bg-indigo-100 text-indigo-700' },
  APRN:         { label: 'APRN/NP', color: 'bg-teal-100 text-teal-700' },
  PA:           { label: 'PA',      color: 'bg-blue-100 text-blue-700' },
  PSYCHOLOGIST: { label: 'PhD',     color: 'bg-teal-100 text-teal-700' },
};

const privilegeConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:      { label: 'Active',      color: 'bg-emerald-100 text-emerald-700' },
  PROVISIONAL: { label: 'Provisional', color: 'bg-amber-100 text-amber-700' },
  SUSPENDED:   { label: 'Suspended',   color: 'bg-red-100 text-red-700' },
  INACTIVE:    { label: 'Inactive',    color: 'bg-muted/30 text-muted-foreground' },
};

export default async function ProvidersPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const q = searchParams.q ?? '';

  const providers = await prisma.provider.findMany({
    where: {
      facilityId,
      ...(q ? {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName:  { contains: q, mode: 'insensitive' } },
          { specialty: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: {
      licenses:    { orderBy: { expiryDate: 'asc' }, take: 1 },
      fppeRecords: { where: { status: 'IN_PROGRESS' }, take: 1 },
    },
    orderBy: { lastName: 'asc' },
  });

  const expiringSoon = providers.filter(p =>
    p.licenses.some(l => l.expiryDate <= in90 && l.expiryDate >= now && l.status === 'ACTIVE')
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
          <p className="text-muted-foreground/70 text-sm">Active medical staff - credentials, privileges, license expiry, and OPPE/FPPE status.</p>
        </div>
        <a href="/credentialing/providers/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Provider
        </a>
      </div>

      {expiringSoon.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            {expiringSoon.length} provider license(s) expiring within 90 days: {expiringSoon.map(p => p.lastName).join(', ')}
          </p>
        </div>
      )}

      <form method="GET" className="flex gap-3 items-center bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-muted-foreground/70" />
        <input name="q" defaultValue={q}
          placeholder="Search by name or specialty..."
          className="bg-transparent text-sm text-white placeholder:text-muted-foreground outline-none flex-1" />
      </form>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Provider', 'Type', 'Specialty', 'NPI', 'License Expiry', 'Privileges', 'OPPE/FPPE', 'Reappointment'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground/70 px-3 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {providers.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-muted-foreground text-sm">No providers found.</td></tr>
            ) : providers.map(p => {
              const primaryLicense = p.licenses[0];
              const licExpiry = primaryLicense?.expiryDate;
              const isExpiringSoon = licExpiry ? licExpiry <= in90 && licExpiry >= now : false;
              const isExpired = licExpiry ? licExpiry < now : false;
              const hasFppe = p.fppeRecords.length > 0;
              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-3 font-semibold text-white text-xs">{p.lastName}, {p.firstName} {p.credentials && <span className="text-muted-foreground/70">{p.credentials}</span>}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeConfig[p.providerType]?.color ?? 'bg-muted/30 text-muted-foreground'}`}>
                      {typeConfig[p.providerType]?.label ?? p.providerType}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground/70 text-xs">{p.specialty}</td>
                  <td className="px-3 py-3 text-muted-foreground text-xs font-mono">{p.npi ?? '-'}</td>
                  <td className={`px-3 py-3 text-xs font-semibold ${isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-muted-foreground/70'}`}>
                    {licExpiry ? licExpiry.toLocaleDateString() : '-'}
                    {(isExpiringSoon || isExpired) && <span className="ml-1">⚠️</span>}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${privilegeConfig[p.status]?.color ?? 'bg-muted/30 text-muted-foreground'}`}>
                      {privilegeConfig[p.status]?.label ?? p.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {hasFppe
                      ? <span className="text-amber-400 font-semibold">FPPE Active</span>
                      : <span className="text-emerald-400">Current</span>}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground/70 text-xs">
                    {p.reappointmentDate ? p.reappointmentDate.toLocaleDateString() : '-'}
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
