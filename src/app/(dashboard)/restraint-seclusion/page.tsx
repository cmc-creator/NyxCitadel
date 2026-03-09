import { AlertTriangle, Plus, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const statusConfig: Record<string, { label: string; classes: string }> = {
  OPEN:       { label: 'Open',       classes: 'bg-red-100 text-red-700' },
  CLOSED:     { label: 'Closed',     classes: 'bg-emerald-100 text-emerald-700' },
  UNDER_REVIEW: { label: 'Under Review', classes: 'bg-yellow-100 text-yellow-700' },
};

export default async function RestraintSeclusionPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const events = await prisma.restraintEvent.findMany({
    where: { facilityId },
    orderBy: { eventDate: 'desc' },
    take: 60,
  });

  const openEvents = events.filter(e => e.status === 'OPEN').length;
  const deathCount = events.filter(e => e.deathOccurred).length;
  const ytdCount = events.filter(e => e.eventDate >= yearStart).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h1 className="text-xl font-bold text-white">Restraint & Seclusion</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">TJC PC.03</span>
          </div>
          <p className="text-slate-400 text-sm">Track restraint and seclusion events with death reporting and CMS compliance.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Log Event
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: events.length, color: 'text-blue-400' },
          { label: 'YTD Events', value: ytdCount, color: 'text-blue-400' },
          { label: 'Open Events', value: openEvents, color: openEvents > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Deaths in Restraint', value: deathCount, color: deathCount > 0 ? 'text-red-400' : 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {deathCount > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-300"><strong>{deathCount} death(s)</strong> associated with restraint or seclusion. CMS reporting required within 24 hours.</p>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 text-xs">
              <th className="text-left px-4 py-3">Event #</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Patient</th>
              <th className="text-left px-4 py-3">Unit</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Duration</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No restraint/seclusion events on record.</td></tr>
            ) : events.map(e => {
              const cfg = statusConfig[e.status] ?? { label: e.status, classes: 'bg-slate-100 text-slate-700' };
              return (
                <tr key={e.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${e.deathOccurred ? 'bg-red-500/5' : ''}`}>
                  <td className="px-4 py-3 text-slate-300">{e.eventNumber}</td>
                  <td className="px-4 py-3 text-slate-300">{e.eventDate.toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-white font-medium">
                    {e.patientInitials}
                    {e.deathOccurred && <span className="ml-1 text-xs text-red-400 font-semibold">[DEATH]</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{e.unit ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{e.rsType ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{e.durationMinutes ? `${e.durationMinutes} min` : '—'}</td>
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
