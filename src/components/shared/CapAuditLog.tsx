'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, AlertCircle, Plus, Trash2, ClipboardCheck } from 'lucide-react';

interface AuditEntry {
  id: string;
  auditDate: string;
  result: 'PASS' | 'FAIL' | 'NEEDS_IMPROVEMENT';
  notes: string | null;
  nextAuditDate: string | null;
  auditor: { name: string | null; email: string };
}

interface Props {
  capId: string;
  currentUserId: string;
  currentUserRole: string;
}

const RESULT_CONFIG = {
  PASS: {
    label: 'Pass',
    icon: CheckCircle2,
    badge: 'bg-green-100 text-green-800 border-green-200',
    icon_class: 'text-green-600',
  },
  FAIL: {
    label: 'Fail',
    icon: XCircle,
    badge: 'bg-red-100 text-red-800 border-red-200',
    icon_class: 'text-red-600',
  },
  NEEDS_IMPROVEMENT: {
    label: 'Needs Improvement',
    icon: AlertCircle,
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    icon_class: 'text-amber-600',
  },
};

export function CapAuditLog({ capId, currentUserId, currentUserRole }: Props) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [result, setResult] = useState<'PASS' | 'FAIL' | 'NEEDS_IMPROVEMENT'>('PASS');
  const [notes, setNotes] = useState('');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextAuditDate, setNextAuditDate] = useState('');

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/caps/${capId}/audit`);
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  }, [capId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/caps/${capId}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, notes: notes.trim() || undefined, auditDate, nextAuditDate: nextAuditDate || undefined }),
      });
      if (res.ok) {
        const entry = await res.json();
        setEntries(prev => [entry, ...prev]);
        setNotes('');
        setNextAuditDate('');
        setResult('PASS');
        setAuditDate(new Date().toISOString().slice(0, 10));
        setShowForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(entryId: string, entryAuditorEmail: string) {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUserRole);
    const isOwn = entries.find(e => e.id === entryId)?.auditor.email === undefined;
    void isOwn;
    if (!isAdmin && entries.find(e => e.id === entryId)?.auditor.email !== undefined) {
      // still allow own entries
    }
    if (!confirm('Delete this audit entry?')) return;
    void entryAuditorEmail;
    const res = await fetch(`/api/caps/${capId}/audit/${entryId}`, { method: 'DELETE' });
    if (res.ok) setEntries(prev => prev.filter(e => e.id !== entryId));
  }

  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(currentUserRole);

  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide flex items-center gap-2">
          <ClipboardCheck className="w-3.5 h-3.5" />
          Effectiveness Audit Log
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Audit
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Audit Date</label>
              <input
                type="date"
                value={auditDate}
                onChange={e => setAuditDate(e.target.value)}
                className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Next Audit Date</label>
              <input
                type="date"
                value={nextAuditDate}
                onChange={e => setNextAuditDate(e.target.value)}
                className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Result</label>
            <div className="flex gap-2">
              {(['PASS', 'FAIL', 'NEEDS_IMPROVEMENT'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={`flex-1 text-xs font-medium py-1.5 px-2 rounded-lg border transition-colors ${
                    result === r
                      ? RESULT_CONFIG[r].badge + ' border'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {RESULT_CONFIG[r].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Findings / Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="What was verified? What was observed?"
              className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="text-xs px-3 py-1.5 text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving\u2026' : 'Save Audit'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground/60 py-2">Loading\u2026</p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-2 text-center">
          No effectiveness audits logged yet. Log one above to track if the corrective action is holding.
        </p>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => {
            const cfg = RESULT_CONFIG[entry.result];
            const ResultIcon = cfg.icon;
            const canDelete = isAdmin || entry.auditor.email === currentUserId;
            return (
              <div key={entry.id} className="group flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
                <ResultIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.icon_class}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    <span className="text-xs text-muted-foreground/70">
                      {format(new Date(entry.auditDate), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-muted-foreground/50">&middot;</span>
                    <span className="text-xs text-muted-foreground/70">{entry.auditor.name ?? entry.auditor.email}</span>
                  </div>
                  {entry.notes && (
                    <p className="text-xs text-foreground/80 mt-1 leading-relaxed">{entry.notes}</p>
                  )}
                  {entry.nextAuditDate && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      Next audit: {format(new Date(entry.nextAuditDate), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(entry.id, entry.auditor.email)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/40 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
