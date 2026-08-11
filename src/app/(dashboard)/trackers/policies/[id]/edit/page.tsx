'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FileText, ArrowLeft, Upload, X, FileCheck, ExternalLink, Sparkles, Loader2, CheckCircle2, Link2 } from 'lucide-react';
import { JC_STANDARDS } from '@/lib/jc-standards';
import { standardsLibrary } from '@/lib/standards-library';
import { CARF_STANDARDS } from '@/lib/carf-standards';

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

// Flatten standards libraries for crosswalk
const TJC_FLAT = JC_STANDARDS.flatMap(ch =>
  ch.standards.map(s => ({ ref: s.ref, title: s.title, chapter: ch.title }))
);
const CMS_FLAT = standardsLibrary
  .filter(s => s.category === 'CMS')
  .map(s => ({ ref: s.standard, title: s.title, chapter: '' }));
const CARF_FLAT = CARF_STANDARDS.flatMap(sec =>
  sec.standards.map(s => ({ ref: s.ref, title: s.title, chapter: sec.title }))
);

type Framework = 'TJC' | 'CMS' | 'CARF';
const FRAMEWORK_LIBS: Record<Framework, { ref: string; title: string; chapter: string }[]> = {
  TJC: TJC_FLAT,
  CMS: CMS_FLAT,
  CARF: CARF_FLAT,
};

interface Mapping {
  id: string;
  framework: string;
  standardRef: string;
  standardTitle: string | null;
  aiSuggested: boolean;
}

