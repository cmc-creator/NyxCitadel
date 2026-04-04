'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, CheckCircle2, AlertCircle, Palette } from 'lucide-react';

const FACILITY_TYPES = [
  { value: 'ACUTE_PSYCH',                  label: 'Acute Psychiatric Hospital' },
  { value: 'GENERAL_ACUTE',                label: 'General Acute Care Hospital' },
  { value: 'LTAC',                          label: 'Long-Term Acute Care (LTAC)' },
  { value: 'SNF',                           label: 'Skilled Nursing Facility (SNF)' },
  { value: 'BEHAVIORAL_HEALTH_OUTPATIENT', label: 'Behavioral Health Outpatient' },
  { value: 'CRISIS_CENTER',                label: 'Crisis Stabilization Center' },
  { value: 'RESIDENTIAL',                  label: 'Residential Treatment' },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const TIMEZONES = [
  { value: 'America/Phoenix',     label: 'Mountain (Arizona)  No DST' },
  { value: 'America/Denver',      label: 'Mountain (MT/CO/NM/UT)' },
  { value: 'America/Chicago',     label: 'Central' },
  { value: 'America/New_York',    label: 'Eastern' },
  { value: 'America/Los_Angeles', label: 'Pacific' },
  { value: 'America/Anchorage',   label: 'Alaska' },
  { value: 'Pacific/Honolulu',    label: 'Hawaii' },
];

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label}{note && <span className="font-normal text-muted-foreground/70 ml-1">{note}</span>}
      </label>
      {children}
    </div>
  );
}

interface FacilityForm {
  name: string; shortName: string; facilityType: string; bedCount: string;
  address: string; city: string; state: string; zip: string;
  phone: string; fax: string; timezone: string;
  npi: string; medicareId: string; medicaidId: string; jcAhcId: string;
  licenseNumber: string; licenseExpiry: string;
  primaryColor: string; secondaryColor: string;
}

const EMPTY: FacilityForm = {
  name: '', shortName: '', facilityType: 'ACUTE_PSYCH', bedCount: '',
  address: '', city: '', state: 'AZ', zip: '', phone: '', fax: '',
  timezone: 'America/Phoenix', npi: '', medicareId: '', medicaidId: '',
  jcAhcId: '', licenseNumber: '', licenseExpiry: '',
  primaryColor: '#1e40af', secondaryColor: '#3b82f6',
};

