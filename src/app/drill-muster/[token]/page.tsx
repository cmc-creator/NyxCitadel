'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Shield, Users } from 'lucide-react';

type MusterData = {
  id: string;
  staffName: string;
  staffRole: string | null;
  department: string | null;
  musterPoint: string | null;
  status: string;
  checkedInAt: string | null;
  drillName: string;
  drillStatus: string;
};

export default function DrillMusterPage({ params }: { params: { token: string } }) {
  const [entry, setEntry] = useState<MusterData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneData, setDoneData] = useState<{ staffName: string; musterPoint: string | null; checkedInAt: string } | null>(null);

  useEffect(() => {
    fetch(`/api/drill-muster/${params.token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setEntry(data);
      })
      .catch(() => setError('Failed to load muster entry.'))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleCheckIn() {
    setSubmitting(true);
    const res = await fetch(`/api/drill-muster/${params.token}`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      if (data.alreadyCheckedIn) {
        setEntry(prev => prev ? { ...prev, status: 'PRESENT', checkedInAt: data.checkedInAt } : prev);
      } else {
        setDone(true);
        setDoneData({ staffName: data.staffName, musterPoint: data.musterPoint, checkedInAt: data.checkedInAt });
      }
    } else {
      setError(data.error ?? 'Failed to check in.');
    }
    setSubmitting(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent" />
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
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-8 max-w-sm w-full text-center">
        <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-1">Checked In!</h2>
        <p className="text-slate-300 text-sm mb-1">{doneData.staffName}</p>
        {doneData.musterPoint && (
          <p className="text-slate-400 text-sm">Muster Point: <span className="text-white">{doneData.musterPoint}</span></p>
        )}
        <p className="text-slate-500 text-xs mt-2">{new Date(doneData.checkedInAt).toLocaleTimeString()}</p>
      </div>
    </div>
  );

  if (!entry) return null;

  if (entry.status === 'PRESENT') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-8 max-w-sm w-full text-center">
        <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-1">Already Checked In</h2>
        <p className="text-slate-300 text-sm">{entry.staffName}</p>
        {entry.checkedInAt && (
          <p className="text-slate-500 text-xs mt-2">{new Date(entry.checkedInAt).toLocaleTimeString()}</p>
        )}
      </div>
    </div>
  );

  if (entry.drillStatus !== 'IN_PROGRESS') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="rounded-2xl border border-white/10 bg-slate-800 p-8 max-w-sm w-full text-center">
        <Shield className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Drill Not Active</h2>
        <p className="text-slate-400 text-sm">This muster entry is part of a drill that is not currently in progress.</p>
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
          <Users className="w-10 h-10 text-blue-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white mb-1">Muster Check-In</h1>
          <p className="text-slate-400 text-sm">{entry.drillName}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-700/60 rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-1">Staff</p>
            <p className="text-white font-medium">{entry.staffName}</p>
          </div>
          {entry.staffRole && (
            <div className="bg-slate-700/60 rounded-xl p-3">
              <p className="text-slate-400 text-xs mb-1">Role</p>
              <p className="text-white font-medium">{entry.staffRole}</p>
            </div>
          )}
          {entry.musterPoint && (
            <div className="col-span-2 bg-blue-900/30 border border-blue-500/30 rounded-xl p-3">
              <p className="text-blue-300 text-xs mb-1">Muster Point</p>
              <p className="text-white font-bold text-lg">{entry.musterPoint}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleCheckIn}
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-lg font-bold transition-colors"
        >
          {submitting ? 'Checking In...' : 'Check In at Muster Point'}
        </button>
      </div>
    </div>
  );
}
