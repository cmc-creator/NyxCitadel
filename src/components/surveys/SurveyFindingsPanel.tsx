'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

interface Cap {
  id: string;
  capNumber: string;
  status: string;
}

interface Finding {
  id: string;
  tagNumber: string | null;
  condition: string | null;
  description: string;
  severity: string | null;
  status: string;
  targetDate: string | null;
  capId: string | null;
  cap: Cap | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  CAP_IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  VERIFIED: 'bg-teal-100 text-teal-700',
  CLOSED: 'bg-slate-100 text-slate-500',
};

const STATUS_OPTIONS = Object.keys(STATUS_COLORS);

interface Props {
  surveyId: string;
}

export function SurveyFindingsPanel({ surveyId }: Props) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    tagNumber: '',
    condition: '',
    description: '',
    severity: '',
    targetDate: '',
    notes: '',
  });

  useEffect(() => {
    fetch(`/api/surveys/${surveyId}/findings`)
      .then((r) => r.json())
      .then((data) => {
        setFindings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [surveyId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/findings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagNumber: form.tagNumber || null,
          condition: form.condition || null,
          description: form.description,
          severity: form.severity || null,
          targetDate: form.targetDate || null,
          notes: form.notes || null,
        }),
      });
      if (res.ok) {
        const newFinding = await res.json();
        setFindings((prev) => [...prev, newFinding]);
        setForm({ tagNumber: '', condition: '', description: '', severity: '', targetDate: '', notes: '' });
        setShowForm(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(findingId: string, status: string) {
    const res = await fetch(`/api/surveys/${surveyId}/findings/${findingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFindings((prev) => prev.map((f) => (f.id === findingId ? updated : f)));
    }
  }

  async function deleteFinding(findingId: string) {
    const res = await fetch(`/api/surveys/${surveyId}/findings/${findingId}`, { method: 'DELETE' });
    if (res.ok) {
      setFindings((prev) => prev.filter((f) => f.id !== findingId));
    }
  }

  const openCount = findings.filter((f) => f.status === 'OPEN' || f.status === 'CAP_IN_PROGRESS').length;

  return (
    <div className="bg-card rounded-xl border border-border">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Survey Findings
          </h2>
          {findings.length > 0 && (
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {findings.length} total &middot; {openCount} open
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'Add Finding'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="px-5 py-4 border-b border-border/30 space-y-3 bg-muted/10">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground/70 block mb-1">Tag / Deficiency #</span>
              <input
                value={form.tagNumber}
                onChange={(e) => setForm((p) => ({ ...p, tagNumber: e.target.value }))}
                placeholder="e.g. A-0115"
                className="form-input w-full text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground/70 block mb-1">Condition</span>
              <input
                value={form.condition}
                onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                placeholder="e.g. 42 CFR 482.13"
                className="form-input w-full text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-muted-foreground/70 block mb-1">Description *</span>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe the deficiency or finding..."
              rows={3}
              className="form-input w-full text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground/70 block mb-1">Severity</span>
              <input
                value={form.severity}
                onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}
                placeholder="e.g. Immediate Jeopardy"
                className="form-input w-full text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground/70 block mb-1">Target Correction Date</span>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
                className="form-input w-full text-sm"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Finding'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="px-5 py-6 text-sm text-muted-foreground/50">Loading findings...</div>
      ) : findings.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground/60">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          No findings logged for this survey.
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {findings.map((finding) => (
            <div key={finding.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {finding.tagNumber && (
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {finding.tagNumber}
                      </span>
                    )}
                    {finding.condition && (
                      <span className="text-xs text-muted-foreground/70">{finding.condition}</span>
                    )}
                    {finding.severity && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                        {finding.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/90">{finding.description}</p>
                  {finding.cap && (
                    <Link
                      href={`/trackers/caps/${finding.cap.id}`}
                      className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline mt-1"
                    >
                      CAP: {finding.cap.capNumber}
                    </Link>
                  )}
                  {finding.targetDate && (
                    <p className="text-xs text-muted-foreground/60 mt-0.5">
                      Target: {new Date(finding.targetDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={finding.status}
                    onChange={(e) => updateStatus(finding.id, e.target.value)}
                    className={`text-xs font-medium px-2 py-0.5 rounded cursor-pointer border-0 outline-none ${STATUS_COLORS[finding.status] ?? 'bg-muted/30 text-muted-foreground'}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteFinding(finding.id)}
                    className="p-1 text-muted-foreground/40 hover:text-red-500 transition-colors"
                    title="Delete finding"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
