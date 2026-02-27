'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, QrCode, ShieldAlert } from 'lucide-react';

export default function DrillTaskScanPage({ params }: { params: { token: string } }) {
  const [task, setTask]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]   = useState<{ success?: boolean; isMissed?: boolean; error?: string } | null>(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`/api/drill-tasks/${params.token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setTask(data);
      })
      .catch(() => setError('Failed to load task.'))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/drill-tasks/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedBy: name.trim() || 'Staff (QR Scan)' }),
      });
      const data = await res.json();
      if (!res.ok) setResult({ error: data.error });
      else setResult({ success: true, isMissed: data.isMissed });
    } catch {
      setResult({ error: 'Network error. Try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-500 mt-2 text-sm">Loading task…</p>
      </Screen>
    );
  }

  if (error || (!task && !loading)) {
    return (
      <Screen>
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="font-semibold text-red-700 mt-2">Task Not Found</p>
        <p className="text-sm text-slate-500 mt-1">{error || 'This QR code is invalid or expired.'}</p>
      </Screen>
    );
  }

  if (task.completedAt) {
    return (
      <Screen>
        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        <p className="font-bold text-emerald-700 text-lg mt-2">Already Complete</p>
        <p className="text-sm text-slate-600 mt-1">{task.taskName}</p>
        <p className="text-xs text-slate-400 mt-0.5">Completed by {task.completedBy}</p>
      </Screen>
    );
  }

  if (result?.success) {
    return (
      <Screen>
        {result.isMissed ? (
          <>
            <AlertTriangle className="w-12 h-12 text-orange-500" />
            <p className="font-bold text-orange-700 text-lg mt-2">Task Completed — LATE</p>
            <p className="text-sm text-slate-600 mt-1">Time limit exceeded. This will be flagged in the drill scorecard.</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="font-bold text-emerald-700 text-xl mt-2">Task Complete ✓</p>
            <p className="text-sm text-slate-600 mt-1">{task.taskName}</p>
            <p className="text-xs text-slate-400 mt-0.5">Recorded at {new Date().toLocaleTimeString()}</p>
          </>
        )}
        <div className="mt-4 bg-slate-50 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500">You may close this window.</p>
        </div>
      </Screen>
    );
  }

  if (result?.error) {
    return (
      <Screen>
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="font-semibold text-red-700 mt-2">{result.error}</p>
        <button
          onClick={() => setResult(null)}
          className="mt-3 text-sm text-indigo-600 underline"
        >
          Try again
        </button>
      </Screen>
    );
  }

  const drillActive = task.drillStatus === 'IN_PROGRESS';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="w-6 h-6 text-red-400" />
        <span className="text-white font-bold text-lg tracking-wide">NyxCitadel</span>
        {drillActive && (
          <span className="ml-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse font-medium">
            DRILL ACTIVE
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Task info */}
        <div className="bg-indigo-600 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <QrCode className="w-4 h-4 text-indigo-200" />
            <span className="text-indigo-200 text-xs font-medium uppercase tracking-wide">Kill Task — Location Scan</span>
          </div>
          <p className="text-white text-lg font-bold">{task.taskName}</p>
          <p className="text-indigo-200 text-sm mt-0.5">{task.locationLabel}</p>
        </div>

        <div className="px-5 py-4 space-y-3 border-b border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Drill</span>
            <span className="font-medium text-slate-800">{task.drillName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Assigned Role</span>
            <span className="font-medium text-slate-800">{task.assignedRole}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Time Limit</span>
            <span className={`font-bold ${task.timeLimitMinutes <= 3 ? 'text-red-600' : 'text-slate-800'}`}>
              {task.timeLimitMinutes} min
            </span>
          </div>
        </div>

        {!drillActive ? (
          <div className="px-5 py-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-sm text-orange-700 font-medium">Drill is not currently active.</p>
            <p className="text-xs text-slate-400 mt-1">This QR code can only be scanned during an active drill.</p>
          </div>
        ) : (
          <form onSubmit={handleComplete} className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Completing…</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Confirm Task Complete</>
              )}
            </button>
            <p className="text-xs text-center text-slate-400">
              By tapping above, you confirm this task was completed at this location.
            </p>
          </form>
        )}
      </div>

      <p className="text-slate-500 text-xs mt-4">NyxCitadel Compliance Platform</p>
    </div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      {children}
    </div>
  );
}
