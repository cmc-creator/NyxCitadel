import { Biohazard, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE:       { label: 'Active',      color: 'bg-red-100 text-red-700' },
  CONTAINED:    { label: 'Contained',   color: 'bg-amber-100 text-amber-700' },
  RESOLVED:     { label: 'Resolved',    color: 'bg-emerald-100 text-emerald-700' },
  SURVEILLANCE: { label: 'Surveillance', color: 'bg-blue-100 text-blue-700' },
};

export default async function OutbreaksPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;

  const outbreaks = await prisma.icOutbreak.findMany({
    where: { facilityId },
    orderBy: { startDate: 'desc' },
  });

  const active = outbreaks.filter(o => o.status === 'ACTIVE' || o.status === 'CONTAINED').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Biohazard className="w-5 h-5 text-red-400" />
            <h1 className="text-xl font-bold text-white">Outbreak Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Reportable</span>
          </div>
          <p className="text-slate-400 text-sm">Track active and resolved outbreaks, containment measures, and health department notification.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log Outbreak
        </button>
      </div>

      {active === 0 ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-300">No active outbreaks — facility is clear</p>
        </div>
      ) : (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-300">{active} Active Outbreak{active > 1 ? 's' : ''} — immediate containment required</p>
        </div>
      )}

      {outbreaks.length > 0 ? (
        <div className="space-y-4">
          {outbreaks.map(o => (
            <div key={o.id} className="rounded-xl bg-slate-800/50 border border-white/10 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-slate-400">{o.outbreakNumber}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConfig[o.status]?.color ?? 'bg-slate-100 text-slate-600'}`}>
                      {statusConfig[o.status]?.label ?? o.status}
                    </span>
                    {o.reportedToHealth && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">DOH Reported</span>
                    )}
                  </div>
                  <h3 className="text-white font-bold">{o.organism} — {o.unitAffected}</h3>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>Start: {new Date(o.startDate).toLocaleDateString()}</p>
                  {o.endDate && <p>End: {new Date(o.endDate).toLocaleDateString()}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="bg-slate-900/40 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-white">{o.caseCount}</p>
                  <p className="text-xs text-slate-400">Total Cases</p>
                </div>
              </div>
              {o.containmentActions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1.5">Containment Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {o.containmentActions.map((a, i) => (
                      <span key={i} className="text-xs bg-slate-700 text-slate-300 rounded-full px-3 py-1">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <Biohazard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No outbreaks on record.</p>
        </div>
      )}
    </div>
  );
}
