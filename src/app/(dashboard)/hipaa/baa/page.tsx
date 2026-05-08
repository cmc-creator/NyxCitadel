import { FileText, Plus, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { BaaStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:            { label: 'Active',          color: 'bg-emerald-100 text-emerald-700' },
  EXPIRED:           { label: 'Expired',         color: 'bg-red-100 text-red-700' },
  PENDING_RENEWAL:   { label: 'Pending Renewal', color: 'bg-amber-100 text-amber-700' },
  TERMINATED:        { label: 'Terminated',      color: 'bg-slate-600 text-slate-300' },
  UNDER_NEGOTIATION: { label: 'Negotiation',     color: 'bg-blue-100 text-blue-700' },
};

export default async function BaaPage({ searchParams }: { searchParams: { filter?: string } }) {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const filter = searchParams.filter ?? 'ALL';
  const allowedStatuses: readonly BaaStatus[] = ['ACTIVE', 'EXPIRED', 'PENDING_RENEWAL', 'TERMINATED', 'UNDER_NEGOTIATION'];
  const statusFilter = allowedStatuses.includes(filter as BaaStatus) ? (filter as BaaStatus) : undefined;

  const baas = await prisma.baaTracker.findMany({
    where: {
      facilityId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { expiryDate: 'asc' },
  });

  const allBaas = await prisma.baaTracker.findMany({ where: { facilityId }, select: { status: true, expiryDate: true } });
  const expired      = allBaas.filter(b => b.expiryDate && b.expiryDate < now).length;
  const expiringSoon = allBaas.filter(b => b.status === 'ACTIVE' && b.expiryDate && b.expiryDate >= now && b.expiryDate <= in90).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Business Associate Agreement Tracker</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">HIPAA §164.308</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">All vendors and contractors with access to PHI — BAA status, expiry tracking, and renewal workflow.</p>
        </div>
        <a href="/hipaa/baa/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add BAA
        </a>
      </div>

      {(expired > 0 || expiringSoon > 0) && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">
              {expired > 0 && `${expired} BAA(s) expired — immediate renewal required. `}
              {expiringSoon > 0 && `${expiringSoon} BAA(s) expiring within 90 days.`}
            </p>
            <p className="text-xs text-red-200/70 mt-0.5">Expired BAAs mean PHI is shared outside of compliant agreement. HIPAA violation risk.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total BAAs',    value: allBaas.length },
          { label: 'Active',        value: allBaas.filter(b => b.status === 'ACTIVE').length },
          { label: 'Expiring <90d', value: expiringSoon },
          { label: 'Expired',       value: expired },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ALL', 'ACTIVE', 'EXPIRED', 'PENDING_RENEWAL'].map(f => (
          <a key={f} href={`/hipaa/baa?filter=${f}`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-800 text-muted-foreground/70 hover:text-white border border-white/10'}`}>
            {f.replace('_', ' ')}
          </a>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Vendor / BA', 'Service / PHI Access', 'Agreement Date', 'Expiry', 'Days Left', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground/70 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {baas.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500 text-sm">No BAAs on record.</td></tr>
            ) : baas.map(b => {
              const daysLeft = b.expiryDate
                ? Math.ceil((b.expiryDate.getTime() - now.getTime()) / 86400000)
                : null;
              return (
                <tr key={b.id} className={`hover:bg-white/5 transition-colors ${b.status === 'EXPIRED' ? 'bg-red-500/5' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-white text-xs">{b.vendorName}</td>
                  <td className="px-4 py-3 text-muted-foreground/70 text-xs">{b.serviceDescription}</td>
                  <td className="px-4 py-3 text-muted-foreground/70 text-xs">{b.agreementDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{b.expiryDate ? b.expiryDate.toLocaleDateString() : '—'}</td>
                  <td className={`px-4 py-3 font-bold text-xs ${daysLeft == null ? 'text-slate-500' : daysLeft <= 0 ? 'text-red-400' : daysLeft <= 90 ? 'text-amber-400' : 'text-muted-foreground/70'}`}>
                    {daysLeft == null ? '—' : daysLeft <= 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[b.status]?.color ?? 'bg-slate-100 text-slate-600'}`}>
                      {statusConfig[b.status]?.label ?? b.status}
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


