'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, BookOpen, Clock } from 'lucide-react';

interface AckData {
  staffName: string;
  facilityName: string;
  policy: { title: string; policyNumber: string; version: string; summary: string | null; documentUrl: string | null };
  sentAt: string;
  sentBy: string;
  alreadyAcknowledged: boolean;
  acknowledgedAt: string | null;
}

export default function PolicyAckPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<AckData | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [ackTimestamp, setAckTimestamp] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/policies/ack/${params.token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setData(d);
          if (d.alreadyAcknowledged) {
            setDone(true);
            setAckTimestamp(d.acknowledgedAt);
          }
        }
      })
      .catch(() => setError('Failed to load acknowledgment details.'));
  }, [params.token]);

  async function acknowledge() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/policies/ack/${params.token}`, { method: 'POST' });
      const d = await res.json();
      if (d.success || d.alreadyAcknowledged) {
        setDone(true);
        setAckTimestamp(d.acknowledgedAt ?? new Date().toISOString());
      } else {
        setError(d.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Failed to record acknowledgment. Please try again.');
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
          <h1 className="text-xl font-bold text-gray-900">Policy Acknowledgment</h1>
        </div>

        {/* Policy card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-gray-400">{data.policy.policyNumber}</span>
                <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">v{data.policy.version}</span>
              </div>
              <h2 className="font-semibold text-gray-900 mt-0.5">{data.policy.title}</h2>
            </div>
          </div>

          {data.policy.summary && (
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{data.policy.summary.slice(0, 400)}{data.policy.summary.length > 400 ? '\u2026' : ''}</p>
          )}

          {data.policy.documentUrl && (
            <a href={data.policy.documentUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-teal-700 hover:text-teal-900 font-medium mb-4 block">
              View full policy document &rarr;
            </a>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400 pt-3 border-t border-gray-100">
            <Clock className="w-3.5 h-3.5" />
            <span>Sent by {data.sentBy} on {new Date(data.sentAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Action */}
        {done ? (
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-1">Acknowledged</h2>
            <p className="text-sm text-gray-600">
              Thank you, <strong>{data.staffName}</strong>. Your acknowledgment has been recorded.
            </p>
            {ackTimestamp && (
              <p className="text-xs text-gray-400 mt-2">
                {new Date(ackTimestamp).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-3">You may close this window.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-700 mb-4">
              Hello <strong>{data.staffName}</strong>. By clicking the button below, you confirm that you have read and understand the policy listed above.
            </p>
            <button
              onClick={acknowledge}
              disabled={submitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? 'Recording\u2026' : 'I Have Read and Acknowledge This Policy'}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">
              Your acknowledgment will be timestamped and stored for compliance documentation.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
