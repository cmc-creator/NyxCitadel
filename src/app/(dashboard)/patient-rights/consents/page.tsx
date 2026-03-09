import { FileText, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const typeLabels: Record<string, string> = {
  GENERAL_TREATMENT:       'General Treatment',
  PSYCHOTROPIC_MEDICATION: 'Psychotropic Medication',
  ECT:                     'Electroconvulsive Therapy',
  RESEARCH_PARTICIPATION:  'Research Participation',
  PHOTOGRAPHY:             'Photography / Recording',
  RELEASE_OF_INFORMATION:  'Release of Information',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:             { label: 'Active',    color: 'bg-emerald-100 text-emerald-700' },
  REVOKED:            { label: 'Revoked',   color: 'bg-red-100 text-red-700' },
  EXPIRED:            { label: 'Expired',   color: 'bg-slate-100 text-slate-600' },
  PENDING:            { label: 'Pending',   color: 'bg-amber-100 text-amber-700' },
  SURROGATE_OBTAINED: { label: 'Surrogate', color: 'bg-blue-100 text-blue-700' },
};

export default async function ConsentsPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const consents = await prisma.consentRecord.findMany({
    where: { facilityId },
    orderBy: { consentDate: 'desc' },
    take: 100,
  });

  const pending   = consents.filter(c => c.status === 'PENDING').length;
  const active    = consents.filter(c => c.status === 'ACTIVE' || c.status === 'SURROGATE_OBTAINED').length;
  const surrogate = consents.filter(c => c.status === 'SURROGATE_OBTAINED').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl font-bold text-white">Consent Records</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">CMS §482.13(b)</span>
          </div>
          <p className="text-slate-400 text-sm">Informed consent documentation — treatment, medications, ECT, and capacity determination.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Consent
        </button>
      </div>

      {pending > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{pending} consent(s) pending — capacity determination not yet documented for these patients.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Consents',         value: active,    color: 'text-emerald-400' },
          { label: 'Surrogate/Guardian',       value: surrogate, color: 'text-purple-400' },
          { label: 'Pending',                  value: pending,   color: pending > 0 ? 'text-amber-400' : 'text-emerald-400' },
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
              {['Patient', 'Consent Type', 'Date Signed', 'Obtained By', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {consents.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500 text-sm">No consent records found.</td></tr>
            ) : consents.map(c => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-bold text-white">{c.patientInitials}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{typeLabels[c.consentType] ?? c.consentType}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.consentDate ? c.consentDate.toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.obtainedBy ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[c.status]?.color ?? 'bg-slate-100 text-slate-600'}`}>
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


const mockConsents = [
  { id: '1', patientInitials: 'J.D.', consentType: 'GENERAL_TREATMENT', signedDate: '2026-03-06', capacityDetermined: true, capacityOutcome: 'HAS_CAPACITY', guardianInvolved: false, status: 'ACTIVE', signedBy: 'Patient' },
  { id: '2', patientInitials: 'M.K.', consentType: 'PSYCHOTROPIC_MEDICATION', signedDate: '2026-03-04', capacityDetermined: true, capacityOutcome: 'HAS_CAPACITY', guardianInvolved: false, status: 'ACTIVE', signedBy: 'Patient' },
  { id: '3', patientInitials: 'R.T.', consentType: 'PSYCHOTROPIC_MEDICATION', signedDate: '2026-03-05', capacityDetermined: true, capacityOutcome: 'LACKS_CAPACITY', guardianInvolved: true, status: 'SURROGATE_OBTAINED', signedBy: 'Legal Guardian' },
  { id: '4', patientInitials: 'A.B.', consentType: 'ECT', signedDate: '2026-03-03', capacityDetermined: true, capacityOutcome: 'HAS_CAPACITY', guardianInvolved: false, status: 'ACTIVE', signedBy: 'Patient' },
  { id: '5', patientInitials: 'S.L.', consentType: 'RESEARCH_PARTICIPATION', signedDate: null, capacityDetermined: false, capacityOutcome: null, guardianInvolved: false, status: 'PENDING', signedBy: null },
];

const typeLabels: Record<string, string> = {
  GENERAL_TREATMENT:        'General Treatment',
  PSYCHOTROPIC_MEDICATION:  'Psychotropic Medication',
  ECT:                      'Electroconvulsive Therapy',
  RESEARCH_PARTICIPATION:   'Research Participation',
  PHOTOGRAPHY:              'Photography / Recording',
  RELEASE_OF_INFORMATION:   'Release of Information',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:             { label: 'Active',             color: 'bg-emerald-100 text-emerald-700' },
  REVOKED:            { label: 'Revoked',            color: 'bg-red-100 text-red-700' },
  EXPIRED:            { label: 'Expired',            color: 'bg-slate-100 text-slate-600' },
  PENDING:            { label: 'Pending',            color: 'bg-amber-100 text-amber-700' },
  SURROGATE_OBTAINED: { label: 'Surrogate',          color: 'bg-blue-100 text-blue-700' },
};

export default function ConsentsPage() {
  const pending = mockConsents.filter(c => c.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl font-bold text-white">Consent Records</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">CMS §482.13(b)</span>
          </div>
          <p className="text-slate-400 text-sm">Informed consent documentation — treatment, medications, ECT, and capacity determination.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Consent
        </button>
      </div>

      {pending > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-300">{pending} consent(s) pending — capacity determination not yet documented for these patients.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Consents', value: mockConsents.filter(c => c.status === 'ACTIVE' || c.status === 'SURROGATE_OBTAINED').length, color: 'text-emerald-400' },
          { label: 'Capacity Determinations', value: mockConsents.filter(c => c.capacityDetermined).length, color: 'text-blue-400' },
          { label: 'Surrogate/Guardian', value: mockConsents.filter(c => c.guardianInvolved).length, color: 'text-purple-400' },
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
              {['Patient', 'Consent Type', 'Date Signed', 'Capacity', 'Signed By', 'Status'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockConsents.map(c => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-bold text-white">{c.patientInitials}</td>
                <td className="px-4 py-3 text-slate-300 text-xs">{typeLabels[c.consentType] ?? c.consentType}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.signedDate ?? '—'}</td>
                <td className="px-4 py-3 text-xs">
                  {c.capacityOutcome === 'HAS_CAPACITY' && <span className="text-emerald-400">Has Capacity</span>}
                  {c.capacityOutcome === 'LACKS_CAPACITY' && <span className="text-amber-400">Lacks Capacity</span>}
                  {!c.capacityOutcome && <span className="text-slate-500">Not assessed</span>}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{c.signedBy ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[c.status]?.color}`}>
                    {statusConfig[c.status]?.label}
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
