import { Shield, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusConfig: Record<string, { label: string; classes: string }> = {
  COMPLIANT:      { label: 'Compliant',      classes: 'bg-emerald-100 text-emerald-700' },
  ACTION_TAKEN:   { label: 'Action Taken',   classes: 'bg-blue-100 text-blue-700' },
  PENDING:        { label: 'Pending',         classes: 'bg-yellow-100 text-yellow-700' },
  CONCERNS_OPEN:  { label: 'Concerns Open',  classes: 'bg-red-100 text-red-700' },
};

export default async function PdmpPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const checks = await prisma.pdmpCheck.findMany({
    where: { facilityId },
    orderBy: { checkDate: 'desc' },
    take: 50,
  });

  const openConcerns = checks.filter(c => c.status === 'CONCERNS_OPEN').length;
  const significant = checks.filter(c => c.significantFinding).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">PDMP Check Log</h1>
          </div>
          <p className="text-slate-400 text-sm">Prescription Drug Monitoring Program checks for controlled substance prescribers and patients.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Check
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Checks', value: checks.length, color: 'text-blue-400' },
          { label: 'Significant Findings', value: significant, color: 'text-amber-400' },
          { label: 'Open Concerns', value: openConcerns, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {openConcerns > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{openConcerns} PDMP check(s) have open concerns requiring follow-up.</p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-xs">
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-left px-4 py-3">Prescriber ID</th>
              <th className="text-left px-4 py-3">Rx Type</th>
              <th className="text-left px-4 py-3">Finding</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {checks.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No PDMP checks on record.</td></tr>
            ) : checks.map(c => {
              const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-slate-100 text-slate-700' };
              return (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-slate-300">{c.checkDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-300">{c.patientInitials}</td>
                  <td className="px-4 py-3 text-slate-400">{c.prescriberId}</td>
                  <td className="px-4 py-3 text-slate-400">{c.prescriptionType ?? '---'}</td>
                  <td className="px-4 py-3">
                    {c.significantFinding
                      ? <div className="flex items-center gap-1 text-amber-300"><AlertTriangle className="w-3.5 h-3.5" />Yes</div>
                      : <div className="flex items-center gap-1 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" />No</div>}
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.classes}`}>{cfg.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
