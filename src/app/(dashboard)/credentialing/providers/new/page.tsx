'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserCheck } from 'lucide-react';

const PROVIDER_TYPES = ['PHYSICIAN', 'ADVANCED_PRACTICE', 'DENTIST', 'PSYCHOLOGIST', 'ALLIED_HEALTH', 'TELEMEDICINE'];
const PROVIDER_STATUSES = ['ACTIVE', 'PENDING', 'SUSPENDED', 'RESIGNED', 'EXPIRED', 'REVOKED'];

export default function NewProviderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
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

    const res = await fetch('/api/credentialing/providers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/credentialing/providers'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save provider.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/credentialing/providers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Providers
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-blue-600" />
          Add Provider
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Initial appointment or new credentialing application.</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">First Name *</label>
              <input name="firstName" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Name *</label>
              <input name="lastName" required className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Credentials *</label>
              <input name="credentials" required className="form-input w-full" placeholder="MD, DO, APRN…" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">NPI Number</label>
              <input name="npi" className="form-input w-full" placeholder="10-digit NPI" />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Credentials &amp; Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Provider Type *</label>
              <select name="providerType" required className="form-input w-full">
                <option value="">Select…</option>
                {PROVIDER_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Specialty *</label>
              <input name="specialty" required className="form-input w-full" placeholder="e.g. Psychiatry, Internal Medicine" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Department</label>
              <input name="department" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status *</label>
              <select name="status" required defaultValue="ACTIVE" className="form-input w-full">
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
              <input name="primaryEmail" type="email" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input name="phone" type="tel" className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Initial Appointment Date</label>
              <input name="initialAppointDate" type="date" className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reappointment Date</label>
              <input name="reappointmentDate" type="date" className="form-input w-full" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/credentialing/providers" className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-accent/50">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Add Provider'}
          </button>
        </div>
      </form>
    </div>
  );
}
