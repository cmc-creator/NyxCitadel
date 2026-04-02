'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'PATIENT_GRIEVANCE_ACKNOWLEDGMENT', label: 'Grievance Acknowledgment (7-day)' },
  { value: 'PATIENT_GRIEVANCE_RESOLUTION',     label: 'Grievance Resolution (30-day)' },
  { value: 'SENTINEL_EVENT_FAMILY_NOTICE',     label: 'Sentinel Event Family Notice' },
  { value: 'PLAN_OF_CORRECTION',               label: 'Plan of Correction' },
  { value: 'CAP_COMPLETION_NOTICE',            label: 'CAP Completion Notice' },
  { value: 'INCIDENT_FAMILY_NOTIFICATION',     label: 'Incident Family Notification' },
  { value: 'STATE_ADVERSE_EVENT_REPORT',       label: 'AZ ADHS Adverse Event Report' },
  { value: 'JC_SENTINEL_EVENT_REPORT',         label: 'JC Sentinel Event Report' },
  { value: 'SURVEY_RESPONSE_COVER',            label: 'Survey Response Cover Letter' },
  { value: 'REGULATORY_INQUIRY_RESPONSE',      label: 'Regulatory Inquiry Response' },
  { value: 'COMPLAINT_ACKNOWLEDGMENT',         label: 'Complaint Acknowledgment' },
  { value: 'PATIENT_RIGHTS_VIOLATION_RESPONSE', label: 'Patient Rights Violation Response' },
  { value: 'EMPLOYEE_SAFETY_INCIDENT',         label: 'Employee Safety Incident' },
  { value: 'OTHER',                            label: 'Other' },
];

const COMMON_VARIABLES = [
  '{{FACILITY_NAME}}', '{{PATIENT_NAME}}', '{{DATE_RECEIVED}}',
  '{{INCIDENT_DATE}}', '{{GRIEVANCE_NUMBER}}', '{{INCIDENT_NUMBER}}',
  '{{ASSIGNED_TO}}', '{{RESOLUTION_SUMMARY}}', '{{ACTIONS_TAKEN}}',
  '{{REGULATORY_BODY}}', '{{SURVEY_DATE}}', '{{DEFICIENCY_TAG}}',
  '{{COMPLAINANT_NAME}}', '{{DUE_DATE}}', '{{STAFF_NAME}}',
];

export default function EditResponseTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [newVar, setNewVar] = useState('');

  useEffect(() => {
    fetch(`/api/response-templates/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setVariables(d.variables ?? []);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  function addVariable(v: string) {
    const clean = v.trim().toUpperCase().replace(/[^A-Z0-9_{}]/g, '');
    const formatted = clean.startsWith('{{') ? clean : `{{${clean}}}`;
    if (formatted !== '{{}}' && !variables.includes(formatted)) {
      setVariables([...variables, formatted]);
    }
    setNewVar('');
  }

  function removeVariable(v: string) {
    setVariables(variables.filter(x => x !== v));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;

    const payload = {
      name:          (form.elements.namedItem('name') as HTMLInputElement).value,
      category:      (form.elements.namedItem('category') as HTMLSelectElement).value,
      description:   (form.elements.namedItem('description') as HTMLInputElement).value,
      subject:       (form.elements.namedItem('subject') as HTMLInputElement).value,
      bodyTemplate:  (form.elements.namedItem('bodyTemplate') as HTMLTextAreaElement).value,
      regulatoryRef: (form.elements.namedItem('regulatoryRef') as HTMLInputElement).value,
      daysRequired:  (form.elements.namedItem('daysRequired') as HTMLInputElement).value || null,
      instructions:  (form.elements.namedItem('instructions') as HTMLTextAreaElement).value,
      variables,
    };

    const res = await fetch(`/api/response-templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/quality/response-templates/${id}`);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save template.');
      setSaving(false);
    }
  }

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Not found.'}</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <a href={`/quality/response-templates/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Template
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Edit Response Template
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Template Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Template Name *</label>
              <input
                name="name"
                required
                defaultValue={data.name ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Category *</label>
              <select
                name="category"
                required
                defaultValue={data.category ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Regulatory Reference</label>
              <input
                name="regulatoryRef"
                defaultValue={data.regulatoryRef ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Description</label>
              <input
                name="description"
                defaultValue={data.description ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Response Deadline (days)</label>
              <input
                name="daysRequired"
                type="number"
                min="1"
                defaultValue={data.daysRequired ?? ''}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Default Subject Line</label>
            <input
              name="subject"
              defaultValue={data.subject ?? ''}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Variables */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Template Variables</h2>
          <p className="text-xs text-slate-500">Variables are replaced when generating a response. Click to add common variables.</p>

          <div className="flex flex-wrap gap-1.5">
            {COMMON_VARIABLES.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => addVariable(v)}
                disabled={variables.includes(v)}
                className="text-xs bg-slate-50 hover:bg-purple-50 border border-border hover:border-purple-300 text-slate-600 hover:text-purple-700 px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {variables.map(v => (
              <span key={v} className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-1 rounded-full">
                {v}
                <button type="button" onClick={() => removeVariable(v)} className="hover:text-red-500 ml-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newVar}
              onChange={e => setNewVar(e.target.value)}
              placeholder="Custom variable name..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariable(newVar); } }}
            />
            <button
              type="button"
              onClick={() => addVariable(newVar)}
              className="inline-flex items-center gap-1 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-foreground/80 px-3 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Body Template */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Letter Body Template *</h2>
          <textarea
            name="bodyTemplate"
            required
            rows={16}
            defaultValue={data.bodyTemplate ?? ''}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 h-64 resize-y"
          />
        </div>

        {/* Instructions */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Usage Instructions</h2>
          <textarea
            name="instructions"
            rows={3}
            defaultValue={data.instructions ?? ''}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <a
            href={`/quality/response-templates/${id}`}
            className="py-2.5 px-5 rounded-xl border border-border text-sm font-medium text-foreground/80 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
