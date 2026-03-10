import { ClipboardList, Plus } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; classes: string }> = {
  ACTIVE:     { label: 'Active',    classes: 'bg-emerald-100 text-emerald-700' },
  PENDING:    { label: 'Pending',   classes: 'bg-yellow-100 text-yellow-700' },
  COMPLETED:  { label: 'Completed', classes: 'bg-blue-100 text-blue-700' },
  OVERDUE:    { label: 'Overdue',   classes: 'bg-red-100 text-red-700' },
};

export default async function TreatmentPlansPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();

  const plans = await prisma.treatmentPlan.findMany({
    where: { facilityId },
    orderBy: { admitDate: 'desc' },
    take: 60,
  });

  const active = plans.filter(p => p.status === 'ACTIVE').length;
  const overdue = plans.filter(p => p.status === 'OVERDUE').length;
  const pending = plans.filter(p => p.status === 'PENDING').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white">Treatment Plans</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">TJC RC.02</span>
          </div>
          <p className="text-slate-400 text-sm">Individualized plan-of-care tracking and interdisciplinary team documentation.</p>
        </div>
        <a href="/treatment-plans/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Plan
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Plans', value: plans.length, color: 'text-blue-400' },
          { label: 'Active', value: active, color: 'text-emerald-400' },
          { label: 'Pending Creation', value: pending, color: pending > 0 ? 'text-amber-400' : 'text-slate-400' },
          { label: 'Overdue', value: overdue, color: overdue > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-xs">
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-left px-4 py-3">Admit Date</th>
              <th className="text-left px-4 py-3">Unit</th>
              <th className="text-left px-4 py-3">Primary Dx</th>
              <th className="text-left px-4 py-3">Plan Created</th>
              <th className="text-left px-4 py-3">Est. LOS</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No treatment plans on record.</td></tr>
            ) : plans.map(p => {
              const cfg = statusConfig[p.status] ?? { label: p.status, classes: 'bg-slate-100 text-slate-700' };
              return (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{p.patientInitials}</td>
                  <td className="px-4 py-3 text-slate-300">{p.admitDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-400">{p.unit ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{p.primaryDx ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{p.planCreatedDate?.toLocaleDateString() ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{p.estimatedLos ? `${p.estimatedLos}d` : '—'}</td>
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
