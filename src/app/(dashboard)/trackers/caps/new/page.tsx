'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';
import { AiFieldHelper } from '@/components/ai/AiFieldHelper';
import { SentryPageGuide } from '@/components/ai/SentryPageGuide';

const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SOURCES = ['INCIDENT', 'SURVEY_FINDING', 'AUDIT', 'SELF_IDENTIFIED', 'REGULATORY_CITATION', 'OTHER'];

export default function NewCapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRca       = searchParams.get('fromRca')    ?? '';
  const prefillTitle  = searchParams.get('title')      ?? '';
  const prefillSource = searchParams.get('source')     ?? '';
  const prefillDesc   = searchParams.get('desc')       ?? '';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState(prefillSource);
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState(prefillDesc);
  const [measureOfSuccess, setMeasureOfSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      title:            (form.elements.namedItem('title') as HTMLInputElement).value,
      description,
      source,
      priority,
      targetDate:       (form.elements.namedItem('targetDate') as HTMLInputElement).value,
      measureOfSuccess,
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
        <a href="/trackers/caps" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CAPs
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          New Corrective Action Plan
        </h1>
      </div>

      <SentryPageGuide
        pageKey="caps-new"
        title="Corrective Action Plan"
        body="A CAP is a structured commitment to fix an identified problem. Be specific: what is the root cause, exactly what will be done, who is responsible, and how will you know it worked? Use the sparkle button to get Sentry's help writing each section."
        tips={[
          "The Problem Description should explain both what happened and why -- the root cause, not just the symptom",
          "Measure of Success should be a specific, measurable outcome: 'Zero repeat incidents for 90 days' or '100% staff completion of training by date'",
          "Set a realistic target date -- regulators look for completion within 30-60 days for high-priority findings",
          "Link your CAP to an incident report or survey finding in the Source field for audit trail purposes",
        ]}
      />

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {fromRca && (
        <div className="flex items-center gap-2 bg-emerald-950/20 border border-emerald-200 rounded-lg px-4 py-2.5 text-sm text-emerald-700">
          <ClipboardCheck className="w-4 h-4 shrink-0" />
          Pre-filled from Root Cause Analysis. Review all fields and set a target date.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">CAP Title *</label>
            <input
              name="title"
              required
              defaultValue={prefillTitle}
              className="form-input w-full"
              placeholder="Brief description of the corrective action"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Source *</label>
              <select
                name="source"
                required
                value={source}
                onChange={e => setSource(e.target.value)}
                className="form-input w-full"
              >
                <option value="">Select source...</option>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Priority *</label>
              <select
                name="priority"
                required
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="form-input w-full"
              >
                <option value="">Select priority...</option>
                {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <AiFieldHelper
            fieldLabel="Problem Description"
            pageContext="New Corrective Action Plan"
            value={description}
            onChange={setDescription}
            rows={4}
            required
            name="description"
            placeholder="What issue or gap is being addressed? What is the root cause?"
            formHints={{
              source: source.replace(/_/g, ' '),
              priority,
            }}
          />
          <AiFieldHelper
            fieldLabel="Measure of Success"
            pageContext="New Corrective Action Plan"
            value={measureOfSuccess}
            onChange={setMeasureOfSuccess}
            rows={2}
            name="measureOfSuccess"
            placeholder="How will you know the corrective action was effective? What metric will be monitored?"
            formHints={{
              source: source.replace(/_/g, ' '),
              priority,
              problemDescription: description.slice(0, 200),
            }}
          />
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Target Date *</label>
            <input name="targetDate" type="date" required className="form-input w-full max-w-xs" />
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/caps" className="text-sm text-muted-foreground hover:text-foreground/80">Cancel</a>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Create CAP'}
          </button>
        </div>
      </form>
    </div>
  );
}
