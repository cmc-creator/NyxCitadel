'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditHipaaBreachPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhi, setSelectedPhi] = useState<string[]>([]);
  const [reportableBreach, setReportableBreach] = useState(false);

  function togglePhi(phi: string) {
    setSelectedPhi(prev => prev.includes(phi) ? prev.filter(p => p !== phi) : [...prev, phi]);
  }

  useEffect(() => {
    fetch(`/api/hipaa/breaches/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setSelectedPhi(Array.isArray(d.phiInvolved) ? d.phiInvolved : []);
        setReportableBreach(d.reportableBreach ?? false);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSaving(true); setError('');
    const form = e.currentTarget;
    const payload = {
      incidentNumber:   (form.elements.namedItem('incidentNumber') as HTMLInputElement).value,
      discoveryDate:    (form.elements.namedItem('discoveryDate') as HTMLInputElement).value,
      incidentDate:     (form.elements.namedItem('incidentDate') as HTMLInputElement).value || null,
      breachType:       (form.elements.namedItem('breachType') as HTMLSelectElement).value,
      phiInvolved:      selectedPhi,
      individualCount:  Number((form.elements.namedItem('individualCount') as HTMLInputElement).value) || null,
      description:      (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      immediateActions: (form.elements.namedItem('immediateActions') as HTMLTextAreaElement).value,
      riskAssessment:   (form.elements.namedItem('riskAssessment') as HTMLSelectElement).value,
      reportableBreach,
    };
    const res = await fetch(`/api/hipaa/breaches/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/hipaa/breaches/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/hipaa/breaches/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          Edit HIPAA Privacy Incident
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Incident Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Incident Number *</label>
              <input name="incidentNumber" required defaultValue={data.incidentNumber} className="form-input w-full" placeholder="HIPAA-2026-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Breach Type *</label>
              <select name="breachType" required defaultValue={data.breachType} className="form-input w-full">
                <option value="">Select…</option>
                {BREACH_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Discovery Date *</label>
              <input name="discoveryDate" type="date" required defaultValue={data.discoveryDate ? data.discoveryDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Incident Date (if known)</label>
              <input name="incidentDate" type="date" defaultValue={data.incidentDate ? data.incidentDate.split('T')[0] : ''} className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Individuals Affected (count)</label>
            <input name="individualCount" type="number" min="0" defaultValue={data.individualCount ?? ''} className="form-input w-full" placeholder="0" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">PHI Involved</h2>
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
          <h2 className="text-sm font-semibold text-foreground">Narrative</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description of Incident *</label>
            <textarea name="description" required rows={4} defaultValue={data.description} className="form-input w-full" placeholder="What happened, how PHI was disclosed, who was affected…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Immediate Actions Taken *</label>
            <textarea name="immediateActions" required rows={3} defaultValue={data.immediateActions} className="form-input w-full" placeholder="Steps taken upon discovery…" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Risk Assessment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Risk Level *</label>
              <select name="riskAssessment" required defaultValue={data.riskAssessment} className="form-input w-full">
                {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="reportableBreach" type="checkbox" className="rounded" checked={reportableBreach} onChange={e => setReportableBreach(e.target.checked)} />
            Confirmed reportable breach (triggers HHS notification)
          </label>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/hipaa/breaches/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
