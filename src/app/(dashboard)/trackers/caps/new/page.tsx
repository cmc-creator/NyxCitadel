'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';

const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SOURCES = ['INCIDENT', 'SURVEY_FINDING', 'AUDIT', 'SELF_IDENTIFIED', 'REGULATORY_CITATION', 'OTHER'];

export default function NewCapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRca    = searchParams.get('fromRca')    ?? '';
  const prefillTitle = searchParams.get('title')  ?? '';
  const prefillSource = searchParams.get('source') ?? '';
  const prefillDesc  = searchParams.get('desc')   ?? '';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      title:            (form.elements.namedItem('title') as HTMLInputElement).value,
      description:      (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      source:           (form.elements.namedItem('source') as HTMLSelectElement).value,
      priority:         (form.elements.namedItem('priority') as HTMLSelectElement).value,
      targetDate:       (form.elements.namedItem('targetDate') as HTMLInputElement).value,
      measureOfSuccess: (form.elements.namedItem('measureOfSuccess') as HTMLTextAreaElement).value,
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
        <a href="/trackers/caps" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CAPs
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          New Corrective Action Plan
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {fromRca && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm text-emerald-700">
          <ClipboardCheck className="w-4 h-4 shrink-0" />
          Pre-filled from Root Cause Analysis. Review all fields and set a target date.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CAP Title *</label>
            <input name="title" required defaultValue={prefillTitle} className="form-input w-full" placeholder="Brief description of the corrective action" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Source *</label>
              <select name="source" required defaultValue={prefillSource} className="form-input w-full">
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
            <textarea name="description" required rows={4} defaultValue={prefillDesc} className="form-input w-full"
              placeholder="What issue or gap is being addressed? What is the root cause?" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Measure of Success</label>
            <textarea name="measureOfSuccess" rows={2} className="form-input w-full"
              placeholder="How will you know the corrective action was effective? What metric will be monitored?" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Target Date *</label>
            <input name="targetDate" type="date" required className="form-input w-full max-w-xs" />
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/caps" className="text-sm text-slate-500 hover:text-slate-700">Cancel</a>
          <button type="submit" disabled={saving}
            className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Create CAP'}
          </button>
        </div>
      </form>
    </div>
  );
}
