'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Paperclip } from 'lucide-react';

function inferKindFromMimeType(mimeType: string): string {
  if (!mimeType) return 'DOCUMENT';
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType === 'application/pdf') return 'PDF';
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType === 'text/csv'
  ) {
    return 'SPREADSHEET';
  }
  if (
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType === 'text/plain'
  ) {
    return 'DOCUMENT';
  }
  return 'OTHER';
}

const KIND_OPTIONS = [
  ['IMAGE', 'Image'],
  ['VIDEO', 'Video'],
  ['PDF', 'PDF'],
  ['DOCUMENT', 'Document'],
  ['SPREADSHEET', 'Spreadsheet'],
  ['AUDIO', 'Audio'],
  ['LINK', 'Link'],
  ['OTHER', 'Other'],
];

const CATEGORY_OPTIONS = [
  ['', 'No category'],
  ['EVIDENCE', 'Evidence'],
  ['CERTIFICATE', 'Certificate'],
  ['ROSTER', 'Roster'],
  ['PHOTO', 'Photo'],
  ['VIDEO', 'Video'],
  ['FLOOR_PLAN', 'Floor Plan'],
  ['AAR', 'After Action Report'],
  ['TRAINING_MATERIAL', 'Training Material'],
  ['POLICY_EXHIBIT', 'Policy Exhibit'],
  ['REGULATORY_PROOF', 'Regulatory Proof'],
  ['SIGNED_FORM', 'Signed Form'],
  ['SCREENSHOT', 'Screenshot'],
  ['OTHER', 'Other'],
];

export default function AttachmentComposer({
  sourceType,
  sourceId,
  sourceLabel,
  title = 'Add Evidence',
}: {
  sourceType: string;
  sourceId: string;
  sourceLabel?: string;
  title?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const form = event.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

    try {
      let uploadedFileUrl = get('fileUrl');
      let uploadedFileName = get('fileName');
      let uploadedMimeType = get('mimeType') || null;
      let uploadedFileSizeBytes: number | null = null;
      let kind = get('kind');

      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append('file', selectedFile);
        uploadForm.append('path', `attachments/${sourceType}/${sourceId}`);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm,
        });

        if (!uploadResponse.ok) {
          const uploadBody = await uploadResponse.json();
          throw new Error(uploadBody.error ?? 'Failed to upload file.');
        }

        const uploadBody = await uploadResponse.json();
        uploadedFileUrl = uploadBody.url;
        uploadedFileName = uploadBody.name ?? selectedFile.name;
        uploadedMimeType = uploadBody.type ?? selectedFile.type ?? null;
        uploadedFileSizeBytes = Number(uploadBody.size ?? selectedFile.size ?? 0) || null;
        kind = inferKindFromMimeType(uploadedMimeType ?? '');
      }

      if (!uploadedFileUrl || !uploadedFileName) {
        throw new Error('Provide a file upload or a file URL + file name.');
      }

      const payload = {
        title: get('title'),
        description: get('description') || null,
        kind,
        fileName: uploadedFileName,
        fileUrl: uploadedFileUrl,
        mimeType: uploadedMimeType,
        fileSizeBytes: uploadedFileSizeBytes,
        thumbnailUrl: get('thumbnailUrl') || null,
        category: get('category') || null,
        tags: get('tags') ? get('tags').split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        isEvidence: (form.elements.namedItem('isEvidence') as HTMLInputElement).checked,
        isPublic: (form.elements.namedItem('isPublic') as HTMLInputElement).checked,
        capturedAt: get('capturedAt') || null,
        sourceType,
        sourceId,
        sourceLabel: sourceLabel ?? null,
      };

      const response = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? 'Failed to add attachment.');
      }

      form.reset();
      setSelectedFile(null);
      setOpen(false);
      router.refresh();
    } catch (submitError: unknown) {
      setError((submitError as Error).message);
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Upload a file directly, or paste an existing file URL for evidence, screenshots, certificates, or survey documentation.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          {open ? <Paperclip className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {open ? 'Hide Form' : 'Add Attachment'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-950/20 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="attachment-title" className="block text-xs font-medium text-slate-600 mb-1">Title</label>
                <input id="attachment-title" name="title" required className="form-input w-full" placeholder="e.g. Drill photo set" />
            </div>
            <div>
                <label htmlFor="attachment-kind" className="block text-xs font-medium text-slate-600 mb-1">Kind</label>
                <select id="attachment-kind" name="kind" defaultValue="DOCUMENT" className="form-input w-full">
                {KIND_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="attachment-file-upload" className="block text-xs font-medium text-slate-600 mb-1">Upload File</label>
                <input
                  id="attachment-file-upload"
                  name="fileUpload"
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="form-input w-full"
                />
                <p className="text-[11px] text-slate-500 mt-1">If selected, this upload is used instead of File URL/File Name.</p>
            </div>
            <div>
                <label htmlFor="attachment-file-name" className="block text-xs font-medium text-slate-600 mb-1">File Name</label>
                <input id="attachment-file-name" name="fileName" className="form-input w-full" placeholder="drill-aar-2026.pdf" />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="attachment-category" className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select id="attachment-category" name="category" defaultValue="" className="form-input w-full">
                {CATEGORY_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
              <label htmlFor="attachment-file-url" className="block text-xs font-medium text-slate-600 mb-1">File URL</label>
              <input id="attachment-file-url" name="fileUrl" type="url" className="form-input w-full" placeholder="https://..." />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
                <label htmlFor="attachment-thumbnail-url" className="block text-xs font-medium text-slate-600 mb-1">Thumbnail URL</label>
                <input id="attachment-thumbnail-url" name="thumbnailUrl" type="url" className="form-input w-full" placeholder="Optional preview image URL" />
            </div>
            <div>
                <label htmlFor="attachment-mime-type" className="block text-xs font-medium text-slate-600 mb-1">MIME Type</label>
                <input id="attachment-mime-type" name="mimeType" className="form-input w-full" placeholder="application/pdf" />
            </div>
          </div>

          <div>
              <label htmlFor="attachment-description" className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea id="attachment-description" name="description" rows={3} className="form-input w-full" placeholder="What this attachment proves or why it matters." />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="attachment-captured-at" className="block text-xs font-medium text-slate-600 mb-1">Captured Date</label>
                <input id="attachment-captured-at" name="capturedAt" type="date" className="form-input w-full" />
            </div>
            <div>
                <label htmlFor="attachment-tags" className="block text-xs font-medium text-slate-600 mb-1">Tags</label>
                <input id="attachment-tags" name="tags" className="form-input w-full" placeholder="survey, evidence, roster" />
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-600">
            <label className="inline-flex items-center gap-2">
              <input name="isEvidence" type="checkbox" defaultChecked className="rounded border-slate-300" />
              Mark as evidence
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="isPublic" type="checkbox" className="rounded border-slate-300" />
              Publicly shareable
            </label>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-60 transition-colors">
              <Paperclip className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Attachment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}