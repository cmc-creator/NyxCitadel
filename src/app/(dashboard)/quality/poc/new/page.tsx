'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface Finding {
  id: string;
  findingNumber: string;
  findingDescription: string;
  howCorrected: string;
  howPrevented: string;
  howMonitored: string;
  responsibleParty: string;
  targetDate: string;
}

const REGULATORY_BODIES = [
  { value: 'CMS',   label: 'CMS (Medicare / Medicaid)' },
  { value: 'JC',    label: 'Joint Commission (JC)' },
  { value: 'ADHS',  label: 'AZ ADHS (State Licensure)' },
  { value: 'OSHA',  label: 'OSHA' },
  { value: 'OTHER', label: 'Other' },
];

export default function NewPocPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [findings, setFindings] = useState<Finding[]>([{
    id: crypto.randomUUID(),
    findingNumber: '', findingDescription: '',
    howCorrected: '', howPrevented: '', howMonitored: '',
    responsibleParty: '', targetDate: '',
  }]);

  function addFinding() {
    setFindings(prev => [...prev, {
      id: crypto.randomUUID(),
      findingNumber: '', findingDescription: '',
      howCorrected: '', howPrevented: '', howMonitored: '',
      responsibleParty: '', targetDate: '',
    }]);
  }

  function removeFinding(id: string) {
    setFindings(prev => prev.filter(f => f.id !== id));
  }

  function updateFinding(id: string, field: keyof Finding, value: string) {
    setFindings(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const f = e.currentTarget;

    const data = {
      title:            (f.elements.namedItem('title') as HTMLInputElement).value,
      regulatoryBody:   (f.elements.namedItem('regulatoryBody') as HTMLSelectElement).value,
      surveyDate:       (f.elements.namedItem('surveyDate') as HTMLInputElement).value || null,
      responseDeadline: (f.elements.namedItem('responseDeadline') as HTMLInputElement).value || null,
      coverLetter:      (f.elements.namedItem('coverLetter') as HTMLTextAreaElement).value || null,
      submittedBy:      (f.elements.namedItem('submittedBy') as HTMLInputElement).value || null,
      notes:            (f.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
      findings: findings.map(({ id: _id, ...rest }) => rest),
    };

    const res = await fetch('/api/poc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/quality/poc');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save plan of correction.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <a href="/quality/poc" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to POCs
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-blue-600" />
          New Plan of Correction
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Document how each survey deficiency was corrected, prevented from recurrence, and how compliance will be monitored.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* POC Overview */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">POC Overview</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground/80 mb-1">Title *</label>
              <input
                name="title"
                required
                placeholder="e.g., CMS Triennial Survey - November 2025 POC"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Regulatory Body *</label>
              <select
                name="regulatoryBody"
                required
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select...</option>
                {REGULATORY_BODIES.map(b => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Survey Date</label>
              <input
                name="surveyDate"
                type="date"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Response Deadline</label>
              <input
                name="responseDeadline"
                type="date"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-1">Prepared By</label>
              <input
                name="submittedBy"
                placeholder="Name / title"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Cover Letter</label>
            <textarea
              name="coverLetter"
              rows={4}
              placeholder="Optional cover letter to the regulatory body..."
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Findings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground/80 text-sm uppercase tracking-wide">
              Deficiency Findings ({findings.length})
            </h2>
            <button
              type="button"
              onClick={addFinding}
              className="inline-flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Add Finding
            </button>
          </div>

          {findings.map((finding, idx) => (
            <div key={finding.id} className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground/80 text-sm">Finding #{idx + 1}</h3>
                {findings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFinding(finding.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tag / Citation #</label>
                  <input
                    value={finding.findingNumber}
                    onChange={e => updateFinding(finding.id, 'findingNumber', e.target.value)}
                    placeholder="e.g., A-0144, RI.01.07.01 EP2"
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Responsible Party</label>
                  <input
                    value={finding.responsibleParty}
                    onChange={e => updateFinding(finding.id, 'responsibleParty', e.target.value)}
                    placeholder="Name / title"
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Deficiency Description</label>
                <textarea
                  value={finding.findingDescription}
                  onChange={e => updateFinding(finding.id, 'findingDescription', e.target.value)}
                  rows={2}
                  placeholder="What was the finding / deficiency cited?"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">How Corrected</label>
                <textarea
                  value={finding.howCorrected}
                  onChange={e => updateFinding(finding.id, 'howCorrected', e.target.value)}
                  rows={2}
                  placeholder="What specific corrective action was taken?"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">How Recurrence is Prevented</label>
                <textarea
                  value={finding.howPrevented}
                  onChange={e => updateFinding(finding.id, 'howPrevented', e.target.value)}
                  rows={2}
                  placeholder="What systemic changes / policy updates were made?"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Monitoring Strategy</label>
                  <textarea
                    value={finding.howMonitored}
                    onChange={e => updateFinding(finding.id, 'howMonitored', e.target.value)}
                    rows={2}
                    placeholder="How will compliance be monitored / audited?"
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={finding.targetDate}
                    onChange={e => updateFinding(finding.id, 'targetDate', e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-6">
          <label className="block text-sm font-medium text-foreground/80 mb-1">Internal Notes</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Any additional notes..."
            className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Saving...' : 'Save Plan of Correction'}
          </button>
          <a
            href="/quality/poc"
            className="py-2.5 px-5 rounded-xl border border-border text-sm font-medium text-foreground/80 hover:bg-accent/50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
