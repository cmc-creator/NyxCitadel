'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

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
  ['BIENNIAL', 'Biennial'],
  ['SEMI_ANNUAL', 'Semi-Annual'],
  ['QUARTERLY', 'Quarterly'],
  ['AS_NEEDED', 'As Needed'],
];

const REGULATORY_BODIES = [
  ['JOINT_COMMISSION', 'TJC'],
  ['CMS', 'CMS'],
  ['CARF', 'CARF'],
  ['AZ_ADHS', 'AZ ADHS'],
  ['OSHA', 'OSHA'],
  ['HIPAA', 'HIPAA'],
  ['INTERNAL', 'Internal'],
];

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

interface PolicyEntry {
  file: File;
  title: string;
  category: string;
  regulatoryBodies: string[];
  reviewFrequency: string;
  effectiveDate: string;
  nextReviewDate: string;
  uploadStatus: UploadStatus;
  documentUrl: string;
  uploadError: string;
}

function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function defaultNextReview(freq: string): string {
  const months: Record<string, number> = {
    ANNUAL: 12, BIENNIAL: 24, SEMI_ANNUAL: 6, QUARTERLY: 3, AS_NEEDED: 12,
  };
  const d = new Date();
  d.setMonth(d.getMonth() + (months[freq] ?? 12));
  return d.toISOString().slice(0, 10);
}

const today = new Date().toISOString().slice(0, 10);

