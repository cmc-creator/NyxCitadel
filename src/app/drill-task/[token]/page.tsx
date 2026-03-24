'use client';
import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { CheckCircle, AlertTriangle, Clock, Target, Loader2, XCircle } from 'lucide-react';

type Task = {
  taskName: string;
  assignedRole: string;
  locationLabel: string;
  timeLimitMinutes: number;
  completedAt: string | null;
  completedBy: string | null;
  isMissed: boolean;
  drillName: string;
  drillStatus: string;
  drillType: string;
};

export default function DrillTaskPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; isMissed?: boolean; completedBy?: string; completedAt?: string; error?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/drill-tasks/${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setTask(d); })
      .catch(() => setError('Failed to load task.'))
      .finally(() => setLoading(false));
  }, [token]);

  async function complete() {
    setSubmitting(true);
    try {
      const name = prompt('Your name (optional):') ?? 'Staff (QR Scan)';
      const r = await fetch(`/api/drill-tasks/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedBy: name || 'Staff (QR Scan)' }),
      });
      const d = await r.json();
      setResult(d);
    } catch {
      setResult({ error: 'Completion failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-8 max-w-sm w-full text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h2 className="text-white font-bold text-lg mb-2">Invalid QR Code</h2>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    </div>
  );

  const alreadyDone = task?.completedAt != null || result?.success;
  const missed = result?.isMissed ?? task?.isMissed;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-5">

        {/* Header */}
        <div className="text-center">
          <Image src="/citadellogo.png" alt="NyxCitadel" width={48} height={48} className="mx-auto rounded-xl mb-3" />
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Drill Kill Task</p>
          <h1 className="text-white font-bold text-xl mt-1">{task?.drillName}</h1>
          <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            task?.drillStatus === 'IN_PROGRESS' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-700 text-slate-400'
          }`}>{task?.drillStatus?.replace('_', ' ')}</span>
        </div>

        {/* Task card */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-semibold">{task?.taskName}</p>
              <p className="text-slate-400 text-xs">Assigned to: {task?.assignedRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Location &middot; Time limit</p>
              <p className="text-white font-medium">{task?.locationLabel} &middot; {task?.timeLimitMinutes} min</p>
            </div>
          </div>
        </div>

        {/* Result / action */}
        {alreadyDone ? (
          <div className={`border rounded-2xl p-6 text-center ${
            missed
              ? 'bg-red-900/20 border-red-500/30'
              : 'bg-emerald-900/30 border-emerald-500/30'
          }`}>
            {missed
              ? <XCircle className="w-14 h-14 text-red-400 mx-auto mb-3" />
              : <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-3" />}
            <p className={`font-bold text-lg ${missed ? 'text-red-300' : 'text-emerald-300'}`}>
              {missed ? 'Task Completed Late' : 'Task Complete!'}
            </p>
            {(result?.completedBy ?? task?.completedBy) && (
              <p className="text-slate-400 text-sm mt-1">By: {result?.completedBy ?? task?.completedBy}</p>
            )}
          </div>
        ) : result?.error ? (
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 text-sm">{result.error}</p>
          </div>
        ) : (
          <button
            onClick={complete}
            disabled={submitting || task?.drillStatus !== 'IN_PROGRESS'}
            className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
            {submitting ? 'Confirming…' : 'Mark Task Complete'}
          </button>
        )}

        {task?.drillStatus !== 'IN_PROGRESS' && !alreadyDone && (
          <p className="text-center text-xs text-slate-500">Task completion is only available while the drill is active.</p>
        )}

        <p className="text-center text-xs text-slate-600">&copy; {new Date().getFullYear()} NyxCollective LLC</p>
      </div>
    </div>
  );
}

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
          <p className="text-slate-400 text-sm">Recordable work-related injuries and illnesses per OSHA 300/300A requirements.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Incidents', value: logs.length, color: 'text-blue-400' },
          { label: 'YTD Incidents', value: ytdLogs, color: 'text-blue-400' },
          { label: 'Recordable Cases', value: recordable, color: recordable > 0 ? 'text-amber-400' : 'text-emerald-400' },
          { label: 'Total Days Away', value: daysAway, color: daysAway > 0 ? 'text-amber-400' : 'text-slate-400' },
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
                <td className="px-4 py-3 text-slate-400">{l.jobTitle ?? '-'} {l.department ? `/ ${l.department}` : ''}</td>
                <td className="px-4 py-3 text-slate-400">{l.injuryType ?? '-'}</td>
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
