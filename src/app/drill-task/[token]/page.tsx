'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Shield } from 'lucide-react';

type TaskData = {
  id: string;
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

export default function DrillTaskPage({ params }: { params: { token: string } }) {
  const [task, setTask] = useState<TaskData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedBy, setCompletedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneData, setDoneData] = useState<{ completedBy: string; isMissed: boolean } | null>(null);

  useEffect(() => {
    fetch(`/api/drill-tasks/${params.token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setTask(data);
      })
      .catch(() => setError('Failed to load task.'))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleComplete() {
    setSubmitting(true);
    const res = await fetch(`/api/drill-tasks/${params.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedBy: completedBy.trim() || 'Staff (QR Scan)' }),
    });
    const data = await res.json();
    if (res.ok) {
      setDone(true);
      setDoneData({ completedBy: data.completedBy, isMissed: data.isMissed });
    } else {
      setError(data.error ?? 'Failed to complete task.');
    }
    setSubmitting(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-red-500/30 bg-red-900/20 p-8 max-w-sm w-full text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-white font-semibold">{error}</p>
      </div>
    </div>
  );

  if (done && doneData) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className={`rounded-2xl border p-8 max-w-sm w-full text-center ${
        doneData.isMissed ? 'border-amber-500/30 bg-amber-900/20' : 'border-emerald-500/30 bg-emerald-900/20'
      }`}>
        <CheckCircle className={`w-14 h-14 mx-auto mb-4 ${doneData.isMissed ? 'text-amber-400' : 'text-emerald-400'}`} />
        <h2 className="text-xl font-bold text-white mb-1">{doneData.isMissed ? 'Completed (Late)' : 'Task Complete!'}</h2>
        {task && <p className="text-slate-300 text-sm mb-2">{task.taskName}</p>}
        <p className="text-slate-400 text-xs">Verified by: <span className="text-white">{doneData.completedBy}</span></p>
      </div>
    </div>
  );

  if (!task) return null;

  if (task.completedAt) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-8 max-w-sm w-full text-center">
        <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-1">Already Completed</h2>
        <p className="text-slate-300 text-sm mb-2">{task.taskName}</p>
        <p className="text-slate-400 text-xs">Verified by: <span className="text-white">{task.completedBy}</span></p>
      </div>
    </div>
  );

  if (task.drillStatus !== 'IN_PROGRESS') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-white/10 bg-slate-800 p-8 max-w-sm w-full text-center">
        <Shield className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Drill Not Active</h2>
        <p className="text-slate-400 text-sm">This task is part of a drill that is not currently in progress.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-8 max-w-sm w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold mb-4 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            DRILL IN PROGRESS
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{task.taskName}</h1>
          <p className="text-slate-400 text-sm">{task.drillName}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-700/60 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Assigned Role</p>
            <p className="text-white font-medium">{task.assignedRole}</p>
          </div>
          <div className="bg-slate-700/60 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Location</p>
            <p className="text-white font-medium">{task.locationLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{task.timeLimitMinutes}-minute time limit</span>
        </div>

        <input
          type="text"
          value={completedBy}
          onChange={e => setCompletedBy(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full rounded-xl bg-slate-700/60 border border-white/10 px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <button
          onClick={handleComplete}
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-lg font-bold transition-colors"
        >
          {submitting ? 'Completing...' : 'Complete Task'}
        </button>
      </div>
    </div>
  );
}
