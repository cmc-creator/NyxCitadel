import { Shield, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:                  { label: 'Active',           color: 'bg-red-100 text-red-700' },
  EXTENDED:                { label: 'Extended',          color: 'bg-amber-100 text-amber-700' },
  DISCHARGED:              { label: 'Discharged',        color: 'bg-emerald-100 text-emerald-700' },
  CONVERTED_VOLUNTARY:     { label: 'Voluntary',         color: 'bg-blue-100 text-blue-700' },
  COURT_ORDERED_CONTINUED: { label: 'Court Continued',   color: 'bg-purple-100 text-purple-700' },
};

export default async function InvoluntaryHoldsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const holds = await prisma.involuntaryHoldLog.findMany({
    where: { facilityId },
    orderBy: { holdStartDate: 'desc' },
    take: 50,
  });

  const active      = holds.filter(h => h.status === 'ACTIVE').length;
  const noLegal     = holds.filter(h => h.status === 'ACTIVE' && !h.legalCounselNotified).length;
  const hasHearing  = holds.filter(h => h.status === 'ACTIVE' && h.courtHearingDate).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-5 h-5 text-red-400" />
            <h1 className="text-xl font-bold text-white">Involuntary Hold Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">ARS Title 36</span>
          </div>
          <p className="text-slate-400 text-sm">72-hour emergency holds, court orders, legal counsel notification, and hearing dates.</p>
        </div>
        <a href="/patient-rights/holds/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Hold
        </a>
      </div>

      {noLegal > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">{noLegal} patient(s) missing legal counsel notification</p>
            <p className="text-xs text-red-200/70 mt-0.5">ARS §36-520 requires notification of right to legal counsel at time of evaluation. Complete legal counsel notification immediately for outstanding holds.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Holds',              value: active,     color: 'text-red-400' },
          { label: 'Legal Counsel Missing',      value: noLegal,    color: noLegal > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Court Hearings Scheduled',  value: hasHearing, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {holds.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-8 text-center text-slate-500 text-sm">No involuntary holds on record.</div>
        ) : holds.map(h => (
          <div key={h.id} className={`rounded-xl border p-4 ${h.status === 'ACTIVE' && !h.legalCounselNotified ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-slate-800/50'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white">{h.patientInitials}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[h.status]?.color ?? 'bg-slate-100 text-slate-600'}`}>
                    {statusConfig[h.status]?.label ?? h.status}
                  </span>
                  {!h.legalCounselNotified && h.status === 'ACTIVE' && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">⚠️ No Legal Counsel</span>
                  )}
                </div>
                <p className="text-sm text-slate-300">{h.holdType}</p>
                <p className="text-xs text-slate-400 mt-0.5">Ordering: {h.orderingPhysician}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Start: {h.holdStartDate.toLocaleDateString()}</p>
                <p>Expiry: {h.holdExpiryDate.toLocaleDateString()}</p>
                {h.courtHearingDate && <p className="text-blue-400">Hearing: {h.courtHearingDate.toLocaleDateString()}</p>}
                {h.legalCounselNotified && <p className="text-emerald-400 mt-0.5">✓ Counsel Notified</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



