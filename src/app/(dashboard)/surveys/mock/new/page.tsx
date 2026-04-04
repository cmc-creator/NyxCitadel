'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClipboardCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { CHAPTER_CODES, CHAPTER_LABELS } from '@/lib/jc-standards';

const SURVEY_TYPES = [
  { value: 'JC_FULL',             label: 'JC Full Survey (CAMH)' },
  { value: 'JC_FOCUSED',          label: 'JC Focused Survey' },
  { value: 'JC_DISEASE_SPECIFIC', label: 'JC Disease-Specific Care' },
  { value: 'CMS_CONDITION_LEVEL', label: 'CMS Condition Level Survey' },
  { value: 'ADHS_LICENSING',      label: 'ADHS Licensing Inspection' },
  { value: 'INTERNAL_AUDIT',      label: 'Internal Audit' },
];

export default function NewMockSurveyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const [title, setTitle]                 = useState('');
  const [surveyType, setSurveyType]       = useState('JC_FULL');
  const [surveyorName, setSurveyorName]   = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [chaptersScoped, setChaptersScoped] = useState<string[]>(['NPSG', 'EC', 'IC', 'MM', 'PC', 'RI', 'RC', 'LD', 'PI']);
  const [summaryNotes, setSummaryNotes]   = useState('');

  function toggleChapter(code: string) {
    setChaptersScoped(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  }

  function selectAll() { setChaptersScoped([...CHAPTER_CODES]); }
  function clearAll()  { setChaptersScoped([]); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (chaptersScoped.length === 0) {
      setError('Select at least one chapter to scope.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/mock-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, surveyType, surveyorName, scheduledDate, chaptersScoped, summaryNotes }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to create survey');
      }
      const survey = await res.json();
      router.push(`/surveys/mock/${survey.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/surveys/mock" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-foreground mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Mock Surveys
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-teal-400" />
          New Mock Survey
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure the survey scope then begin scoring EPs chapter by chapter.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Survey Info</h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Title <span className="text-red-400">*</span></label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q2 2026 Mock JC Survey"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Survey Type <span className="text-red-400">*</span></label>
              <select
                value={surveyType}
                onChange={e => setSurveyType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {SURVEY_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Scheduled Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Lead Surveyor (optional)</label>
            <input
              type="text"
              value={surveyorName}
              onChange={e => setSurveyorName(e.target.value)}
              placeholder="Name or role"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Initial Notes (optional)</label>
            <textarea
              value={summaryNotes}
              onChange={e => setSummaryNotes(e.target.value)}
              rows={3}
              placeholder="Scope rationale, focus areas, prior deficiencies to watch..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>

        {/* Chapter scope */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Chapters to Scope <span className="text-red-400">*</span>
            </h2>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={selectAll} className="text-teal-400 hover:text-teal-300">All</button>
              <span className="text-slate-600">|</span>
              <button type="button" onClick={clearAll} className="text-slate-400 hover:text-slate-300">Clear</button>
            </div>
          </div>
          <p className="text-xs text-slate-500">Select the JC CAMH chapters you want to score in this survey session.</p>
          <div className="grid grid-cols-2 gap-2">
            {CHAPTER_CODES.map(code => (
              <label
                key={code}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                  chaptersScoped.includes(code)
                    ? 'border-teal-600 bg-teal-950/40 text-teal-300'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={chaptersScoped.includes(code)}
                  onChange={() => toggleChapter(code)}
                />
                <span className="font-semibold w-10">{code}</span>
                <span className="text-xs opacity-70">{CHAPTER_LABELS[code]?.split(' ')[0]}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500">{chaptersScoped.length} chapter{chaptersScoped.length !== 1 ? 's' : ''} selected</p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 rounded-lg p-3 text-sm text-red-300">{error}</div>
        )}

        <div className="flex justify-end gap-3">
          <Link href="/surveys/mock" className="px-4 py-2 text-sm text-slate-400 hover:text-foreground border border-border rounded-lg transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create &amp; Open Tracer
          </button>
        </div>
      </form>
    </div>
  );
}