export default function FacilitySettingsPage() {
  const [form, setForm]     = useState<FacilityForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/facility')
      .then(r => r.json())
      .then(data => {
        setForm({
          name:          data.name          ?? '',
          shortName:     data.shortName     ?? '',
          facilityType:  data.facilityType  ?? 'ACUTE_PSYCH',
          bedCount:      data.bedCount != null ? String(data.bedCount) : '',
          address:       data.address       ?? '',
          city:          data.city          ?? '',
          state:         data.state         ?? 'AZ',
          zip:           data.zip           ?? '',
          phone:         data.phone         ?? '',
          fax:           data.fax           ?? '',
          timezone:      data.timezone      ?? 'America/Phoenix',
          npi:           data.npi           ?? '',
          medicareId:    data.medicareId    ?? '',
          medicaidId:    data.medicaidId    ?? '',
          jcAhcId:       data.jcAhcId       ?? '',
          licenseNumber: data.licenseNumber ?? '',
          licenseExpiry: data.licenseExpiry
            ? new Date(data.licenseExpiry).toISOString().slice(0, 10)
            : '',
          primaryColor:   data.primaryColor   ?? '#1e40af',
          secondaryColor: data.secondaryColor ?? '#3b82f6',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function set(field: keyof FacilityForm, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    const res = await fetch('/api/facility', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        bedCount: form.bedCount ? parseInt(form.bedCount, 10) : null,
        licenseExpiry: form.licenseExpiry || null,
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Save failed. Check your permissions.');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-6 h-6 text-teal-600" />
            Facility Configuration
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            White-label branding, facility details, and regulatory identifiers.
            Changes apply platform-wide for this facility.
          </p>
        </div>
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Save className="w-4 h-4" />{saving ? 'Saving' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800 font-medium">Facility settings saved successfully.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border divide-y divide-border/30">
        {/* Facility Info */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Facility Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Facility Name *">
              <input required type="text" value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Sunrise Behavioral Health"
                className="form-input w-full text-sm" />
            </Field>
            <Field label="Short Name / Abbreviation">
              <input type="text" value={form.shortName}
                onChange={e => set('shortName', e.target.value)}
                placeholder="DSBH" className="form-input w-full text-sm" />
            </Field>
            <Field label="Facility Type">
              <select value={form.facilityType} onChange={e => set('facilityType', e.target.value)}
                className="form-input w-full text-sm">
                {FACILITY_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
              </select>
            </Field>
            <Field label="Licensed Bed Count" note="(used in QAPI occupancy rate calculations)">
              <input type="number" min={1} max={9999} value={form.bedCount}
                onChange={e => set('bedCount', e.target.value)}
                placeholder="95" className="form-input w-full text-sm" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Street Address">
                <input type="text" value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="1234 W Health Pkwy" className="form-input w-full text-sm" />
              </Field>
            </div>
            <Field label="City">
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="Peoria" className="form-input w-full text-sm" />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="State">
                <select value={form.state} onChange={e => set('state', e.target.value)}
                  className="form-input w-full text-sm">
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="ZIP">
                <input type="text" value={form.zip} onChange={e => set('zip', e.target.value)}
                  placeholder="85345" className="form-input w-full text-sm" />
              </Field>
            </div>
            <Field label="Phone">
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="(623) 555-0100" className="form-input w-full text-sm" />
            </Field>
            <Field label="Fax">
              <input type="tel" value={form.fax} onChange={e => set('fax', e.target.value)}
                placeholder="(623) 555-0199" className="form-input w-full text-sm" />
            </Field>
            <Field label="Timezone">
              <select value={form.timezone} onChange={e => set('timezone', e.target.value)}
                className="form-input w-full text-sm">
                {TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Regulatory IDs */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Regulatory Identifiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="NPI (National Provider Identifier)">
              <input type="text" value={form.npi} onChange={e => set('npi', e.target.value)}
                placeholder="1234567890" className="form-input w-full text-sm font-mono" />
            </Field>
            <Field label="Medicare Provider #">
              <input type="text" value={form.medicareId} onChange={e => set('medicareId', e.target.value)}
                placeholder="03-XXXX" className="form-input w-full text-sm font-mono" />
            </Field>
            <Field label="Medicaid Provider #">
              <input type="text" value={form.medicaidId} onChange={e => set('medicaidId', e.target.value)}
                className="form-input w-full text-sm font-mono" />
            </Field>
            <Field label="Joint Commission (AHCA) ID">
              <input type="text" value={form.jcAhcId} onChange={e => set('jcAhcId', e.target.value)}
                className="form-input w-full text-sm font-mono" />
            </Field>
            <Field label="State License # (AZ ADHS or other)">
              <input type="text" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)}
                className="form-input w-full text-sm font-mono" />
            </Field>
            <Field label="License Expiry Date">
              <input type="date" value={form.licenseExpiry} onChange={e => set('licenseExpiry', e.target.value)}
                className="form-input w-full text-sm" />
            </Field>
          </div>
        </div>

        {/* Branding */}
        <div className="px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-teal-500" />
            Branding (White-Label)
          </h2>
          <p className="text-xs text-muted-foreground/70 mb-4">
            Stored for report headers, PDF exports, and future theming.
          </p>
          <div className="flex items-center gap-10">
            {(['primaryColor', 'secondaryColor'] as const).map(key => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-500 mb-2">
                  {key === 'primaryColor' ? 'Primary' : 'Secondary'} Color
                </label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form[key]} onChange={e => set(key, e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5" />
                  <input type="text" value={form[key]} onChange={e => set(key, e.target.value)}
                    pattern="^#[0-9a-fA-F]{6}$" className="form-input w-28 text-sm font-mono" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between bg-slate-50 rounded-b-xl">
          <p className="text-xs text-muted-foreground/70">
            Changes are scoped to this facility only. Multi-facility environments each configure independently.
          </p>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Saving' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
