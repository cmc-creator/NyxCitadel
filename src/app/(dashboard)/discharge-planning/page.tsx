import { LogOut, Plus, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const statusConfig: Record<string, { label: string; classes: string }> = {
  ACTIVE:      { label: 'Active',      classes: 'bg-blue-100 text-blue-700' },
  UPDATED:     { label: 'Updated',     classes: 'bg-emerald-100 text-emerald-700' },
  DISCHARGED:  { label: 'Discharged',  classes: 'bg-muted/30 text-foreground/80' },
  TRANSFERRED: { label: 'Transferred', classes: 'bg-amber-100 text-amber-700' },
  AMA:         { label: 'AMA',         classes: 'bg-red-100 text-red-700' },
};

export default async function DischargePlanningPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();

  const plans = await prisma.dischargePlan.findMany({
    where: { facilityId },
    orderBy: { estimatedDischargeDate: 'asc' },
    take: 60,
  });

  const barriers = plans.filter(p => Boolean(p.barrierNotes?.trim())).length;
  const delayed = plans.filter(p => p.estimatedDischargeDate && p.estimatedDischargeDate < now && p.status !== 'DISCHARGED').length;
  const ready = plans.filter(p => p.status === 'UPDATED').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <LogOut className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Discharge Planning</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">TJC PC.04</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Transition-of-care coordination, barrier tracking, and estimated discharge timelines.</p>
        </div>
        <a href="/discharge-planning/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Plan
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Plans', value: plans.length, color: 'text-blue-400' },
          { label: 'Ready for Discharge', value: ready, color: 'text-emerald-400' },
          { label: 'Delayed', value: delayed, color: delayed > 0 ? 'text-amber-400' : 'text-muted-foreground/70' },
          { label: 'Barriers Identified', value: barriers, color: barriers > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-muted-foreground/70 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {barriers > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300">{barriers} patient(s) have identified barriers to discharge. Rounding team review required.</p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-800/50 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground/70 text-xs">
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-left px-4 py-3">Admit</th>
              <th className="text-left px-4 py-3">Unit</th>
              <th className="text-left px-4 py-3">Disposition</th>
              <th className="text-left px-4 py-3">Est. Discharge</th>
              <th className="text-left px-4 py-3">Coordinator</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No discharge plans on record.</td></tr>
            ) : plans.map(p => {
              const cfg = statusConfig[p.status] ?? { label: p.status, classes: 'bg-muted/30 text-foreground/80' };
              const isPast = p.estimatedDischargeDate && p.estimatedDischargeDate < now && p.status !== 'DISCHARGED';
              return (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{p.patientInitials}</td>
                  <td className="px-4 py-3 text-slate-300">{p.admitDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted-foreground/70">{p.unit ?? '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground/70">{p.expectedDisposition ?? '-'}</td>
                  <td className={`px-4 py-3 ${isPast ? 'text-red-400 font-medium' : 'text-slate-300'}`}>{p.estimatedDischargeDate?.toLocaleDateString() ?? '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground/70">{p.careCoordinator ?? '-'}</td>
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
