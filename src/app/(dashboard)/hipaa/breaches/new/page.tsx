'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

const BREACH_TYPES = [
  'UNAUTHORIZED_ACCESS', 'IMPROPER_DISPOSAL', 'LOST_STOLEN_DEVICE',
  'RANSOMWARE_CYBERATTACK', 'MISDIRECTED_COMMUNICATIONS',
  'INSIDER_THREAT', 'VERBAL_DISCLOSURE', 'OTHER',
];

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CONFIRMED'];

const PHI_TYPES = [
  'Name', 'DOB', 'Address', 'Phone', 'Email', 'SSN', 'MRN',
  'Diagnosis', 'Treatment Info', 'Financial Info', 'Insurance Info', 'Photos',
];

export default function NewHipaaBreachPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhi, setSelectedPhi] = useState<string[]>([]);

  function togglePhi(phi: string) {
    setSelectedPhi(prev => prev.includes(phi) ? prev.filter(p => p !== phi) : [...prev, phi]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      incidentNumber:   (form.elements.namedItem('incidentNumber') as HTMLInputElement).value,
      discoveryDate:    (form.elements.namedItem('discoveryDate') as HTMLInputElement).value,
      incidentDate:     (form.elements.namedItem('incidentDate') as HTMLInputElement).value || null,
      breachType:       (form.elements.namedItem('breachType') as HTMLSelectElement).value,
      phiInvolved:      selectedPhi,
      individualCount:  Number((form.elements.namedItem('individualCount') as HTMLInputElement).value) || null,
      description:      (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      immediateActions: (form.elements.namedItem('immediateActions') as HTMLTextAreaElement).value,
      riskAssessment:   (form.elements.namedItem('riskAssessment') as HTMLSelectElement).value,
      reportableBreach: (form.elements.namedItem('reportableBreach') as HTMLInputElement).checked,
    };

    const res = await fetch('/api/hipaa/breaches', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/hipaa/breaches'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save breach log.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/hipaa/breaches" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Breach Log
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Log HIPAA Privacy Incident
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Reportable breaches of 500+ individuals must be reported to HHS within 60 days.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Incident Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Incident Number *</label>
              <input name="incidentNumber" required className="form-input w-full" placeholder="HIPAA-2026-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Breach Type *</label>
              <select name="breachType" required className="form-input w-full">
                <option value="">Select…</option>
                {BREACH_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Discovery Date *</label>
              <input name="discoveryDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Incident Date (if known)</label>
              <input name="incidentDate" type="date" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Individuals Affected (count)</label>
            <input name="individualCount" type="number" min="0" className="form-input w-full" placeholder="0" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">PHI Involved</h2>
          <div className="flex flex-wrap gap-2">
            {PHI_TYPES.map(p => (
              <button key={p} type="button" onClick={() => togglePhi(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${selectedPhi.includes(p) ? 'bg-red-100 text-red-700 border-red-300' : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-400'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Narrative</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description of Incident *</label>
            <textarea name="description" required rows={4} className="form-input w-full" placeholder="What happened, how PHI was disclosed, who was affected…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Immediate Actions Taken *</label>
            <textarea name="immediateActions" required rows={3} className="form-input w-full" placeholder="Steps taken upon discovery…" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Risk Assessment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Risk Level *</label>
              <select name="riskAssessment" required className="form-input w-full">
                {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="reportableBreach" type="checkbox" className="rounded" />
            Confirmed reportable breach (triggers HHS notification)
          </label>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/hipaa/breaches" className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Log Incident'}
          </button>
        </div>
      </form>
    </div>
  );
}
