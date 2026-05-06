'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, GraduationCap, Clock, Calendar } from 'lucide-react';

interface TrainingData {
  id: string;
  staffName: string;
  trainingName: string;
  category: string;
  assignedBy: string;
  assignedReason: string | null;
  expiryDate: string | null;
  status: string;
  completedDate: string | null;
  facilityName: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ANNUAL: 'Annual',
  ORIENTATION: 'Orientation',
  COMPETENCY: 'Competency',
  POLICY_CHANGE: 'Policy Change',
  DISCIPLINARY: 'Disciplinary',
  REGULATORY: 'Regulatory',
  OTHER: 'Other',
};

export default function TrainingCompletePage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<TrainingData | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch(`/api/training/complete/${params.token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setData(d);
          if (d.status === 'COMPLETED') {
            setDone(true);
            setCompletedAt(d.completedDate);
          }
        }
      })
      .catch(() => setError('Failed to load training details.'));
  }, [params.token]);

  async function markComplete() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/training/complete/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes.trim() || undefined }),
      });
      const d = await res.json();
      if (d.success || d.alreadyCompleted) {
        setDone(true);
        setCompletedAt(d.completedDate ?? new Date().toISOString());
      } else {
        setError(d.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Failed to record completion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-gray-900 mb-2">Link Not Found</h1>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading&hellip;</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="font-semibold text-gray-700">{data.facilityName}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Training Completion</h1>
        </div>

        {/* Training card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <GraduationCap className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs bg-teal-50 text-teal-700 rounded-full px-2 py-0.5 font-medium">
                  {CATEGORY_LABELS[data.category] ?? data.category}
                </span>
              </div>
              <h2 className="font-semibold text-gray-900">{data.trainingName}</h2>
            </div>
          </div>

          {data.assignedReason && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed bg-gray-50 rounded-lg p-3">
              <span className="font-medium text-gray-700">Reason: </span>{data.assignedReason}
            </p>
          )}

          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Assigned by {data.assignedBy}</span>
            </div>
            {data.expiryDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Due by{' '}
                  {new Date(data.expiryDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        {done ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Training Completed</h2>
            <p className="text-sm text-gray-600">
              Thank you, <strong>{data.staffName}</strong>. Your completion has been recorded.
            </p>
            {completedAt && (
              <p className="text-xs text-gray-400 mt-2">
                {new Date(completedAt).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-3">You may close this window.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-700 mb-4">
              Hello <strong>{data.staffName}</strong>. Complete the training listed above, then click the button below to confirm completion.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any notes about this training..."
                rows={2}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={markComplete}
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? 'Recording\u2026' : 'Mark Training as Complete'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Your completion will be timestamped and stored for compliance records.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
