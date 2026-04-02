'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { value: 'PATIENT_SAFETY', label: 'Patient Safety' },
  { value: 'RESTRAINT_SECLUSION', label: 'Restraint & Seclusion' },
  { value: 'MEDICATION_SAFETY', label: 'Medication Safety' },
  { value: 'CLINICAL_CARE', label: 'Clinical Care Quality' },
  { value: 'INFECTION_PREVENTION', label: 'Infection Prevention' },
  { value: 'PATIENT_EXPERIENCE', label: 'Patient Experience' },
  { value: 'STAFF_SAFETY', label: 'Staff Safety' },
  { value: 'READMISSIONS', label: 'Readmissions' },
  { value: 'COMPLIANCE', label: 'Regulatory Compliance' },
  { value: 'WORKFORCE', label: 'Workforce / HR' },
  { value: 'THROUGHPUT', label: 'Throughput / Efficiency' },
  { value: 'OTHER', label: 'Other' },
];

const METRIC_KEYS = [
  'restraint_rate', 'seclusion_rate', 'fall_rate', 'fall_with_injury_rate',
  'medication_error_rate', 'elopement_count', 'hai_rate', 'patient_satisfaction',
  '30day_readmission_rate', 'avg_los', 'staff_turnover', 'census_utilization',
];

export default function NewQapiProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;

    const data = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLSelectElement).value,
      problemStatement: (form.elements.namedItem('problemStatement') as HTMLTextAreaElement).value,
      aim: (form.elements.namedItem('aim') as HTMLTextAreaElement).value,
      measure: (form.elements.namedItem('measure') as HTMLInputElement).value || undefined,
      baselineValue: (form.elements.namedItem('baselineValue') as HTMLInputElement).value
        ? parseFloat((form.elements.namedItem('baselineValue') as HTMLInputElement).value) : undefined,
      targetValue: (form.elements.namedItem('targetValue') as HTMLInputElement).value
        ? parseFloat((form.elements.namedItem('targetValue') as HTMLInputElement).value) : undefined,
      targetUnit: (form.elements.namedItem('targetUnit') as HTMLInputElement).value || undefined,
      interventions: (form.elements.namedItem('interventions') as HTMLTextAreaElement).value || undefined,
      owner: (form.elements.namedItem('owner') as HTMLInputElement).value || undefined,
      team: (form.elements.namedItem('team') as HTMLInputElement).value || undefined,
      startDate: (form.elements.namedItem('startDate') as HTMLInputElement).value,
      targetDate: (form.elements.namedItem('targetDate') as HTMLInputElement).value,
      regulatoryBody: (form.elements.namedItem('regulatoryBody') as HTMLSelectElement).value || undefined,
      standardRef: (form.elements.namedItem('standardRef') as HTMLInputElement).value || undefined,
      relatedMetricKey: (form.elements.namedItem('relatedMetricKey') as HTMLSelectElement).value || undefined,
    };

    const res = await fetch('/api/qapi/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/quality/projects');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save QAPI project.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/quality/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to QAPI Projects
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Target className="w-6 h-6 text-teal-600" />
          New QAPI Project
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          CMS requires ≥2 active Performance Improvement Projects (PIPs) at all times. Document problem, aim, measure, intervention, and outcomes using PDSA methodology.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        {/* Core info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Project Overview</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Project Title *</label>
            <input name="title" required placeholder="e.g., Reduce Restraint Use by 20% by Q4 2026" className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required className="form-input w-full">
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Related QAPI Metric</label>
              <select name="relatedMetricKey" className="form-input w-full">
                <option value="">None</option>
                {METRIC_KEYS.map(k => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Owner / Champion *</label>
              <input name="owner" required placeholder="Name or department" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Team Members</label>
              <input name="team" placeholder="e.g., Nursing, Pharmacy, QI" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Date *</label>
              <input name="startDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Completion Date *</label>
              <input name="targetDate" type="date" required className="form-input w-full" />
            </div>
          </div>
        </div>

        {/* PDSA content */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Problem Statement & Aim (PDSA - Plan)</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Problem Statement *</label>
            <textarea name="problemStatement" required rows={3} placeholder="Describe the problem using data. e.g., 'Restraint use rate has averaged 8.2 per 1,000 pt-days in Q1 2026, exceeding the facility target of 5.0 and national benchmark.'" className="form-input w-full resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Aim Statement * - SMART goal</label>
            <textarea name="aim" required rows={2} placeholder="e.g., 'Reduce the restraint use rate from 8.2 to ≤5.0 per 1,000 pt-days by December 31, 2026 through enhanced de-escalation training and environmental modifications.'" className="form-input w-full resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Baseline Value</label>
              <input name="baselineValue" type="number" step="0.01" placeholder="e.g., 8.2" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Value</label>
              <input name="targetValue" type="number" step="0.01" placeholder="e.g., 5.0" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
              <input name="targetUnit" placeholder="per 1k pt-days, %, days" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Measure - How will success be measured?</label>
            <input name="measure" placeholder="e.g., Monthly restraint rate per 1,000 patient-days from incident reporting system" className="form-input w-full" />
          </div>
        </div>

        {/* Interventions */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Planned Interventions (PDSA - Do)</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Interventions</label>
            <textarea name="interventions" rows={4} placeholder="List specific interventions to be tested. e.g.:&#10;1. Implement CPI refresher training for all direct care staff by March 2026&#10;2. Establish sensory room on Unit A by April 2026&#10;3. Daily restraint review huddle with charge nurses&#10;4. Root cause analysis for each restraint event" className="form-input w-full resize-none" />
          </div>
        </div>

        {/* Regulatory */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Regulatory Linkage</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body</label>
              <select name="regulatoryBody" className="form-input w-full">
                <option value="">Select…</option>
                <option value="JOINT_COMMISSION">Joint Commission</option>
                <option value="CMS">CMS</option>
                <option value="AZ_ADHS">AZ ADHS</option>
                <option value="OSHA">OSHA</option>
                <option value="INTERNAL">Internal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Standard Reference</label>
              <input name="standardRef" placeholder="e.g., 42 CFR 482.21, PC.03.05.01" className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/quality/projects" className="px-4 py-2 text-sm text-slate-600 hover:text-foreground">Cancel</a>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Create QAPI Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