export default function BulkUploadPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<PolicyEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ created: number; errors: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter(f =>
      f.type === 'application/pdf' ||
      f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      f.name.endsWith('.pdf') || f.name.endsWith('.docx')
    );
    setEntries(prev => [
      ...prev,
      ...arr.map(f => ({
        file: f,
        title: titleFromFilename(f.name),
        category: 'ADMINISTRATIVE',
        regulatoryBodies: [],
        reviewFrequency: 'ANNUAL',
        effectiveDate: today,
        nextReviewDate: defaultNextReview('ANNUAL'),
        uploadStatus: 'pending' as UploadStatus,
        documentUrl: '',
        uploadError: '',
      })),
    ]);
  }

  function removeEntry(idx: number) {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  }

  function updateField(idx: number, field: keyof PolicyEntry, value: unknown) {
    setEntries(prev => prev.map((e, i) => {
      if (i !== idx) return e;
      const updated = { ...e, [field]: value };
      if (field === 'reviewFrequency' && !updated.nextReviewDate) {
        updated.nextReviewDate = defaultNextReview(value as string);
      }
      if (field === 'effectiveDate' && updated.effectiveDate) {
        updated.nextReviewDate = defaultNextReview(updated.reviewFrequency);
      }
      return updated;
    }));
  }

  function toggleBody(idx: number, body: string) {
    setEntries(prev => prev.map((e, i) => {
      if (i !== idx) return e;
      const has = e.regulatoryBodies.includes(body);
      return { ...e, regulatoryBodies: has ? e.regulatoryBodies.filter(b => b !== body) : [...e.regulatoryBodies, body] };
    }));
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  async function uploadFiles() {
    const toUpload = entries.filter(e => e.uploadStatus === 'pending' && !e.documentUrl);
    if (toUpload.length === 0) return;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.documentUrl || entry.uploadStatus === 'done') continue;

      setEntries(prev => prev.map((e, j) => j === i ? { ...e, uploadStatus: 'uploading' } : e));

      const form = new FormData();
      form.append('file', entry.file);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Upload failed');
        setEntries(prev => prev.map((e, j) => j === i ? { ...e, uploadStatus: 'done', documentUrl: data.url } : e));
      } catch (err) {
        setEntries(prev => prev.map((e, j) => j === i ? { ...e, uploadStatus: 'error', uploadError: String(err) } : e));
      }
    }
  }

  async function saveAll() {
    await uploadFiles();

    setSaving(true);
    try {
      const policies = entries
        .filter(e => e.uploadStatus === 'done' || e.documentUrl)
        .map(e => ({
          title: e.title,
          category: e.category,
          regulatoryBodies: e.regulatoryBodies,
          reviewFrequency: e.reviewFrequency,
          effectiveDate: e.effectiveDate,
          nextReviewDate: e.nextReviewDate,
          documentUrl: e.documentUrl || null,
        }));

      if (policies.length === 0) return;

      const res = await fetch('/api/policies/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policies }),
      });
      const data = await res.json();
      setSaveResult({ created: data.created?.length ?? 0, errors: data.errors?.length ?? 0 });
    } finally {
      setSaving(false);
    }
  }

  const readyCount = entries.filter(e => e.uploadStatus === 'done' || e.uploadStatus === 'pending').length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Upload className="w-6 h-6 text-teal-600" />
            Bulk Policy Upload
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Drop multiple PDF or Word files. Set metadata for each, then save all at once.
          </p>
        </div>
      </div>

      {saveResult ? (
        <div className={`rounded-xl border px-5 py-4 ${saveResult.errors === 0 ? 'bg-emerald-950/20 border-emerald-200' : 'bg-amber-950/20 border-amber-200'}`}>
          <p className={`font-semibold ${saveResult.errors === 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
            {saveResult.created} {saveResult.created === 1 ? 'policy' : 'policies'} created
            {saveResult.errors > 0 ? `, ${saveResult.errors} failed` : ' successfully.'}
          </p>
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => router.push('/trackers/policies')}
              className="text-sm bg-teal-600 text-white px-4 py-1.5 rounded-lg hover:bg-teal-700 transition"
            >
              View Policy List
            </button>
            <button
              onClick={() => { setEntries([]); setSaveResult(null); }}
              className="text-sm bg-card border border-border text-foreground px-4 py-1.5 rounded-lg hover:border-teal-500/50 transition"
            >
              Upload More
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              dragging ? 'border-teal-500 bg-teal-950/10' : 'border-border hover:border-teal-500/50'
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground/60" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Drop PDF or Word files here</p>
              <p className="text-xs text-muted-foreground mt-0.5">or click to browse — up to 50 MB each</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={e => { if (e.target.files) addFiles(e.target.files); }}
            />
          </div>

          {entries.length > 0 && (
            <>
              {/* Entry table */}
              <div className="space-y-3">
                {entries.map((entry, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl px-5 py-4 space-y-3">
                    {/* File header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{entry.file.name}</span>
                        {entry.uploadStatus === 'uploading' && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin flex-shrink-0" />}
                        {entry.uploadStatus === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                        {entry.uploadStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" title={entry.uploadError} />}
                      </div>
                      <button onClick={() => removeEntry(idx)} className="text-muted-foreground/50 hover:text-red-500 transition flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Policy Title</label>
                        <input
                          value={entry.title}
                          onChange={e => updateField(idx, 'title', e.target.value)}
                          className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                        <select
                          value={entry.category}
                          onChange={e => updateField(idx, 'category', e.target.value)}
                          className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-teal-500"
                        >
                          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Review Frequency</label>
                        <select
                          value={entry.reviewFrequency}
                          onChange={e => updateField(idx, 'reviewFrequency', e.target.value)}
                          className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-teal-500"
                        >
                          {REVIEW_FREQUENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Effective Date</label>
                        <input
                          type="date"
                          value={entry.effectiveDate}
                          onChange={e => updateField(idx, 'effectiveDate', e.target.value)}
                          className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Next Review Date</label>
                        <input
                          type="date"
                          value={entry.nextReviewDate}
                          onChange={e => updateField(idx, 'nextReviewDate', e.target.value)}
                          className="w-full text-sm bg-muted/30 border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    {/* Regulatory bodies */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Regulatory Bodies</label>
                      <div className="flex flex-wrap gap-1.5">
                        {REGULATORY_BODIES.map(([v, l]) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => toggleBody(idx, v)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              entry.regulatoryBodies.includes(v)
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-card text-muted-foreground border-border hover:border-teal-500/50'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save bar */}
              <div className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-3">
                <p className="text-sm text-muted-foreground">
                  {readyCount} {readyCount === 1 ? 'policy' : 'policies'} ready to save
                </p>
                <button
                  onClick={saveAll}
                  disabled={saving || entries.length === 0}
                  className="flex items-center gap-2 text-sm bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Saving...' : `Upload & Save ${entries.length} ${entries.length === 1 ? 'Policy' : 'Policies'}`}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
