'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ScrollText } from 'lucide-react';

const AD_TYPES = ['Living Will', 'DPAHC', 'POLST', 'Healthcare Proxy', 'DNR Order', 'None'];

export default function EditAdvanceDirectivePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [adExists, setAdExists] = useState(false);
  const [adOnFile, setAdOnFile] = useState(false);
  const [informationProvided, setInformationProvided] = useState(false);
  const [patientDeclined, setPatientDeclined] = useState(false);

  useEffect(() => {
    fetch(`/api/patient-rights/adv-directives/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setAdExists(!!d.adExists);
        setAdOnFile(!!d.adOnFile);
        setInformationProvided(!!d.informationProvided);
        setPatientDeclined(!!d.patientDeclined);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading…</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const payload = {
      patientInitials:     (form.elements.namedItem('patientInitials') as HTMLInputElement).value,
      patientMrn:          (form.elements.namedItem('patientMrn') as HTMLInputElement).value || null,
      admitDate:           (form.elements.namedItem('admitDate') as HTMLInputElement).value,
      adExists,
      adType:              (form.elements.namedItem('adType') as HTMLSelectElement).value || null,
      adOnFile,
      informationProvided,
      providedBy:          (form.elements.namedItem('providedBy') as HTMLInputElement).value || null,
      patientDeclined,
      documentedBy:        (form.elements.namedItem('documentedBy') as HTMLInputElement).value,
      documentedDate:      (form.elements.namedItem('documentedDate') as HTMLInputElement).value,
      notes:               (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/patient-rights/adv-directives/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/patient-rights/advance-directives/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/patient-rights/advance-directives/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-500 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-teal-600" />
          Edit Advance Directive
        </h1>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Patient</h2>
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
            <label className="block text-xs font-medium text-slate-600 mb-1">Admit Date *</label>
            <input name="admitDate" type="date" required className="form-input w-full" defaultValue={data.admitDate?.split('T')[0] ?? ''} />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Advance Directive Status</h2>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input name="adExists" type="checkbox" className="rounded" checked={adExists} onChange={e => setAdExists(e.target.checked)} />
              Patient has an advance directive
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input name="adOnFile" type="checkbox" className="rounded" checked={adOnFile} onChange={e => setAdOnFile(e.target.checked)} />
              Copy on file / in chart
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input name="informationProvided" type="checkbox" className="rounded" checked={informationProvided} onChange={e => setInformationProvided(e.target.checked)} />
              Patient provided information about advance directives
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input name="patientDeclined" type="checkbox" className="rounded" checked={patientDeclined} onChange={e => setPatientDeclined(e.target.checked)} />
              Patient declined to complete / discuss
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">AD Type</label>
              <select name="adType" className="form-input w-full" defaultValue={data.adType ?? ''}>
                <option value="">Select…</option>
                {AD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Information Provided By</label>
              <input name="providedBy" className="form-input w-full" defaultValue={data.providedBy ?? ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Documentation</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Documented By *</label>
              <input name="documentedBy" required className="form-input w-full" defaultValue={data.documentedBy ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Documented Date *</label>
              <input name="documentedDate" type="date" required className="form-input w-full" defaultValue={data.documentedDate?.split('T')[0] ?? ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" defaultValue={data.notes ?? ''} />
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/patient-rights/advance-directives/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
