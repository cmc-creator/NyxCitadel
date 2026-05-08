'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BadgeCheck } from 'lucide-react';

const LICENSE_STATUSES = ['ACTIVE', 'EXPIRED', 'SUSPENDED', 'REVOKED', 'PENDING_RENEWAL'];
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

export default function EditProviderLicensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetch(`/api/credentialing/licenses/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setIsVerified(d.isVerified ?? false);
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
      providerId:    (form.elements.namedItem('providerId') as HTMLInputElement).value,
      licenseType:   (form.elements.namedItem('licenseType') as HTMLInputElement).value,
      licenseNumber: (form.elements.namedItem('licenseNumber') as HTMLInputElement).value,
      state:         (form.elements.namedItem('state') as HTMLSelectElement).value,
      issuedDate:    (form.elements.namedItem('issuedDate') as HTMLInputElement).value || null,
      expiryDate:    (form.elements.namedItem('expiryDate') as HTMLInputElement).value,
      isVerified,
      verifiedDate:  (form.elements.namedItem('verifiedDate') as HTMLInputElement).value || null,
      verifiedBy:    (form.elements.namedItem('verifiedBy') as HTMLInputElement).value || null,
      status:        (form.elements.namedItem('status') as HTMLSelectElement).value,
    };
    const res = await fetch(`/api/credentialing/licenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/credentialing/licenses/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/credentialing/licenses/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BadgeCheck className="w-6 h-6 text-green-600" />
          Edit Provider License
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Medical license, DEA, APRN, or other credential requiring primary source verification.</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">License Details</h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Provider ID *</label>
            <input name="providerId" required className="form-input w-full font-mono text-sm"
              defaultValue={data.providerId ?? ''} placeholder="Provider record ID" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">License Type *</label>
              <input name="licenseType" required className="form-input w-full"
                defaultValue={data.licenseType ?? ''} placeholder="Medical License, DEA, APRN, NPI…" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">License Number *</label>
              <input name="licenseNumber" required className="form-input w-full"
                defaultValue={data.licenseNumber ?? ''} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">State *</label>
              <select name="state" required className="form-input w-full" defaultValue={data.state ?? ''}>
                <option value="">State…</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Issue Date</label>
              <input name="issuedDate" type="date" className="form-input w-full"
                defaultValue={data.issuedDate ? data.issuedDate.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Expiry Date *</label>
              <input name="expiryDate" type="date" required className="form-input w-full"
                defaultValue={data.expiryDate ? data.expiryDate.split('T')[0] : ''} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status *</label>
            <select name="status" required className="form-input w-full" defaultValue={data.status ?? 'ACTIVE'}>
              {LICENSE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Primary Source Verification</h2>
          <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
            <input name="isVerified" type="checkbox" className="rounded"
              checked={isVerified} onChange={e => setIsVerified(e.target.checked)} />
            Primary source verification completed
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Verified Date</label>
              <input name="verifiedDate" type="date" className="form-input w-full"
                defaultValue={data.verifiedDate ? data.verifiedDate.split('T')[0] : ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Verified By</label>
              <input name="verifiedBy" className="form-input w-full"
                defaultValue={data.verifiedBy ?? ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href={`/credentialing/licenses/${id}`} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
