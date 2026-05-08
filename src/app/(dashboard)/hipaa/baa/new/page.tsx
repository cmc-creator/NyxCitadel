'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileCheck2 } from 'lucide-react';

export default function NewBaaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const data = {
      vendorName:        (form.elements.namedItem('vendorName') as HTMLInputElement).value,
      vendorContact:     (form.elements.namedItem('vendorContact') as HTMLInputElement).value || null,
      vendorEmail:       (form.elements.namedItem('vendorEmail') as HTMLInputElement).value || null,
      serviceDescription:(form.elements.namedItem('serviceDescription') as HTMLTextAreaElement).value,
      agreementDate:     (form.elements.namedItem('agreementDate') as HTMLInputElement).value,
      expiryDate:        (form.elements.namedItem('expiryDate') as HTMLInputElement).value || null,
      autoRenew:         (form.elements.namedItem('autoRenew') as HTMLInputElement).checked,
      documentUrl:       (form.elements.namedItem('documentUrl') as HTMLInputElement).value || null,
      phoneHipaaVerified:(form.elements.namedItem('phoneHipaaVerified') as HTMLInputElement).checked,
      notes:             (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    const res = await fetch('/api/hipaa/baa', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });

    if (res.ok) { router.push('/hipaa/baa'); router.refresh(); }
    else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save BAA.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/hipaa/baa" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to BAA Tracker
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-blue-500" />
          Add Business Associate Agreement
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Required for all vendors with access to PHI (45 CFR §164.308).</p>
      </div>

      {error && <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Vendor Information</h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Vendor / Associate Name *</label>
            <input name="vendorName" required className="form-input w-full" placeholder="e.g. Epic Systems, LabCorp, Transcription Co." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Name</label>
              <input name="vendorContact" className="form-input w-full" placeholder="Primary contact" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Contact Email</label>
              <input name="vendorEmail" type="email" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Services Providing Access to PHI *</label>
            <textarea name="serviceDescription" required rows={3} className="form-input w-full" placeholder="Describe the services and how PHI is accessed or handled…" />
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Agreement Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Agreement Date *</label>
              <input name="agreementDate" type="date" required className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Expiry Date</label>
              <input name="expiryDate" type="date" className="form-input w-full" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Document URL / File Link</label>
            <input name="documentUrl" type="url" className="form-input w-full" placeholder="https://…" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input name="autoRenew" type="checkbox" className="rounded" />
              Auto-Renews
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground/80 cursor-pointer">
              <input name="phoneHipaaVerified" type="checkbox" className="rounded" />
              HIPAA Training / Verification Confirmed
            </label>
          </div>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
          <textarea name="notes" rows={3} className="form-input w-full" />
        </div>

        <div className="px-6 py-4 flex justify-end gap-3">
          <a href="/hipaa/baa" className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted/20">Cancel</a>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Add BAA'}
          </button>
        </div>
      </form>
    </div>
  );
}
