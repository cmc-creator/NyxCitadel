'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Upload } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  ['POLICY',     'Policy'],
  ['PROCEDURE',  'Procedure'],
  ['FORM',       'Form'],
  ['EM_PLAN',    'Emergency Plan'],
  ['TRAINING',   'Training Material'],
  ['REGULATORY', 'Regulatory Document'],
  ['OTHER',      'Other'],
];

export default function DocumentUploadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const get = (n: string) =>
      (form.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;

    // In a real implementation this would upload a file to object storage
    // and return a URL. For now we accept a direct URL.
    const data = {
      name:        get('name'),
      description: get('description') || null,
      category:    get('category'),
      fileUrl:     get('fileUrl'),
      expiryDate:  get('expiryDate') || null,
      tags:        get('tags') ? get('tags').split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    if (!data.fileUrl) {
      setError('Document URL is required.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      router.push('/documents');
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/documents" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Documents
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-6 h-6 text-purple-600" /> Add Document
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Register a document in the library by providing its URL and metadata.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document Name <span className="text-red-500">*</span></label>
          <input name="name" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Infection Control Policy v3.0" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
          <select name="category" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">— Select category —</option>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document URL <span className="text-red-500">*</span></label>
          <input type="url" name="fileUrl" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://sharepoint.com/... or storage URL" />
          <p className="text-xs text-slate-400 mt-1">Link to where the document is stored (SharePoint, OneDrive, Google Drive, etc.)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea name="description" rows={2} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Brief description of this document…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry / Review Date</label>
            <input type="date" name="expiryDate" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
            <input name="tags" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="policy, infection, 2026 (comma-separated)" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
            {saving ? 'Saving…' : 'Add Document'}
          </button>
          <Link href="/documents" className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Cancel
          </Link>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <strong>Tip:</strong> Store actual document files in SharePoint, OneDrive, or Google Drive and paste the sharing link here.
            For best results use direct-access links that don&apos;t require additional authentication.
          </div>
        </div>
      </div>
    </div>
  );
}
