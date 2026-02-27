'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, Users, ShieldAlert } from 'lucide-react';

export default function DrillMusterScanPage({ params }: { params: { token: string } }) {
  const [entry, setEntry]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]   = useState<{ success?: boolean; alreadyCheckedIn?: boolean; error?: string } | null>(null);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`/api/drill-muster/${params.token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setEntry(data);
      })
      .catch(() => setError('Failed to load entry.'))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleCheckIn() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/drill-muster/${params.token}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) setResult({ error: data.error });
      else if (data.alreadyCheckedIn) setResult({ alreadyCheckedIn: true });
      else setResult({ success: true });
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
      </Screen>
    );
  }

  if (error || (!entry && !loading)) {
    return (
      <Screen>
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="font-semibold text-red-700 mt-2">Not Found</p>
        <p className="text-sm text-slate-500 mt-1">{error || 'This QR code is invalid or expired.'}</p>
      </Screen>
    );
  }

  if (result?.alreadyCheckedIn || entry?.status === 'PRESENT') {
    return (
      <Screen>
        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        <p className="font-bold text-emerald-700 text-lg mt-2">Already Checked In</p>
        <p className="text-sm text-slate-600 mt-1">{entry.staffName}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {entry.musterPoint ? `Muster point: ${entry.musterPoint}` : 'Muster point registered'}
        </p>
      </Screen>
    );
  }

  if (result?.success) {
    return (
      <Screen>
        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
        <p className="font-black text-emerald-700 text-2xl mt-2">ACCOUNTED ✓</p>
        <p className="text-slate-700 font-semibold mt-1">{entry.staffName}</p>
        {entry.musterPoint && (
          <p className="text-sm text-slate-500 mt-0.5">Muster Point: {entry.musterPoint}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">Checked in at {new Date().toLocaleTimeString()}</p>
        <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center max-w-xs">
          <p className="text-sm text-emerald-700 font-medium">You are accounted for. Stay at your muster point until the All Clear.</p>
        </div>
      </Screen>
    );
  }

  if (result?.error) {
    return (
      <Screen>
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="font-semibold text-red-700 mt-2">{result.error}</p>
        <button onClick={() => setResult(null)} className="mt-3 text-sm text-indigo-600 underline">
          Try again
        </button>
      </Screen>
    );
  }

  const drillActive = entry.drillStatus === 'IN_PROGRESS';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
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
        <div className="bg-emerald-600 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-emerald-200" />
            <span className="text-emerald-200 text-xs font-medium uppercase tracking-wide">Muster Point Check-In</span>
          </div>
          <p className="text-white text-2xl font-black">{entry.staffName}</p>
          {entry.staffRole && <p className="text-emerald-200 text-sm">{entry.staffRole}</p>}
        </div>

        <div className="px-5 py-4 space-y-3 border-b border-slate-100">
          {entry.department && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Department</span>
              <span className="font-medium text-slate-800">{entry.department}</span>
            </div>
          )}
          {entry.musterPoint && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Muster Point</span>
              <span className="font-medium text-slate-800">{entry.musterPoint}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Drill</span>
            <span className="font-medium text-slate-800">{entry.drillName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status</span>
            <span className="font-bold text-orange-600">UNACCOUNTED</span>
          </div>
        </div>

        {!drillActive ? (
          <div className="px-5 py-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-sm text-orange-700 font-medium">Drill is not currently active.</p>
          </div>
        ) : (
          <div className="px-5 py-5">
            <button
              onClick={handleCheckIn}
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black py-5 rounded-xl text-xl transition-colors flex items-center justify-center gap-3"
            >
              {submitting ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Checking in…</>
              ) : (
                <><CheckCircle2 className="w-7 h-7" /> I AM HERE</>
              )}
            </button>
            <p className="text-xs text-center text-slate-400 mt-3">
              Tap above to confirm you have reached your designated muster point.
            </p>
          </div>
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
