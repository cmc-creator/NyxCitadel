'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { DeleteButton } from '@/components/ui/DeleteButton';

const DOC_TYPES = [
  'MEDICAL_STAFF_BYLAWS', 'BOARD_BYLAWS', 'RULES_REGULATIONS',
  'CREDENTIALING_CRITERIA', 'PRIVILEGE_DELINEATION', 'CONFLICT_OF_INTEREST',
  'DELEGATION_AUTHORITY', 'RESOLUTION', 'SELF_ASSESSMENT',
];
const DOC_STATUSES = ['ACTIVE', 'UNDER_REVIEW', 'SUPERSEDED', 'ARCHIVED'];

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function EditGovernanceDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/governance/documents/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
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
      docType:       (form.elements.namedItem('docType') as HTMLSelectElement).value,
      title:         (form.elements.namedItem('title') as HTMLInputElement).value,
      version:       (form.elements.namedItem('version') as HTMLInputElement).value || null,
      effectiveDate: (form.elements.namedItem('effectiveDate') as HTMLInputElement).value,
      reviewDate:    (form.elements.namedItem('reviewDate') as HTMLInputElement).value || null,
      approvedBy:    (form.elements.namedItem('approvedBy') as HTMLInputElement).value || null,
      status:        (form.elements.namedItem('status') as HTMLSelectElement).value,
      documentUrl:   (form.elements.namedItem('documentUrl') as HTMLInputElement).value || null,
      notes:         (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };
    const res = await fetch(`/api/governance/documents/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push(`/governance/documents/${id}`); router.refresh(); }
    else { const b = await res.json(); setError(b.error ?? 'Failed to update.'); setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/governance/documents/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Record
        </a>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Edit Governance Document
        </h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <form key={data.id} onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Document Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Document Type *</label>
              <select name="docType" required className="form-input w-full" defaultValue={data.docType ?? ''}>
                <option value="">Select type…</option>
                {DOC_TYPES.map(t => <option key={t} value={t}>{formatLabel(t)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status *</label>
              <select name="status" required className="form-input w-full" defaultValue={data.status ?? 'ACTIVE'}>
                {DOC_STATUSES.map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input name="title" type="text" required className="form-input w-full" defaultValue={data.title ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Version</label>
              <input name="version" type="text" className="form-input w-full" defaultValue={data.version ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Approved By</label>
              <input name="approvedBy" type="text" className="form-input w-full" defaultValue={data.approvedBy ?? ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Effective Date *</label>
              <input name="effectiveDate" type="date" required className="form-input w-full" defaultValue={data.effectiveDate?.split('T')[0] ?? ''} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Review Date</label>
              <input name="reviewDate" type="date" className="form-input w-full" defaultValue={data.reviewDate?.split('T')[0] ?? ''} />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Document URL</label>
            <input name="documentUrl" type="url" className="form-input w-full" defaultValue={data.documentUrl ?? ''} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea name="notes" rows={2} className="form-input w-full" defaultValue={data.notes ?? ''} />
          </div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-3">
          <DeleteButton
            apiPath={`/api/governance/documents/${id}`}
            redirectPath="/governance/documents"
            label="governance document"
          />
          <div className="flex gap-3">
            <a href={`/governance/documents/${id}`} className="px-4 py-2 text-sm text-slate-600">Cancel</a>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
