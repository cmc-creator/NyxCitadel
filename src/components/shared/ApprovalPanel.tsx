'use client';

import { useState } from 'react';
import { CheckCircle2, RotateCcw, Clock, XCircle, CheckCheck, ChevronDown, ChevronUp } from 'lucide-react';

type ApprovalStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'RETURNED' | 'REJECTED';

export interface ApprovalHistoryEntry {
  userId?: string;
  action: string;
  timestamp: string;
  note?: string;
  actorName?: string;
}

interface ApprovalPanelProps {
  recordId: string;
  approveApiPath: string;  // e.g. /api/caps/[id]/approve
  returnApiPath: string;   // e.g. /api/caps/[id]/return
  approvalStatus: ApprovalStatus;
  approvalHistory: ApprovalHistoryEntry[] | null;
  reviewedBy?: string | null;
  reviewedAt?: Date | string | null;
  reviewNote?: string | null;
  canApprove: boolean;  // true for ADMIN / SUPER_ADMIN
  onUpdated?: () => void;
}

const STATUS_DISPLAY: Record<ApprovalStatus, { label: string; color: string; Icon: React.ElementType }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600', Icon: Clock },
  PENDING_REVIEW: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', Icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
  RETURNED: { label: 'Returned for Revision', color: 'bg-orange-100 text-orange-800', Icon: RotateCcw },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700', Icon: XCircle },
};

export function ApprovalPanel({
  approveApiPath,
  returnApiPath,
  approvalStatus,
  approvalHistory,
  reviewedBy,
  reviewedAt,
  reviewNote,
  canApprove,
  onUpdated,
}: ApprovalPanelProps) {
  const [note, setNote] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const statusInfo = STATUS_DISPLAY[approvalStatus] ?? STATUS_DISPLAY.PENDING_REVIEW;
  const StatusIcon = statusInfo.Icon;

  async function takeAction(apiPath: string) {
    setWorking(true); setError('');
    try {
      const res = await fetch(apiPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Action failed.');
      } else {
        setNote('');
        if (onUpdated) onUpdated();
        else window.location.reload();
      }
    } finally { setWorking(false); }
  }

  const history: ApprovalHistoryEntry[] = approvalHistory ?? [];

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Approval Status</h3>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusInfo.label}
        </span>
      </div>

      {/* Reviewer info */}
      {reviewedBy && reviewedAt && (
        <div className="px-5 py-3 text-xs text-slate-500 border-b border-border/50">
          Reviewed by <strong className="text-foreground/80">{reviewedBy}</strong> on{' '}
          {new Date(reviewedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          {reviewNote && <div className="mt-1 text-foreground/70 italic">&ldquo;{reviewNote}&rdquo;</div>}
        </div>
      )}

      {/* Action area — only for admins */}
      {canApprove && approvalStatus !== 'APPROVED' && approvalStatus !== 'REJECTED' && (
        <div className="px-5 py-4 space-y-3 border-b border-border/50">
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add a review note (optional)..."
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => takeAction(approveApiPath)}
              disabled={working}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={() => takeAction(returnApiPath)}
              disabled={working}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Return for Revision
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <button
            onClick={() => setShowHistory(v => !v)}
            className="w-full px-5 py-3 flex items-center justify-between text-xs text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <span className="font-medium">Approval History ({history.length})</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showHistory && (
            <div className="px-5 pb-4 space-y-2">
              {history.map((entry, i) => (
                <div key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  <div>
                    <span className="font-semibold capitalize">{entry.action.replace(/_/g, ' ').toLowerCase()}</span>
                    {entry.actorName && <> by {entry.actorName}</>}
                    {' \u00b7 '}
                    {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {entry.note && <div className="text-slate-500 italic mt-0.5">&ldquo;{entry.note}&rdquo;</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
