'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';

const FACILITY_TYPES = [
  { value: 'ACUTE_PSYCH', label: 'Acute Psychiatric' },
  { value: 'GENERAL_ACUTE', label: 'General Acute Care' },
  { value: 'LTAC', label: 'Long-Term Acute Care' },
  { value: 'SNF', label: 'Skilled Nursing Facility' },
  { value: 'BEHAVIORAL_HEALTH_OUTPATIENT', label: 'Behavioral Health Outpatient' },
  { value: 'CRISIS_CENTER', label: 'Crisis Center' },
  { value: 'RESIDENTIAL', label: 'Residential' },
];

export default function NewFacilityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    facilityType: 'ACUTE_PSYCH',
    city: '',
    state: 'AZ',
    address: '',
    phone: '',
    licenseNumber: '',
    bedCount: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          bedCount: form.bedCount ? parseInt(form.bedCount) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create facility.');
        return;
      }
      router.push('/admin');
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Admin
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" /> New Facility
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Facility Information</h2>

          <div className="grid grid-cols-1 gap-4">
            <Field label="Facility Name *">
              <input
                required
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Destiny Springs Behavioral Health"
                className="form-input w-full"
              />
            </Field>

            <Field label="Facility Type">
              <select
                value={form.facilityType}
                onChange={(e) => set('facilityType', e.target.value)}
                className="form-input w-full"
              >
                {FACILITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="City">
                <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Phoenix" className="input-base" />
              </Field>
              <Field label="State">
                <input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="AZ" maxLength={2} className="input-base" />
              </Field>
            </div>

            <Field label="Address">
              <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="123 Main St" className="input-base" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(602) 555-0100" className="input-base" />
              </Field>
              <Field label="License Number">
                <input value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} placeholder="AZ-HOSP-12345" className="input-base" />
              </Field>
            </div>

            <Field label="Bed Count">
              <input
                type="number"
                min="1"
                value={form.bedCount}
                onChange={(e) => set('bedCount', e.target.value)}
                placeholder="50"
                className="form-input w-full"
              />
            </Field>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wide">Initial Admin User</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Optional - create the first admin account for this facility.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Field label="Admin Name">
              <input value={form.adminName} onChange={(e) => set('adminName', e.target.value)} placeholder="Jane Smith" className="input-base" />
            </Field>
            <Field label="Admin Email">
              <input type="email" value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} placeholder="admin@facility.org" className="input-base" />
            </Field>
            <Field label="Temporary Password">
              <input
                type="password"
                value={form.adminPassword}
                onChange={(e) => set('adminPassword', e.target.value)}
                placeholder="Min 8 characters"
                minLength={form.adminEmail ? 8 : 0}
                required={!!form.adminEmail}
                className="form-input w-full"
              />
            </Field>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-300 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Facility'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}