function toDateInput(iso: string | null | undefined) {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export default function EditPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<Record<string, unknown> | null>(null);
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

  // Crosswalk
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [activeFramework, setActiveFramework] = useState<Framework>('TJC');
  const [crosswalkSearch, setCrosswalkSearch] = useState('');
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<{ framework: string; standardRef: string; standardTitle: string }[]>([]);
  const [mappingLoading, setMappingLoading] = useState<string>(''); // standardRef being toggled

  useEffect(() => {
    fetch(`/api/policies/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setSelectedBodies((d.regulatoryBody as string[]) ?? []);
        setDocumentUrl((d.documentUrl as string) ?? '');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load record.');
        setLoading(false);
      });
    fetch(`/api/policies/${id}/standard-mappings`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.mappings)) setMappings(d.mappings); })
      .catch(() => {});
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
        const d = await res.json();
        setDocumentUrl(d.url);
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
    setDocumentUrl((data?.documentUrl as string) ?? '');
  }

  async function toggleMapping(fw: Framework, ref: string, title: string) {
    const key = `${fw}:${ref}`;
    const existing = mappings.find(m => m.framework === fw && m.standardRef === ref);
    setMappingLoading(key);
    try {
      if (existing) {
        await fetch(`/api/policies/${id}/standard-mappings`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mappingId: existing.id }),
        });
        setMappings(prev => prev.filter(m => !(m.framework === fw && m.standardRef === ref)));
      } else {
        const res = await fetch(`/api/policies/${id}/standard-mappings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ framework: fw, standardRef: ref, standardTitle: title, aiSuggested: false }),
        });
        const d = await res.json();
        if (d.mapping) setMappings(prev => [...prev, d.mapping]);
      }
    } finally {
      setMappingLoading('');
    }
  }

  async function confirmSuggestion(s: { framework: string; standardRef: string; standardTitle: string }) {
    const res = await fetch(`/api/policies/${id}/standard-mappings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ framework: s.framework, standardRef: s.standardRef, standardTitle: s.standardTitle, aiSuggested: true }),
    });
    const d = await res.json();
    if (d.mapping) {
      setMappings(prev => [...prev, d.mapping]);
      setSuggestions(prev => prev.filter(x => x.standardRef !== s.standardRef || x.framework !== s.framework));
    }
  }

  async function runAiSuggest() {
    setSuggesting(true);
    setSuggestions([]);
    try {
      const res = await fetch(`/api/policies/${id}/suggest-mappings`, { method: 'POST' });
      const d = await res.json();
      const alreadyMapped = new Set(mappings.map(m => `${m.framework}:${m.standardRef}`));
      setSuggestions((d.suggestions ?? []).filter(
        (s: { framework: string; standardRef: string }) => !alreadyMapped.has(`${s.framework}:${s.standardRef}`)
      ));
    } finally {
      setSuggesting(false);
    }
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
      setError((body as { error?: string }).error ?? 'Failed to save policy.');
      setSaving(false);
    }
  }

  const libStandards = FRAMEWORK_LIBS[activeFramework];
  const searchLower = crosswalkSearch.toLowerCase();
  const filteredStandards = crosswalkSearch
    ? libStandards.filter(s => s.ref.toLowerCase().includes(searchLower) || s.title.toLowerCase().includes(searchLower))
    : libStandards;

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
        <p className="text-xs text-muted-foreground/70 mt-1 font-mono">{data.policyNumber as string}</p>
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
            <input name="title" required defaultValue={data.title as string} className="form-input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Policy #</label>
              <input name="policyNumber" defaultValue={data.policyNumber as string} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Version</label>
              <input name="version" defaultValue={data.version as string} className="form-input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Category *</label>
              <select name="category" required defaultValue={data.category as string} className="form-input w-full">
                {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select name="status" defaultValue={data.status as string} className="form-input w-full">
                <option value="DRAFT">Draft</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Owner / Responsible Department</label>
            <input name="owner" defaultValue={(data.owner as string) ?? ''} className="form-input w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Primary Standard / Regulatory Reference</label>
            <input name="standardRef" defaultValue={(data.standardRef as string) ?? ''} className="form-input w-full" />
          </div>
        </div>

        {/* Dates */}
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Review Schedule</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Review Frequency</label>
            <select name="reviewFrequency" defaultValue={data.reviewFrequency as string} className="form-input w-full">
              {REVIEW_FREQUENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Effective Date *</label>
              <input type="date" name="effectiveDate" required defaultValue={toDateInput(data.effectiveDate as string)} className="form-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Next Review Date *</label>
              <input type="date" name="nextReviewDate" required defaultValue={toDateInput(data.nextReviewDate as string)} className="form-input w-full" />
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
              <span className="text-xs text-muted-foreground/70 mt-0.5">Max 50 MB</span>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileSelect} />
            </label>
          )}
        </div>

        {/* Description */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Summary / Description <span className="font-normal text-muted-foreground/70">(optional)</span></h2>
          <textarea name="description" rows={3} defaultValue={(data.summary as string) ?? ''} className="form-input w-full resize-none" />
        </div>

        {/* Version change note */}
        <div className="px-6 py-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Change Note <span className="font-normal text-muted-foreground/70">(optional - leave blank to save without creating a new version)</span>
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

      {/* ── Standard Crosswalk ──────────────────────────────────────────────── */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Link2 className="w-4 h-4 text-teal-600" />
                Standard Crosswalk
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Map this policy to specific TJC, CMS, or CARF standards. Saved automatically.</p>
            </div>
            <button
              onClick={runAiSuggest}
              disabled={suggesting}
              className="flex items-center gap-1.5 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
            >
              {suggesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {suggesting ? 'Analyzing...' : 'AI Suggest'}
            </button>
          </div>

          {/* Existing mappings pills */}
          {mappings.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {mappings.map(m => (
                <span
                  key={m.id}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
                    m.aiSuggested
                      ? 'bg-amber-950/20 border-amber-300 text-amber-600'
                      : 'bg-teal-950/20 border-teal-300 text-teal-600'
                  }`}
                >
                  <span className="font-medium">{m.framework}</span>
                  <span className="text-muted-foreground">·</span>
                  {m.standardRef}
                  <button
                    onClick={() => toggleMapping(m.framework as Framework, m.standardRef, m.standardTitle ?? '')}
                    className="ml-1 text-current/60 hover:text-red-500 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* AI suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4 bg-amber-950/10 border border-amber-200 rounded-lg px-4 py-3 space-y-2">
              <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                AI suggested {suggestions.length} standard{suggestions.length !== 1 ? 's' : ''} - click to confirm
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map(s => (
                  <button
                    key={`${s.framework}:${s.standardRef}`}
                    onClick={() => confirmSuggestion(s)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-amber-300 bg-amber-100/30 text-amber-700 hover:bg-amber-100 transition"
                    title={s.standardTitle}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="font-medium">{s.framework}</span>
                    <span className="text-amber-500/70">·</span>
                    {s.standardRef}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Framework tabs + search */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex gap-1">
            {(['TJC', 'CMS', 'CARF'] as Framework[]).map(fw => (
              <button
                key={fw}
                onClick={() => { setActiveFramework(fw); setCrosswalkSearch(''); }}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  activeFramework === fw
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-card text-muted-foreground border-border hover:border-teal-500/50'
                }`}
              >
                {fw === 'TJC' ? 'The Joint Commission' : fw === 'CMS' ? 'CMS (42 CFR)' : 'CARF'}
              </button>
            ))}
          </div>
          <input
            value={crosswalkSearch}
            onChange={e => setCrosswalkSearch(e.target.value)}
            placeholder={`Search ${activeFramework} standards...`}
            className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Standards list */}
        <div className="max-h-72 overflow-y-auto divide-y divide-border/20">
          {filteredStandards.slice(0, 100).map(std => {
            const isMapped = mappings.some(m => m.framework === activeFramework && m.standardRef === std.ref);
            const isLoading = mappingLoading === `${activeFramework}:${std.ref}`;
            return (
              <div
                key={std.ref}
                className={`flex items-center gap-3 px-6 py-2.5 hover:bg-muted/20 transition-colors ${isMapped ? 'bg-teal-950/10' : ''}`}
              >
                <button
                  onClick={() => toggleMapping(activeFramework, std.ref, std.title)}
                  disabled={isLoading}
                  className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    isMapped
                      ? 'bg-teal-600 border-teal-600'
                      : 'border-border hover:border-teal-500'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-2.5 h-2.5 text-teal-600 animate-spin" />
                  ) : isMapped ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : null}
                </button>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-mono font-semibold text-teal-600 mr-2">{std.ref}</span>
                  <span className="text-xs text-foreground">{std.title}</span>
                  {std.chapter && <span className="text-xs text-muted-foreground/50 ml-1">- {std.chapter}</span>}
                </div>
              </div>
            );
          })}
          {filteredStandards.length === 0 && (
            <p className="px-6 py-4 text-xs text-muted-foreground/60">No standards match your search.</p>
          )}
          {filteredStandards.length > 100 && (
            <p className="px-6 py-3 text-xs text-muted-foreground/50">Showing first 100 results - use search to filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
