import { Shield, Plus, AlertTriangle } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Osha300AButton } from '@/components/workforce/Osha300AButton';

export const dynamic = 'force-dynamic';

export default async function OshaLogPage() {
  const session = await auth();
  const facilityId = session!.user.facilityId;
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const logs = await prisma.oshaLog.findMany({
    where: { facilityId },
    orderBy: { injuryDate: 'desc' },
  });

  const recordable = logs.filter(l => l.recordable).length;
  const ytdLogs = logs.filter(l => l.injuryDate >= yearStart).length;
  const daysAway = logs.reduce((sum, l) => sum + (l.daysAway ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">OSHA 300 Log</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">29 CFR 1904</span>
          </div>
          <p className="text-muted-foreground/70 text-sm">Recordable work-related injuries and illnesses per OSHA 300/300A requirements.</p>
        </div>
        <div className="flex items-center gap-2">
          <Osha300AButton />
          <a href="/workforce-health/osha/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Entry
          </a>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: logs.length, color: 'text-blue-400' },
          { label: 'YTD Incidents', value: ytdLogs, color: 'text-blue-400' },
          { label: 'Recordable Cases', value: recordable, color: recordable > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Total Days Away', value: daysAway, color: daysAway > 0 ? 'text-amber-400' : 'text-muted-foreground/70' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
            <p className="text-xs text-muted-foreground/70 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground/70 text-xs">
              <th className="text-left px-4 py-3">Case #</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Employee</th>
              <th className="text-left px-4 py-3">Title / Dept</th>
              <th className="text-left px-4 py-3">Injury Type</th>
              <th className="text-left px-4 py-3">Days Away</th>
              <th className="text-left px-4 py-3">Recordable</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">No OSHA log entries on record.</td></tr>
            ) : logs.map(l => (
              <tr key={l.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-slate-300">{l.caseNumber}</td>
                <td className="px-4 py-3 text-slate-300">{l.injuryDate.toLocaleDateString()}</td>
                <td className="px-4 py-3 text-white font-medium">{l.employeeName}</td>
                <td className="px-4 py-3 text-muted-foreground/70">{l.jobTitle ?? '-'} {l.department ? `/ ${l.department}` : ''}</td>
                <td className="px-4 py-3 text-muted-foreground/70">{l.injuryType ?? '-'}</td>
                <td className="px-4 py-3 text-slate-300">{l.daysAway ?? 0}</td>
                <td className="px-4 py-3">
                  {l.recordable
                    ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Yes</span>
                    : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
