'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'PATIENT_GRIEVANCE_ACKNOWLEDGMENT', 'PATIENT_GRIEVANCE_RESOLUTION',
  'SENTINEL_EVENT_FAMILY_NOTICE',     'PLAN_OF_CORRECTION',
  'CAP_COMPLETION_NOTICE',            'INCIDENT_FAMILY_NOTIFICATION',
  'STATE_ADVERSE_EVENT_REPORT',       'JC_SENTINEL_EVENT_REPORT',
  'SURVEY_RESPONSE_COVER',            'REGULATORY_INQUIRY_RESPONSE',
  'COMPLAINT_ACKNOWLEDGMENT',         'PATIENT_RIGHTS_VIOLATION_RESPONSE',
  'EMPLOYEE_SAFETY_INCIDENT',         'OTHER',
];

export default function EditResponsePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    fetch(`/api/responses/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setSubject(d.subject ?? '');
        setBody(d.body ?? '');
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.currentTarget;

    const payload = {
      title:            (f.elements.namedItem('title') as HTMLInputElement).value,
      category:         (f.elements.namedItem('category') as HTMLSelectElement).value,
      recipientName:    (f.elements.namedItem('recipientName') as HTMLInputElement).value,
      recipientRole:    (f.elements.namedItem('recipientRole') as HTMLInputElement).value,
      recipientAddress: (f.elements.namedItem('recipientAddress') as HTMLInputElement).value,
      subject,
      body,
      sourceType:       (f.elements.namedItem('sourceType') as HTMLSelectElement).value || null,
      sourceRef:        (f.elements.namedItem('sourceRef') as HTMLInputElement).value || null,
      dueDate:          (f.elements.namedItem('dueDate') as HTMLInputElement).value || null,
      draftedBy:        (f.elements.namedItem('draftedBy') as HTMLInputElement).value || null,
      notes:            (f.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch(`/api/responses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/quality/responses/${id}`);
      router.refresh();
    } else {
      const b = await res.json();
      setError(b.error ?? 'Failed to save response.');
      setSaving(false);
    }
  }

  if (loading) return <div className="text-muted-foreground/70 p-8">LoadingΓÇª</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Not found.'}</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <a href={`/quality/responses/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-500 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Response
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-teal-600" />
          Edit Response
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="space-y-5">
        {/* Response metadata */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Response Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Title *</label>
              <input
                name="title"
                required
                defaultValue={data.title ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Category *</label>
              <select
                name="category"
                required
                defaultValue={data.category ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Due Date</label>
              <input
                name="dueDate"
                type="date"
                defaultValue={data.dueDate?.split('T')[0] ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Source Type</label>
              <select
                name="sourceType"
                defaultValue={data.sourceType ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">-</option>
                <option value="INCIDENT">Incident</option>
                <option value="GRIEVANCE">Grievance</option>
                <option value="SURVEY">Survey</option>
                <option value="CAP">Corrective Action Plan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Source Reference #</label>
              <input
                name="sourceRef"
                defaultValue={data.sourceRef ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Recipient Name</label>
              <input
                name="recipientName"
                defaultValue={data.recipientName ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Recipient Role / Agency</label>
              <input
                name="recipientRole"
                defaultValue={data.recipientRole ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Recipient Address</label>
              <input
                name="recipientAddress"
                defaultValue={data.recipientAddress ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Drafted By</label>
              <input
                name="draftedBy"
                defaultValue={data.draftedBy ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Subject + Body */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Letter Content *</h2>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject line"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Letter Body *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              rows={20}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y h-80"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-6">
          <label className="block text-sm font-medium text-foreground/80 mb-1">Internal Notes</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={data.notes ?? ''}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'SavingΓÇª' : 'Save Changes'}
          </button>
          <a
            href={`/quality/responses/${id}`}
            className="py-2.5 px-5 rounded-xl border border-border text-sm font-medium text-foreground/80 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
