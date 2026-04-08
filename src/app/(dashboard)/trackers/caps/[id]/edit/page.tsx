'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';

const PRIORITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SOURCES = ['INCIDENT', 'SURVEY_FINDING', 'AUDIT', 'SELF_IDENTIFIED', 'REGULATORY_CITATION', 'OTHER'];

export default function EditCapPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/caps/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;

    const payload = {
      title:            (form.elements.namedItem('title') as HTMLInputElement).value,
      description:      (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      source:           (form.elements.namedItem('source') as HTMLSelectElement).value,
      priority:         (form.elements.namedItem('priority') as HTMLSelectElement).value,
      targetDate:       (form.elements.namedItem('targetDate') as HTMLInputElement).value,
      measureOfSuccess: (form.elements.namedItem('measureOfSuccess') as HTMLTextAreaElement).value,
    };

    const res = await fetch(`/api/caps/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/trackers/caps/${id}`);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to update.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/trackers/caps/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-500 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          Edit Corrective Action Plan
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">CAP Title *</label>
            <input name="title" required defaultValue={data.title} className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Source *</label>
              <select name="source" required defaultValue={data.source} className="form-input w-full">
                <option value="">Select source…</option>
                {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority *</label>
              <select name="priority" required defaultValue={data.priority} className="form-input w-full">
                <option value="">Select priority…</option>
                {PRIORITY_LEVELS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Problem Description *</label>
            <textarea name="description" required rows={4} defaultValue={data.description ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Measure of Success</label>
            <textarea name="measureOfSuccess" rows={2} defaultValue={data.measureOfSuccess ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Target Date *</label>
            <input name="targetDate" type="date" required defaultValue={data.targetDate ? data.targetDate.split('T')[0] : ''} className="form-input w-full max-w-xs" />
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/trackers/caps/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
