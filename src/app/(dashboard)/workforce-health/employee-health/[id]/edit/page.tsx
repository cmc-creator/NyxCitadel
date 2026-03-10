'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, HeartPulse } from 'lucide-react';

const TB_METHODS = ['IGRA', 'TST', 'CXR'];
const TB_RESULTS = ['Negative', 'Positive', 'Indeterminate'];
const COVID_STATUSES = ['Fully Vaccinated', 'Partially Vaccinated', 'Declined', 'Medical Exemption', 'Unknown'];

export default function EditEmployeeHealthPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fluDeclined, setFluDeclined] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);

  useEffect(() => {
    fetch(`/api/workforce-health/employee-health/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setFluDeclined(!!d.fluVaxDeclined);
        setLicenseVerified(!!d.licenseVerified);
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
    const g = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null);
    const payload = {
      employeeId:       g('employeeId')?.value || null,
      employeeName:     (g('employeeName') as HTMLInputElement).value,
      department:       (g('department') as HTMLInputElement).value,
      hireDate:         g('hireDate')?.value || null,
      tbScreenDate:     g('tbScreenDate')?.value || null,
      tbMethod:         (g('tbMethod') as HTMLSelectElement)?.value || null,
      tbResult:         (g('tbResult') as HTMLSelectElement)?.value || null,
      tbNextDueDate:    g('tbNextDueDate')?.value || null,
      fluVaxDate:       g('fluVaxDate')?.value || null,
      fluVaxSeason:     g('fluVaxSeason')?.value || null,
      fluVaxDeclined:   fluDeclined,
      fluDeclineReason: fluDeclined ? g('fluDeclineReason')?.value || null : null,
      covidVaxStatus:   (g('covidVaxStatus') as HTMLSelectElement)?.value || null,
      bgCheckDate:      g('bgCheckDate')?.value || null,
      licenseVerified,
      fitTestDate:      g('fitTestDate')?.value || null,
      fitTestResult:    g('fitTestResult')?.value || null,
      fitTestModel:     g('fitTestModel')?.value || null,
      notes:            (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/workforce-health/employee-health/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/workforce-health/employee-health/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/workforce-health/employee-health/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-orange-600" />
          Edit Employee Health Record
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Employee Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employee Name *</label>
              <input name="employeeName" type="text" required className="form-input w-full" defaultValue={data.employeeName ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Employee ID</label>
              <input name="employeeId" type="text" className="form-input w-full" defaultValue={data.employeeId ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department *</label>
              <input name="department" type="text" required className="form-input w-full" defaultValue={data.department ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hire Date</label>
              <input name="hireDate" type="date" className="form-input w-full" defaultValue={data.hireDate?.split('T')[0] ?? ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">TB Screening</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Screen Date</label>
              <input name="tbScreenDate" type="date" className="form-input w-full" defaultValue={data.tbScreenDate?.split('T')[0] ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method</label>
              <select name="tbMethod" className="form-input w-full" defaultValue={data.tbMethod ?? ''}>
                <option value="">—</option>
                {TB_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Result</label>
              <select name="tbResult" className="form-input w-full" defaultValue={data.tbResult ?? ''}>
                <option value="">—</option>
                {TB_RESULTS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="w-1/2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Next Due Date</label>
            <input name="tbNextDueDate" type="date" className="form-input w-full" defaultValue={data.tbNextDueDate?.split('T')[0] ?? ''} />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Influenza Vaccination</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Flu Vax Date</label>
              <input name="fluVaxDate" type="date" className="form-input w-full" defaultValue={data.fluVaxDate?.split('T')[0] ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Flu Season</label>
              <input name="fluVaxSeason" type="text" className="form-input w-full" defaultValue={data.fluVaxSeason ?? ''} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="fluVaxDeclined" type="checkbox" className="rounded"
              checked={fluDeclined} onChange={e => setFluDeclined(e.target.checked)} />
            Declined Flu Vaccine
          </label>
          {fluDeclined && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Decline Reason</label>
              <input name="fluDeclineReason" type="text" className="form-input w-full" defaultValue={data.fluDeclineReason ?? ''} />
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Other Health Items</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">COVID Vax Status</label>
              <select name="covidVaxStatus" className="form-input w-full" defaultValue={data.covidVaxStatus ?? ''}>
                <option value="">—</option>
                {COVID_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Background Check Date</label>
              <input name="bgCheckDate" type="date" className="form-input w-full" defaultValue={data.bgCheckDate?.split('T')[0] ?? ''} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input name="licenseVerified" type="checkbox" className="rounded"
              checked={licenseVerified} onChange={e => setLicenseVerified(e.target.checked)} />
            License / Credential Verified
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fit Test Date</label>
              <input name="fitTestDate" type="date" className="form-input w-full" defaultValue={data.fitTestDate?.split('T')[0] ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fit Test Result</label>
              <input name="fitTestResult" type="text" className="form-input w-full" defaultValue={data.fitTestResult ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Respirator Model</label>
              <input name="fitTestModel" type="text" className="form-input w-full" defaultValue={data.fitTestModel ?? ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
          <textarea name="notes" rows={2} className="form-input w-full" defaultValue={data.notes ?? ''} />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/workforce-health/employee-health/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
