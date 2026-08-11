import { FileText, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const typeLabels: Record<string, string> = {
  GENERAL_TREATMENT:       'General Treatment',
  MEDICATION:              'Medication',
  PROCEDURE:               'Procedure',
  TELEHEALTH:              'Telehealth',
  ECT:                     'Electroconvulsive Therapy',
  PARTICIPATION_IN_RESEARCH:'Research Participation',
  PHOTOGRAPHY_RECORDING:   'Photography / Recording',
  RELEASE_OF_INFO:         'Release of Information',
  SPECIALIZED_TREATMENT:   'Specialized Treatment',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  SIGNED:           { label: 'Signed',           color: 'bg-emerald-100 text-emerald-700' },
  VERBAL:           { label: 'Verbal',           color: 'bg-blue-100 text-blue-700' },
  REFUSED:          { label: 'Refused',          color: 'bg-amber-100 text-amber-700' },
  REVOKED:          { label: 'Revoked',          color: 'bg-red-100 text-red-700' },
  UNABLE_CAPACITY:  { label: 'Unable Capacity',  color: 'bg-teal-100 text-teal-700' },
};

export default async function ConsentsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const consents = await prisma.consentRecord.findMany({
    where: { facilityId },
    orderBy: { consentDate: 'desc' },
    take: 100,
  });

  const pending = consents.filter(c => !c.patientCapacityDetermined).length;
  const active = consents.filter(c => c.status === 'SIGNED' || c.status === 'VERBAL').length;
  const surrogate = consents.filter(c => Boolean(c.legalRepresentative)).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl font-bold text-white">Consent Records</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">CMS §482.13(b)</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Informed consent documentation - treatment, medications, ECT, and capacity determination.</p>
        </div>
        <a href="/patient-rights/consents/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Consent
        </a>
      </div>

      {pending > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{pending} consent record(s) are missing capacity determination documentation.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Consents',         value: active,    color: 'text-emerald-400' },
          { label: 'Surrogate/Guardian',       value: surrogate, color: 'text-teal-400' },
          { label: 'Capacity Undocumented',    value: pending,   color: pending > 0 ? 'text-amber-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl bg-slate-800/50 border border-white/10 p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground/70 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-slate-800/50 border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              {['Patient', 'Consent Type', 'Date Signed', 'Obtained By', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-muted-foreground/70 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {consents.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No consent records found.</td></tr>
            ) : consents.map(c => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-bold text-white">{c.patientInitials}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{typeLabels[c.consentType] ?? c.consentType}</td>
                <td className="px-4 py-3 text-muted-foreground/70 text-xs">{c.consentDate ? c.consentDate.toLocaleDateString() : '-'}</td>
                <td className="px-4 py-3 text-muted-foreground/70 text-xs">{c.obtainedBy ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[c.status]?.color ?? 'bg-muted/30 text-muted-foreground'}`}>
                    {statusConfig[c.status]?.label ?? c.status}
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


