'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';

const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SOURCES = ['INCIDENT', 'SURVEY_FINDING', 'AUDIT', 'SELF_IDENTIFIED', 'REGULATORY_CITATION', 'OTHER'];

export default function NewCapPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      title:       (form.elements.namedItem('title') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      source:      (form.elements.namedItem('source') as HTMLSelectElement).value,
      priority:    (form.elements.namedItem('priority') as HTMLSelectElement).value,
      assignedTo:  (form.elements.namedItem('assignedTo') as HTMLInputElement).value,
      dueDate:     (form.elements.namedItem('dueDate') as HTMLInputElement).value,
      targetMeasure: (form.elements.namedItem('targetMeasure') as HTMLTextAreaElement).value,
    };

    const res = await fetch('/api/caps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/trackers/caps');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to create CAP.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/trackers/caps" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CAPs
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          New Corrective Action Plan
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CAP Title *</label>
            <input name="title" required className="form-input w-full" placeholder="Brief description of the corrective action" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Source *</label>
              <select name="source" required className="form-input w-full">
                <option value="">Select source…</option>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority *</label>
              <select name="priority" required className="form-input w-full">
                <option value="">Select priority…</option>
                {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Problem Description *</label>
            <textarea name="description" required rows={4} className="form-input w-full"
              placeholder="What issue or gap is being addressed? What is the root cause?" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Target / Success Measure</label>
            <textarea name="targetMeasure" rows={2} className="form-input w-full"
              placeholder="How will you know the corrective action was effective? What metric will be monitored?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assigned To</label>
              <input name="assignedTo" className="form-input w-full" placeholder="Name or department" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
              <input name="dueDate" type="date" className="form-input w-full" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/caps" className="text-sm text-slate-500 hover:text-slate-700">Cancel</a>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Create CAP'}
          </button>
        </div>
      </form>
    </div>
  );
}
