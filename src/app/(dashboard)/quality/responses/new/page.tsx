'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, ArrowLeft, Wand2, RefreshCw } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string | null;
  bodyTemplate: string;
  variables: string[];
  daysRequired: number | null;
  regulatoryRef: string | null;
}

const CATEGORIES = [
  'PATIENT_GRIEVANCE_ACKNOWLEDGMENT', 'PATIENT_GRIEVANCE_RESOLUTION',
  'SENTINEL_EVENT_FAMILY_NOTICE',     'PLAN_OF_CORRECTION',
  'CAP_COMPLETION_NOTICE',            'INCIDENT_FAMILY_NOTIFICATION',
  'STATE_ADVERSE_EVENT_REPORT',       'JC_SENTINEL_EVENT_REPORT',
  'SURVEY_RESPONSE_COVER',            'REGULATORY_INQUIRY_RESPONSE',
  'COMPLAINT_ACKNOWLEDGMENT',         'PATIENT_RIGHTS_VIOLATION_RESPONSE',
  'EMPLOYEE_SAFETY_INCIDENT',         'OTHER',
];

export default function NewResponsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get('templateId');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/response-templates')
      .then(r => r.json())
      .then((data: Template[]) => {
        setTemplates(data);
        if (templateIdParam) {
          const t = data.find(x => x.id === templateIdParam);
          if (t) loadTemplate(t);
        }
      });
  }, [templateIdParam]);

  function loadTemplate(t: Template) {
    setSelectedTemplate(t);
    setSubject(t.subject ?? '');
    setBody(t.bodyTemplate);
    const initVars: Record<string, string> = {};
    t.variables.forEach(v => { initVars[v] = ''; });
    setVarValues(initVars);
  }

  function applyVariables() {
    if (!selectedTemplate) return;
    let filled = selectedTemplate.bodyTemplate;
    let subjectFilled = selectedTemplate.subject ?? '';
    Object.entries(varValues).forEach(([k, v]) => {
      const val = v || k;
      filled = filled.replaceAll(k, val);
      subjectFilled = subjectFilled.replaceAll(k, val);
    });
    setBody(filled);
    setSubject(subjectFilled);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.currentTarget;

    const data = {
      templateId:      selectedTemplate?.id ?? null,
      title:           (f.elements.namedItem('title') as HTMLInputElement).value,
      category:        (f.elements.namedItem('category') as HTMLSelectElement).value,
      recipientName:   (f.elements.namedItem('recipientName') as HTMLInputElement).value,
      recipientRole:   (f.elements.namedItem('recipientRole') as HTMLInputElement).value,
      recipientAddress:(f.elements.namedItem('recipientAddress') as HTMLInputElement).value,
      subject,
      body,
      sourceType:      (f.elements.namedItem('sourceType') as HTMLSelectElement).value || null,
      sourceRef:       (f.elements.namedItem('sourceRef') as HTMLInputElement).value || null,
      dueDate:         (f.elements.namedItem('dueDate') as HTMLInputElement).value || null,
      draftedBy:       (f.elements.namedItem('draftedBy') as HTMLInputElement).value || null,
      aiGenerated:     false,
      notes:           (f.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/quality/responses');
      router.refresh();
    } else {
      const b = await res.json();
      setError(b.error ?? 'Failed to save response.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <a href="/quality/responses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Responses
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-teal-600" />
          Generate Response
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Select a template or write a custom response from scratch.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Template picker */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Template (optional)</h2>
          <div className="grid grid-cols-2 gap-3">
            {templates.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => loadTemplate(t)}
                className={`text-left p-3 rounded-lg border-2 transition-colors text-sm ${
                  selectedTemplate?.id === t.id
                    ? 'border-teal-500 bg-teal-950/20'
                    : 'border-border hover:border-teal-300'
                }`}
              >
                <div className="font-medium text-foreground">{t.name}</div>
                {t.regulatoryRef && <div className="text-xs text-muted-foreground mt-0.5">{t.regulatoryRef}</div>}
                {t.daysRequired && (
                  <div className="text-xs text-amber-600 mt-0.5">⏱ {t.daysRequired}-day deadline</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Fill variables */}
        {selectedTemplate && Object.keys(varValues).length > 0 && (
          <div className="bg-teal-950/20 rounded-xl border border-teal-800/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-teal-800 text-sm uppercase tracking-wide">Fill Variables</h2>
              <button
                type="button"
                onClick={applyVariables}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg"
              >
                <RefreshCw className="w-3 h-3" /> Apply to Letter
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(varValues).map(v => (
                <div key={v}>
                  <label className="block text-xs font-medium text-teal-700 mb-1">{v}</label>
                  <input
                    value={varValues[v]}
                    onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                    placeholder={`Value for ${v}`}
                    className="w-full rounded-lg border border-teal-700/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-teal-950/30"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-teal-600">Fill values above and click "Apply to Letter" to substitute them in the body.</p>
          </div>
        )}

        {/* Response metadata */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">Response Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Title *</label>
              <input
                name="title"
                required
                defaultValue={selectedTemplate ? `Response: ${selectedTemplate.name}` : ''}
                placeholder="Internal title for this response"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Category *</label>
              <select
                name="category"
                required
                defaultValue={selectedTemplate?.category ?? ''}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Source Type</label>
              <select
                name="sourceType"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                placeholder="e.g., GR-2025-001"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Recipient Name</label>
              <input
                name="recipientName"
                placeholder="Full name"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Recipient Role / Agency</label>
              <input
                name="recipientRole"
                placeholder="e.g., Patient, AZ ADHS, The Joint Commission"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Recipient Address</label>
              <input
                name="recipientAddress"
                placeholder="Mailing address (optional)"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Drafted By</label>
              <input
                name="draftedBy"
                placeholder="Your name / role"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Letter Body *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              rows={20}
              placeholder="Type or paste your response here..."
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y h-80"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-6">
          <label className="block text-sm font-medium text-foreground/80 mb-1">Internal Notes</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Any internal notes about this response..."
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <a
            href="/quality/responses"
            className="py-2.5 px-5 rounded-xl border border-border text-sm font-medium text-foreground/80 hover:bg-accent/50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
