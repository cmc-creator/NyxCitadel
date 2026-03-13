'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

const CONSENT_TYPES = [
  'GENERAL_TREATMENT', 'MEDICATION', 'PROCEDURE', 'TELEHEALTH',
  'PHOTOGRAPHY_RECORDING', 'RELEASE_OF_INFO', 'PARTICIPATION_IN_RESEARCH',
  'ECT', 'SPECIALIZED_TREATMENT',
];
const CONSENT_STATUSES = ['SIGNED', 'VERBAL', 'REFUSED', 'REVOKED', 'UNABLE_CAPACITY'];

export default function EditConsentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [patientCapacityDetermined, setPatientCapacityDetermined] = useState(false);

  useEffect(() => {
    fetch(`/api/patient-rights/consents/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setPatientCapacityDetermined(!!d.patientCapacityDetermined);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const payload = {
      patientInitials:           (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      patientMrn:                (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      admitDate:                 (form.elements.namedItem('admitDate') as HTMLInputElement).value || null,
      consentType:               (form.elements.namedItem('consentType') as HTMLSelectElement).value,
      consentDate:               (form.elements.namedItem('consentDate') as HTMLInputElement).value,
      obtainedBy:                (form.elements.namedItem('obtainedBy') as HTMLInputElement).value,
      witnessName:               (form.elements.namedItem('witnessName') as HTMLInputElement).value || null,
      patientCapacityDetermined,
      legalRepresentative:       (form.elements.namedItem('legalRepresentative') as HTMLInputElement).value || null,
      status:                    (form.elements.namedItem('status') as HTMLSelectElement).value,
      notes:                     (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/patient-rights/consents/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/patient-rights/consents/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/patient-rights/consents/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Edit Consent Record
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Patient</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Patient Initials *</label>
              <input name="patientInitials" required className="form-input w-full" defaultValue={data.patientInitials ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">MRN</label>
              <input name="patientMrn" className="form-input w-full" defaultValue={data.patientMrn ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Admit Date</label>
            <input name="admitDate" type="date" className="form-input w-full" defaultValue={data.admitDate?.split('T')[0] ?? ''} />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Consent Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Consent Type *</label>
              <select name="consentType" required className="form-input w-full" defaultValue={data.consentType ?? ''}>
                <option value="">Select…</option>
                {CONSENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status *</label>
              <select name="status" required className="form-input w-full" defaultValue={data.status ?? 'SIGNED'}>
                {CONSENT_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Consent Date *</label>
              <input name="consentDate" type="date" required className="form-input w-full" defaultValue={data.consentDate?.split('T')[0] ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Obtained By *</label>
              <input name="obtainedBy" required className="form-input w-full" defaultValue={data.obtainedBy ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Witness Name</label>
              <input name="witnessName" className="form-input w-full" defaultValue={data.witnessName ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Legal Representative (if capacity lacking)</label>
              <input name="legalRepresentative" className="form-input w-full" defaultValue={data.legalRepresentative ?? ''} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="patientCapacityDetermined" type="checkbox" className="rounded"
              checked={patientCapacityDetermined} onChange={e => setPatientCapacityDetermined(e.target.checked)} />
            Patient decisional capacity determined
          </label>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea name="notes" rows={3} className="form-input w-full" defaultValue={data.notes ?? ''} />
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <DeleteButton
            apiPath={`/api/patient-rights/consents/${id}`}
            redirectPath="/patient-rights/consents"
            label="consent record"
          />
          <div className="flex gap-3">
            <a href={`/patient-rights/consents/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
