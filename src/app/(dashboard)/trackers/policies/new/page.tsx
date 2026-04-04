'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Upload, X, FileCheck } from 'lucide-react';

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

const REVIEW_MONTHS: Record<string, number> = {
  ANNUAL: 12, BIENNIAL: 24, SEMI_ANNUAL: 6, QUARTERLY: 3, AS_NEEDED: 12,
};

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

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function NewPolicyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedBodies, setSelectedBodies] = useState<string[]>([]);
  const [reviewFreq, setReviewFreq] = useState('ANNUAL');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [nextReviewDate, setNextReviewDate] = useState('');

  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleBody(v: string) {
    setSelectedBodies(prev => prev.includes(v) ? prev.filter(b => b !== v) : [...prev, v]);
  }

  function handleEffectiveDateChange(val: string) {
    setEffectiveDate(val);
    if (val && !nextReviewDate) {
      const months = REVIEW_MONTHS[reviewFreq] ?? 12;
      setNextReviewDate(toDateInput(addMonths(new Date(val), months)));
    }
  }

  function handleFreqChange(val: string) {
    setReviewFreq(val);
    if (effectiveDate) {
      const months = REVIEW_MONTHS[val] ?? 12;
      setNextReviewDate(toDateInput(addMonths(new Date(effectiveDate), months)));
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError('');
    setUploadedUrl('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setUploadedUrl(data.url);
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
    setUploadedUrl('');
    setUploadError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value ?? '';

    const data = {
      title:            get('title'),
      policyNumber:     get('policyNumber') || undefined,
      category:         get('category'),
      version:          get('version') || '1.0',
      effectiveDate,
      nextReviewDate,
      reviewFrequency:  reviewFreq,
      owner:            get('owner') || null,
      standardRef:      get('standardRef') || null,
      description:      get('description') || null,
      documentUrl:      uploadedUrl || null,
      regulatoryBodies: selectedBodies,
      status:           get('status') || 'ACTIVE',
    };

    const res = await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
        <a href="/trackers/policies" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Policy Tracker
        </a>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-600" />
          Add Policy / Procedure
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track facility policies with automated review date reminders and document storage.
        </p>
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
            <input name="title" required className="form-input w-full" placeholder="e.g., Patient Rights and Responsibilities Policy" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Policy # <span className="font-normal text-muted-foreground/70">(auto-generated if blank)</span></label>
              <input name="policyNumber" className="form-input w-full" placeholder="e.g., PR-001" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Version</label>
              <input name="version" defaultValue="1.0" className="form-input w-full" placeholder="1.0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required className="form-input w-full">
                <option value="">Select category...</option>
                {CATEGORIES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue="ACTIVE" className="form-input w-full">
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Owner / Responsible Department</label>
            <input name="owner" className="form-input w-full" placeholder="e.g., Director of Nursing, Risk Management" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Standard / Regulatory Reference</label>
            <input name="standardRef" className="form-input w-full" placeholder="e.g., 42 CFR 482.13, RI.01.01.01" />
          </div>
        </div>

        {/* Dates */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Review Schedule</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Review Frequency</label>
            <select
              name="reviewFrequency"
              value={reviewFreq}
              onChange={e => handleFreqChange(e.target.value)}
              className="form-input w-full"
            >
              {REVIEW_FREQUENCIES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Effective Date *</label>
              <input
                type="date"
                name="effectiveDate"
                required
                value={effectiveDate}
                onChange={e => handleEffectiveDateChange(e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Review Date *</label>
              <input
                type="date"
                name="nextReviewDate"
                required
                value={nextReviewDate}
                onChange={e => setNextReviewDate(e.target.value)}
                className="form-input w-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70">Next review date is auto-calculated when you set the effective date.</p>
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
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedBodies.includes(v) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}
              >
                {REG_LABELS[v] ?? v}
              </button>
            ))}
          </div>
        </div>

        {/* Document Upload */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Policy Document <span className="font-normal text-muted-foreground/70">(optional - PDF or Word)</span>
          </h2>
          {!uploadFile && !uploadedUrl ? (
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-teal-300 hover:bg-teal-950/20 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground/70 mb-1.5" />
              <span className="text-sm text-slate-500">Click to upload PDF or Word document</span>
              <span className="text-xs text-muted-foreground/70 mt-0.5">Max 20 MB</span>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
            </label>
          ) : (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <FileCheck className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">{uploadFile?.name ?? 'Document uploaded'}</p>
                {uploading && <p className="text-xs text-slate-500">Uploading...</p>}
                {uploadedUrl && <p className="text-xs text-green-600">Uploaded successfully</p>}
                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
              </div>
              <button type="button" onClick={clearFile} className="p-1 rounded text-muted-foreground/70 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {uploadError && !uploadFile && (
            <p className="text-xs text-red-600">{uploadError}</p>
          )}
        </div>

        {/* Description */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Summary / Description <span className="font-normal text-muted-foreground/70">(optional)</span></h2>
          <textarea name="description" rows={3} className="form-input w-full resize-none" placeholder="Brief summary of policy purpose and scope..." />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3">
          <a href="/trackers/policies" className="btn-secondary text-sm">Cancel</a>
          <button type="submit" disabled={saving || uploading} className="btn-primary text-sm">
            {saving ? 'Saving...' : 'Add Policy'}
          </button>
        </div>
      </form>
    </div>
  );
}