'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, ArrowLeft, Upload, X, FileCheck, ExternalLink } from 'lucide-react';

const CATEGORIES = [
  ['ADMINISTRATIVE', 'Administrative'],
  ['CLINICAL', 'Clinical'],
  ['EMERGENCY_MANAGEMENT', 'Emergency Management'],
  ['ENVIRONMENT_OF_CARE', 'Environment of Care'],
  ['HUMAN_RESOURCES', 'Human Resources'],
  ['INFECTION_CONTROL', 'Infection Control'],
  ['INFORMATION_MANAGEMENT', 'Information Management'],
  ['LEADERSHIP', 'Leadership'],
  ['LIFE_SAFETY', 'Life Safety'],
  ['MEDICATION_MANAGEMENT', 'Medication Management'],
  ['PATIENT_RIGHTS', 'Patient Rights'],
  ['PERFORMANCE_IMPROVEMENT', 'Performance Improvement'],
  ['PRIVACY_SECURITY', 'Privacy & Security'],
  ['OTHER', 'Other'],
];

const REVIEW_FREQUENCIES = [
  ['ANNUAL', 'Annual'],
  ['BIENNIAL', 'Biennial (every 2 years)'],
  ['SEMI_ANNUAL', 'Semi-Annual'],
  ['QUARTERLY', 'Quarterly'],
  ['AS_NEEDED', 'As Needed'],
];

const REGULATORY_BODIES = [
  'JOINT_COMMISSION', 'CMS', 'AZ_ADHS', 'AZ_BON', 'AZ_BPPE',
  'DEA', 'OSHA', 'HIPAA', 'SAMHSA', 'INTERNAL', 'OTHER',
];

const REG_LABELS: Record<string, string> = {
  JOINT_COMMISSION: 'The Joint Commission',
  CMS: 'CMS', AZ_ADHS: 'AZ ADHS', AZ_BON: 'AZ Board of Nursing',
  AZ_BPPE: 'AZ Board of Pharmacy', DEA: 'DEA', OSHA: 'OSHA',
  HIPAA: 'HIPAA', SAMHSA: 'SAMHSA', INTERNAL: 'Internal', OTHER: 'Other',
};

