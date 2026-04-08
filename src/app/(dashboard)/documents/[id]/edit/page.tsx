'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  ['POLICY',     'Policy'],
  ['PROCEDURE',  'Procedure'],
  ['FORM',       'Form'],
  ['EM_PLAN',    'Emergency Plan'],
  ['TRAINING',   'Training Material'],
  ['REGULATORY', 'Regulatory Document'],
  ['OTHER',      'Other'],
];

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const get = (n: string) =>
      (form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;

    const payload = {
      name:        get('name'),
      description: get('description') || null,
      category:    get('category'),
      expiryDate:  get('expiryDate') || null,
      tags:        get('tags') ? get('tags').split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    };

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      router.push(`/documents/${id}`);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  if (loading) return <div className="text-muted-foreground/70 p-8">LoadingΓÇª</div>;
  if (!data || data.error) return <div className="text-red-400 p-8">{error || 'Not found.'}</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href={`/documents/${id}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-foreground/80 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Document
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-600" /> Edit Document
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Update document metadata. To replace the file, upload a new document.</p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
      )}

      <form key={data.id} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Document Name <span className="text-red-500">*</span></label>
          <input
            name="name"
            required
            defaultValue={data.name ?? ''}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Category <span className="text-red-500">*</span></label>
          <select
            name="category"
            required
            defaultValue={data.category ?? ''}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">- Select category -</option>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-1">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={data.description ?? ''}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Expiry / Review Date</label>
            <input
              type="date"
              name="expiryDate"
              defaultValue={data.expiryDate?.split('T')[0] ?? ''}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Tags</label>
            <input
              name="tags"
              defaultValue={Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags ?? '')}
              placeholder="policy, infection, 2026 (comma-separated)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {saving ? 'SavingΓÇª' : 'Save Changes'}
          </button>
          <a
            href={`/documents/${id}`}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
