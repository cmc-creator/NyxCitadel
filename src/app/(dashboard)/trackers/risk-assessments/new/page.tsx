'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const ASSESSMENT_TYPES = [
  { value: 'ANNUAL_PROACTIVE', label: 'Annual Proactive Risk Assessment', ref: 'JC LD.04.04.01', desc: 'Required annually - broad facility-wide risk identification' },
  { value: 'INFECTION_CONTROL', label: 'Infection Control Risk Assessment (ICRA)', ref: 'JC IC.01.01.01 EP4', desc: 'Annual assessment of infection risks for the patient population' },
  { value: 'SECURITY', label: 'Workplace Violence / Security Risk Assessment', ref: 'TJC CAMH / OSHA', desc: 'Physical security, workplace violence risk for staff and patients' },
  { value: 'IT_SECURITY', label: 'IT / HIPAA Security Risk Analysis', ref: '45 CFR 164.308(a)(1)', desc: 'Required by HIPAA Security Rule - annual SRA' },
  { value: 'MEDICATION', label: 'Medication Management Risk Assessment', ref: 'JC MM.01.01.03', desc: 'High-alert medications, look-alike/sound-alike risks' },
  { value: 'CLINICAL_PROCESS', label: 'Clinical Process Failure Mode Analysis (FMEA)', ref: 'JC NPSG', desc: 'Proactive analysis of a specific high-risk clinical process' },
  { value: 'EMERGENCY_MANAGEMENT', label: 'Emergency Management Risk Factors', ref: 'JC EM.01.01.01', desc: 'Complement to HVA - process/people EM risks' },
  { value: 'ENVIRONMENT_OF_CARE', label: 'Environment of Care Risk Assessment', ref: 'JC EC.04.01.01', desc: 'Physical environment hazards discovered during EOC rounds' },
  { value: 'CONSTRUCTION', label: 'Construction / Renovation ICRA', ref: 'JC EC.02.06.01', desc: 'Required before any construction or renovation project' },
  { value: 'OTHER', label: 'Other / Ad Hoc Assessment', ref: '', desc: '' },
];

const CATEGORIES = [
  'Patient Safety', 'Medication Safety', 'Infection Prevention', 'Environment of Care',
  'Security / Workplace Violence', 'IT / Data Security', 'Staff Safety', 'Emergency Management',
  'Regulatory / Compliance', 'Patient Rights', 'Clinical Process', 'Other',
];

const REGULATORY_BODIES = [
  'JOINT_COMMISSION', 'CMS', 'AZ_ADHS', 'OSHA', 'DEA', 'AZ_BON', 'AZ_BPPE', 'INTERNAL',
];

interface RiskItem {
  id: string;
  riskDescription: string;
  category: string;
  likelihood: number;
  severity: number;
  currentControls: string;
  recommendedActions: string;
  assignedTo: string;
  targetDate: string;
}

function calcLevel(l: number, s: number): { label: string; color: string } {
  const score = l * s;
  if (score >= 20) return { label: 'CRITICAL', color: 'text-red-700 bg-red-100' };
  if (score >= 12) return { label: 'HIGH', color: 'text-orange-700 bg-orange-100' };
  if (score >= 6)  return { label: 'MEDIUM', color: 'text-yellow-700 bg-yellow-100' };
  return { label: 'LOW', color: 'text-green-700 bg-green-100' };
}

function newItem(): RiskItem {
  return {
    id: Math.random().toString(36).slice(2),
    riskDescription: '', category: 'Patient Safety',
    likelihood: 1, severity: 1,
    currentControls: '', recommendedActions: '',
    assignedTo: '', targetDate: '',
  };
}

