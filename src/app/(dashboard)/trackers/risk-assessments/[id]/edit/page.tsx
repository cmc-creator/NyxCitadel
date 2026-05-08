'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Plus, Trash2 } from 'lucide-react';

const ASSESSMENT_TYPES = [
  { value: 'ANNUAL_PROACTIVE', label: 'Annual Proactive Risk Assessment' },
  { value: 'INFECTION_CONTROL', label: 'Infection Control Risk Assessment (ICRA)' },
  { value: 'SECURITY', label: 'Workplace Violence / Security Risk Assessment' },
  { value: 'IT_SECURITY', label: 'IT / HIPAA Security Risk Analysis' },
  { value: 'MEDICATION', label: 'Medication Management Risk Assessment' },
  { value: 'CLINICAL_PROCESS', label: 'Clinical Process Failure Mode Analysis (FMEA)' },
  { value: 'EMERGENCY_MANAGEMENT', label: 'Emergency Management Risk Factors' },
  { value: 'ENVIRONMENT_OF_CARE', label: 'Environment of Care Risk Assessment' },
  { value: 'CONSTRUCTION', label: 'Construction / Renovation ICRA' },
  { value: 'OTHER', label: 'Other / Ad Hoc Assessment' },
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

export default function EditRiskAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<RiskItem[]>([newItem()]);

  useEffect(() => {
    fetch(`/api/risk-assessments/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        if (d.items && d.items.length > 0) {
          setItems(d.items.map((item: any) => ({
            id: item.id ?? Math.random().toString(36).slice(2),
            riskDescription: item.riskDescription ?? '',
            category: item.category ?? 'Patient Safety',
            likelihood: item.likelihood ?? 1,
            severity: item.severity ?? 1,
            currentControls: item.currentControls ?? '',
            recommendedActions: item.recommendedActions ?? '',
            assignedTo: item.assignedTo ?? '',
            targetDate: item.targetDate ? item.targetDate.split('T')[0] : '',
          })));
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  function updateItem(itemId: string, field: keyof RiskItem, value: string | number) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, [field]: value } : i));
  }

  function removeItem(itemId: string) {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;

    const payload = {
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

    const res = await fetch(`/api/risk-assessments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/trackers/risk-assessments/${id}`);
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to update.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <a href={`/trackers/risk-assessments/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-purple-600" />
          Edit Risk Assessment
        </h1>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="space-y-4">
        {/* Header info */}
        <div className="bg-card rounded-xl border border-border divide-y divide-border/30">
          <div className="px-6 py-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Assessment Information</h2>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Assessment Title *</label>
              <input name="title" required defaultValue={data.title} className="form-input w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Assessment Type *</label>
                <select name="assessmentType" required defaultValue={data.assessmentType} className="form-input w-full">
                  <option value="">Select type…</option>
                  {ASSESSMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Scope / Area Assessed</label>
                <input name="scope" defaultValue={data.scope ?? ''} className="form-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date Conducted</label>
                <input name="conductedDate" type="date" defaultValue={data.conductedDate ? data.conductedDate.split('T')[0] : ''} className="form-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Conducted By</label>
                <input name="conductedBy" defaultValue={data.conductedBy ?? ''} className="form-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Regulatory Body</label>
                <select name="regulatoryBody" defaultValue={data.regulatoryBody ?? ''} className="form-input w-full">
                  <option value="">Select…</option>
                  {REGULATORY_BODIES.map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Standard Reference</label>
                <input name="standardRef" defaultValue={data.standardRef ?? ''} className="form-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Next Review Date</label>
                <input name="nextReviewDate" type="date" defaultValue={data.nextReviewDate ? data.nextReviewDate.split('T')[0] : ''} className="form-input w-full" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Executive Summary</label>
              <textarea name="summary" rows={3} defaultValue={data.summary ?? ''} className="form-input w-full resize-none" />
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
              className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
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
              <button type="button" onClick={() => setItems([newItem()])} className="text-purple-600 hover:underline">
                Add your first risk
              </button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border px-6 py-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Additional Notes</label>
          <textarea name="notes" rows={3} defaultValue={data.notes ?? ''} className="form-input w-full resize-none" />
        </div>

        <div className="flex items-center justify-end gap-3">
          <a href={`/trackers/risk-assessments/${id}`} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</a>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
