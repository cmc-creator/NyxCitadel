'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  { value: 'PATIENT_RIGHTS_VIOLATION_RESPONSE','label': 'Patient Rights Violation Response' },
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

export default function NewResponseTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [variables, setVariables] = useState<string[]>(['{{FACILITY_NAME}}', '{{PATIENT_NAME}}']);
  const [newVar, setNewVar] = useState('');

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

    const data = {
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

    const res = await fetch('/api/response-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/quality/response-templates');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save template.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <a href="/quality/response-templates" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Templates
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          New Response Template
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Create a reusable template with variable placeholders like <code className="text-purple-600 bg-purple-50 px-1 rounded">{'{{PATIENT_NAME}}'}</code>.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Template Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Template Name *</label>
              <input
                name="name"
                required
                placeholder="e.g., Patient Grievance Acknowledgment Letter"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select
                name="category"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Regulatory Reference</label>
              <input
                name="regulatoryRef"
                placeholder="e.g., 42 CFR 482.13(e)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                name="description"
                placeholder="Brief description of when to use this template"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Response Deadline (days)</label>
              <input
                name="daysRequired"
                type="number"
                min="1"
                placeholder="e.g., 7, 30"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Default Subject Line</label>
            <input
              name="subject"
              placeholder="e.g., Acknowledgment of Your Grievance {{GRIEVANCE_NUMBER}}"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Variables */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Template Variables</h2>
          <p className="text-xs text-slate-500">Variables are replaced when generating a response. Click to add common variables.</p>

          {/* Common variables quick-add */}
          <div className="flex flex-wrap gap-1.5">
            {COMMON_VARIABLES.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => addVariable(v)}
                disabled={variables.includes(v)}
                className="text-xs bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-600 hover:text-purple-700 px-2 py-1 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {v}
              </button>
            ))}
          </div>

          {/* Current variables */}
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

          {/* Custom variable */}
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
              className="inline-flex items-center gap-1 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Body Template */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Letter Body Template *</h2>
          <p className="text-xs text-slate-500">
            Use the variable placeholders defined above. They will be substituted when generating a response.
          </p>
          <textarea
            name="bodyTemplate"
            required
            rows={16}
            placeholder={`Dear {{PATIENT_NAME}} / {{COMPLAINANT_NAME}},\n\nWe are writing to acknowledge receipt of your grievance received on {{DATE_RECEIVED}}...\n\nYour grievance has been assigned number {{GRIEVANCE_NUMBER}} and has been assigned to {{ASSIGNED_TO}} for investigation.\n\nWe will provide you with our written resolution within 30 days...\n\nSincerely,\n{{FACILITY_NAME}}\nPatient Rights Officer`}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 h-64 resize-y"
          />
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Usage Instructions</h2>
          <textarea
            name="instructions"
            rows={3}
            placeholder="Internal notes - when to use this template, who should review, etc."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
          <a
            href="/quality/response-templates"
            className="py-2.5 px-5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
