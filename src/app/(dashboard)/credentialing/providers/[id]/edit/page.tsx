'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, UserCheck } from 'lucide-react';

const PROVIDER_TYPES = ['PHYSICIAN', 'ADVANCED_PRACTICE', 'DENTIST', 'PSYCHOLOGIST', 'ALLIED_HEALTH', 'TELEMEDICINE'];
const PROVIDER_STATUSES = ['ACTIVE', 'PENDING', 'SUSPENDED', 'RESIGNED', 'EXPIRED', 'REVOKED'];

export default function EditProviderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/credentialing/providers/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
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
      firstName:          (form.elements.namedItem('firstName') as HTMLInputElement).value,
      lastName:           (form.elements.namedItem('lastName') as HTMLInputElement).value,
      credentials:        (form.elements.namedItem('credentials') as HTMLInputElement).value,
      specialty:          (form.elements.namedItem('specialty') as HTMLInputElement).value,
      providerType:       (form.elements.namedItem('providerType') as HTMLSelectElement).value,
      npi:                (form.elements.namedItem('npi') as HTMLInputElement).value || null,
      department:         (form.elements.namedItem('department') as HTMLInputElement).value || null,
      primaryEmail:       (form.elements.namedItem('primaryEmail') as HTMLInputElement).value || null,
      phone:              (form.elements.namedItem('phone') as HTMLInputElement).value || null,
      status:             (form.elements.namedItem('status') as HTMLSelectElement).value,
      initialAppointDate: (form.elements.namedItem('initialAppointDate') as HTMLInputElement).value || null,
      reappointmentDate:  (form.elements.namedItem('reappointmentDate') as HTMLInputElement).value || null,
    };
    const res = await fetch(`/api/credentialing/providers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/credentialing/providers/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/credentialing/providers/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-600" />
          Edit Provider
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Update provider credentials and appointment information.</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">First Name *</label>
              <input name="firstName" required className="form-input w-full"
                defaultValue={data.firstName ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Name *</label>
              <input name="lastName" required className="form-input w-full"
                defaultValue={data.lastName ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Credentials *</label>
              <input name="credentials" required className="form-input w-full"
                defaultValue={data.credentials ?? ''} placeholder="MD, DO, APRN…" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">NPI Number</label>
              <input name="npi" className="form-input w-full"
                defaultValue={data.npi ?? ''} placeholder="10-digit NPI" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Credentials &amp; Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Provider Type *</label>
              <select name="providerType" required className="form-input w-full" defaultValue={data.providerType ?? ''}>
                <option value="">Select…</option>
                {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Specialty *</label>
              <input name="specialty" required className="form-input w-full"
                defaultValue={data.specialty ?? ''} placeholder="e.g. Psychiatry, Internal Medicine" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <input name="department" className="form-input w-full"
                defaultValue={data.department ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status *</label>
              <select name="status" required className="form-input w-full" defaultValue={data.status ?? 'ACTIVE'}>
                {PROVIDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Contact &amp; Appointment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input name="primaryEmail" type="email" className="form-input w-full"
                defaultValue={data.primaryEmail ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input name="phone" type="tel" className="form-input w-full"
                defaultValue={data.phone ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Initial Appointment Date</label>
              <input name="initialAppointDate" type="date" className="form-input w-full"
                defaultValue={data.initialAppointDate ? data.initialAppointDate.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reappointment Date</label>
              <input name="reappointmentDate" type="date" className="form-input w-full"
                defaultValue={data.reappointmentDate ? data.reappointmentDate.split('T')[0] : ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/credentialing/providers/${id}`} className="px-4 py-2 text-sm text-slate-600 hover:text-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