function toDateInput(iso: string | null | undefined) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export default function EditPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedBodies, setSelectedBodies] = useState<string[]>([]);

  // File upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/policies/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setSelectedBodies(d.regulatoryBody ?? []);
        setDocumentUrl(d.documentUrl ?? '');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
  }, [id]);

  function toggleBody(v: string) {
    setSelectedBodies(prev => prev.includes(v) ? prev.filter(b => b !== v) : [...prev, v]);
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setDocumentUrl(data.url);
      } else {
        const err = await res.json();
        setUploadError(err.error ?? 'Upload failed.');
        setUploadFile(null);
      }
    } catch {
      setUploadError('Upload failed. Please try again.');
      setUploadFile(null);
    } finally {
      setUploading(false);
    }
  }

  function clearFile() {
    setUploadFile(null);
    setUploadError('');
    if (fileRef.current) fileRef.current.value = '';
    // Restore original URL if removing newly uploaded file
    setDocumentUrl(data?.documentUrl ?? '');
  }

  if (loading) return <div className="text-muted-foreground/70 p-8">Loading...</div>;
  if (!data) return <div className="text-red-400 p-8">{error || 'Record not found.'}</div>;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value ?? '';

    const payload = {
      title:            get('title'),
      policyNumber:     get('policyNumber'),
      category:         get('category'),
      version:          get('version') || '1.0',
      effectiveDate:    get('effectiveDate'),
      nextReviewDate:   get('nextReviewDate'),
      reviewFrequency:  get('reviewFrequency'),
      owner:            get('owner') || null,
      standardRef:      get('standardRef') || null,
      summary:          get('description') || null,
      documentUrl:      documentUrl || null,
      status:           get('status'),
      regulatoryBodies: selectedBodies,
      changeNote:       get('changeNote') || null,
    };

    const res = await fetch(`/api/policies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push('/trackers/policies');
      router.refresh();
    } else {
      const body = await res.json();
      setError(body.error ?? 'Failed to save policy.');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/trackers/policies" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-purple-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Policy Tracker
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Edit Policy / Procedure
        </h1>
        <p className="text-xs text-muted-foreground/70 mt-1 font-mono">{data.policyNumber}</p>
      </div>

      {error && (
        <div className="bg-red-950/20 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border divide-y divide-border/30">
        {/* Core Info */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Policy Information</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Policy Title *</label>
            <input name="title" required defaultValue={data.title} className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Policy #</label>
              <input name="policyNumber" defaultValue={data.policyNumber} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Version</label>
              <input name="version" defaultValue={data.version} className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required defaultValue={data.category} className="form-input w-full">
                {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue={data.status} className="form-input w-full">
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Owner / Responsible Department</label>
            <input name="owner" defaultValue={data.owner ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Standard / Regulatory Reference</label>
            <input name="standardRef" defaultValue={data.standardRef ?? ''} className="form-input w-full" />
          </div>
        </div>

        {/* Dates */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Review Schedule</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Review Frequency</label>
            <select name="reviewFrequency" defaultValue={data.reviewFrequency} className="form-input w-full">
              {REVIEW_FREQUENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Effective Date *</label>
              <input type="date" name="effectiveDate" required defaultValue={toDateInput(data.effectiveDate)} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Review Date *</label>
              <input type="date" name="nextReviewDate" required defaultValue={toDateInput(data.nextReviewDate)} className="form-input w-full" />
            </div>
          </div>
        </div>

        {/* Regulatory Bodies */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Applicable Regulatory Bodies</h2>
          <div className="flex flex-wrap gap-2">
            {REGULATORY_BODIES.map(v => (
              <button
                key={v}
                type="button"
                onClick={() => toggleBody(v)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedBodies.includes(v)
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                }`}
              >
                {REG_LABELS[v] ?? v}
              </button>
            ))}
          </div>
        </div>

        {/* Document Upload */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Policy Document <span className="font-normal text-muted-foreground/70">(PDF or Word)</span>
          </h2>
          {documentUrl && !uploadFile ? (
            <div className="flex items-center gap-3 bg-blue-950/20 border border-blue-200 rounded-lg px-4 py-3">
              <FileCheck className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-800">Document attached</p>
                <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> View document
                </a>
              </div>
              <label className="text-xs text-slate-500 hover:text-purple-600 cursor-pointer underline">
                Replace
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
          ) : uploadFile ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <FileCheck className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{uploadFile.name}</p>
                {uploading && <p className="text-xs text-slate-500">Uploading...</p>}
                {!uploading && documentUrl && <p className="text-xs text-green-600">Uploaded successfully</p>}
                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
              </div>
              <button type="button" onClick={clearFile} className="p-1 rounded text-muted-foreground/70 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground/70 mb-1.5" />
              <span className="text-sm text-slate-500">Click to upload PDF or Word document</span>
              <span className="text-xs text-muted-foreground/70 mt-0.5">Max 20 MB</span>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
            </label>
          )}
        </div>

        {/* Description */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Summary / Description <span className="font-normal text-muted-foreground/70">(optional)</span></h2>
          <textarea name="description" rows={3} defaultValue={data.summary ?? ''} className="form-input w-full resize-none" />
        </div>

        {/* Version change note */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Change Note <span className="font-normal text-muted-foreground/70">(optional &mdash; leave blank to save without creating a new version)</span>
          </h2>
          <textarea name="changeNote" rows={2} placeholder="Briefly describe what changed (e.g. Updated restraint criteria per CMS update)" className="form-input w-full resize-none" />
          <p className="text-xs text-muted-foreground/70">If provided, the policy version will be incremented and this note will appear in the Revision History on the detail page.</p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/policies" className="btn-secondary text-sm">Cancel</a>
          <button type="submit" disabled={saving || uploading} className="btn-primary text-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}