export default function NewRiskAssessmentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<RiskItem[]>([newItem()]);

  function updateItem(id: string, field: keyof RiskItem, value: string | number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;

    const data = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      assessmentType: (form.elements.namedItem('assessmentType') as HTMLSelectElement).value,
      scope: (form.elements.namedItem('scope') as HTMLInputElement).value,
      conductedDate: (form.elements.namedItem('conductedDate') as HTMLInputElement).value,
      conductedBy: (form.elements.namedItem('conductedBy') as HTMLInputElement).value,
      regulatoryBody: (form.elements.namedItem('regulatoryBody') as HTMLSelectElement).value || undefined,
      standardRef: (form.elements.namedItem('standardRef') as HTMLInputElement).value,
      nextReviewDate: (form.elements.namedItem('nextReviewDate') as HTMLInputElement).value,
      summary: (form.elements.namedItem('summary') as HTMLTextAreaElement).value,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value,
      items: items
        .filter(i => i.riskDescription.trim())
        .map(i => ({
          riskDescription: i.riskDescription,
          category: i.category,
          likelihood: Number(i.likelihood),
          severity: Number(i.severity),
          currentControls: i.currentControls || undefined,
          recommendedActions: i.recommendedActions || undefined,
          assignedTo: i.assignedTo || undefined,
          targetDate: i.targetDate || undefined,
        })),
    };

    const res = await fetch('/api/risk-assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push('/trackers/risk-assessments');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save risk assessment.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <a href="/trackers/risk-assessments" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Risk Assessments
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-teal-600" />
          New Risk Assessment
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          JC LD.04.04.01 requires an annual proactive risk assessment. Document all identified risks, their scores, and mitigation plans.
        </p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header info */}
        <div className="bg-card rounded-xl border border-border divide-y divide-border/30">
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Assessment Information</h2>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Assessment Title *</label>
              <input name="title" required placeholder="e.g., 2026 Annual Proactive Risk Assessment" className="form-input w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Assessment Type *</label>
                <select name="assessmentType" required className="form-input w-full">
                  <option value="">Select type…</option>
                  {ASSESSMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Scope / Area Assessed</label>
                <input name="scope" placeholder="e.g., Facility-wide, Unit 3B, Pharmacy" className="form-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date Conducted</label>
                <input name="conductedDate" type="date" className="form-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Conducted By</label>
                <input name="conductedBy" placeholder="Name / Title" className="form-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Regulatory Body</label>
                <select name="regulatoryBody" className="form-input w-full">
                  <option value="">Select…</option>
                  {REGULATORY_BODIES.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Standard Reference</label>
                <input name="standardRef" placeholder="e.g., LD.04.04.01, 45 CFR 164.308" className="form-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Next Review Date</label>
                <input name="nextReviewDate" type="date" className="form-input w-full" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Executive Summary</label>
              <textarea name="summary" rows={3} placeholder="Overall assessment findings, methodology, and conclusions…" className="form-input w-full resize-none" />
            </div>
          </div>
        </div>

        {/* Risk matrix */}
        <div className="bg-card rounded-xl border border-border divide-y divide-border/30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Risk Identification Matrix</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Score = Likelihood (1-5) × Severity (1-5). Critical ≥20 · High ≥12 · Medium ≥6 · Low 1-5</p>
            </div>
            <button
              type="button"
              onClick={() => setItems(prev => [...prev, newItem()])}
              className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              <Plus className="w-4 h-4" /> Add Risk
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {items.map((item, idx) => {
              const score = item.likelihood * item.severity;
              const level = calcLevel(item.likelihood, item.severity);
              return (
                <div key={item.id} className="px-6 py-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground/70 w-5">#{idx + 1}</span>
                    <div className="flex-1">
                      <input
                        value={item.riskDescription}
                        onChange={e => updateItem(item.id, 'riskDescription', e.target.value)}
                        placeholder="Describe the identified risk…"
                        className="form-input w-full font-medium"
                      />
                    </div>
                    {score > 0 && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${level.color}`}>
                        {score} - {level.label}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-muted-foreground/70 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-8">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                      <select
                        value={item.category}
                        onChange={e => updateItem(item.id, 'category', e.target.value)}
                        className="form-input w-full text-xs"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Likelihood (1-5)</label>
                      <select
                        value={item.likelihood}
                        onChange={e => updateItem(item.id, 'likelihood', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={1}>1 - Rare</option>
                        <option value={2}>2 - Unlikely</option>
                        <option value={3}>3 - Possible</option>
                        <option value={4}>4 - Likely</option>
                        <option value={5}>5 - Almost Certain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Severity (1-5)</label>
                      <select
                        value={item.severity}
                        onChange={e => updateItem(item.id, 'severity', Number(e.target.value))}
                        className="form-input w-full text-xs"
                      >
                        <option value={1}>1 - Negligible</option>
                        <option value={2}>2 - Minor</option>
                        <option value={3}>3 - Moderate</option>
                        <option value={4}>4 - Major</option>
                        <option value={5}>5 - Catastrophic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Assigned To</label>
                      <input
                        value={item.assignedTo}
                        onChange={e => updateItem(item.id, 'assignedTo', e.target.value)}
                        placeholder="Name / dept"
                        className="form-input w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-8">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Current Controls</label>
                      <textarea
                        value={item.currentControls}
                        onChange={e => updateItem(item.id, 'currentControls', e.target.value)}
                        rows={2}
                        placeholder="Existing safeguards in place…"
                        className="form-input w-full text-xs resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Recommended Actions</label>
                      <textarea
                        value={item.recommendedActions}
                        onChange={e => updateItem(item.id, 'recommendedActions', e.target.value)}
                        rows={2}
                        placeholder="Mitigation steps to reduce risk…"
                        className="form-input w-full text-xs resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Target Date</label>
                      <input
                        type="date"
                        value={item.targetDate}
                        onChange={e => updateItem(item.id, 'targetDate', e.target.value)}
                        className="form-input w-full text-xs"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {items.length === 0 && (
            <div className="px-6 py-8 text-center text-muted-foreground/70 text-sm">
              No risks added yet.{' '}
              <button type="button" onClick={() => setItems([newItem()])} className="text-teal-600 hover:underline">
                Add your first risk
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border px-6 py-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Additional Notes</label>
          <textarea name="notes" rows={3} placeholder="Methodology used, sources reviewed, team members involved, follow-up plans…" className="form-input w-full resize-none" />
        </div>

        <div className="flex items-center justify-end gap-3">
          <a href="/trackers/risk-assessments" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</a>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save Assessment'}
          </button>
        </div>
      </form>
    </div>
  );
}
