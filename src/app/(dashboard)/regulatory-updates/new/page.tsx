'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Newspaper, Loader2, Send, X } from 'lucide-react';

const REGULATORY_BODIES = [
  'Joint Commission',
  'CMS (Centers for Medicare & Medicaid Services)',
  'AZ ADHS',
  'OSHA',
  'DEA',
  'CDC / NHSN',
  'OCR / HHS (HIPAA)',
  'State BON',
  'State BOMEX',
  'Other',
];

const URGENCY_OPTIONS = [
  { value: 'CRITICAL',      label: '🚨 Critical - Immediate action required',     desc: 'Regulatory mandate enforcement, immediate threat to compliance' },
  { value: 'HIGH',          label: '⚠️ High Priority - Review within 7 days',    desc: 'Change affects current practice or survey readiness' },
  { value: 'MEDIUM',        label: 'ℹ️ Medium - Review within 30 days',          desc: 'Guidance update, clarification, or upcoming deadline' },
  { value: 'INFORMATIONAL', label: '📋 Informational - Awareness only',           desc: 'New resource, best practice revision, no immediate action' },
];

const AFFECTED_AREA_OPTIONS = [
  'Policies & Procedures', 'Training & Competency', 'Environment of Care',
  'Infection Control', 'Emergency Management', 'Patient Rights',
  'Restraint & Seclusion', 'Credentialing', 'HIPAA / Privacy',
  'Pharmacy / Meds', 'Quality / QAPI', 'Risk & Incidents',
  'Governance', 'Discharge Planning', 'Workforce Health',
];

export default function NewRegulatoryUpdatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm] = useState({
    title:          '',
    summary:        '',
    body:           '',
    urgency:        'INFORMATIONAL',
    regulatoryBody: '',
    standardRef:    '',
    effectiveDate:  '',
    sourceUrl:      '',
    actionRequired: '',
  });
  const [affectedAreas, setAffectedAreas] = useState<string[]>([]);

  function toggleArea(area: string) {
    setAffectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  }

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.summary.trim() || !form.regulatoryBody) {
      setError('Title, summary, and regulatory body are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/regulatory-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, affectedAreas }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to publish update.');
        return;
      }
      const update = await res.json();
      router.push(`/regulatory-updates/${update.id}`);
    } catch {
      setError('Network error - please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/regulatory-updates" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-teal-400" />
          Publish Regulatory Update
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Publishing will immediately notify all users in-app. Use urgency carefully.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Urgency */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Urgency Level <span className="text-red-400">*</span>
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            {URGENCY_OPTIONS.map(opt => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  form.urgency === opt.value
                    ? 'border-teal-500/60 bg-teal-500/10'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <input
                  type="radio"
                  name="urgency"
                  value={opt.value}
                  checked={form.urgency === opt.value}
                  onChange={e => set('urgency', e.target.value)}
                  className="mt-0.5 accent-teal-500"
                />
                <div>
                  <p className="text-xs font-semibold text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Regulatory Body */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Regulatory Body <span className="text-red-400">*</span>
          </label>
          <select
            value={form.regulatoryBody}
            onChange={e => set('regulatoryBody', e.target.value)}
            required
            className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 transition"
          >
            <option value="">Select body…</option>
            {REGULATORY_BODIES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
            placeholder="e.g. CMS Updated Discharge Planning Requirements - Effective July 2026"
            className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 transition"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Summary <span className="text-red-400">*</span>
          </label>
          <textarea
            value={form.summary}
            onChange={e => set('summary', e.target.value)}
            required
            rows={3}
            placeholder="1-3 sentence plain-language summary of what changed and what staff need to know."
            className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 transition resize-none"
          />
        </div>

        {/* Detail body */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Full Detail <span className="text-muted-foreground font-normal normal-case">(optional)</span>
          </label>
          <textarea
            value={form.body}
            onChange={e => set('body', e.target.value)}
            rows={6}
            placeholder="Detailed explanation, action items, affected departments, policy change requirements, etc."
            className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 transition resize-y"
          />
        </div>

        {/* Standard Ref + Effective Date */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Standard Reference
            </label>
            <input
              type="text"
              value={form.standardRef}
              onChange={e => set('standardRef', e.target.value)}
              placeholder="e.g. 42 CFR 482.43(a)"
              className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Effective Date
            </label>
            <input
              type="date"
              value={form.effectiveDate}
              onChange={e => set('effectiveDate', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 transition"
            />
          </div>
        </div>

        {/* Source URL */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Official Source URL
          </label>
          <input
            type="url"
            value={form.sourceUrl}
            onChange={e => set('sourceUrl', e.target.value)}
            placeholder="https://www.cms.gov/..."
            className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 transition"
          />
        </div>

        {/* Action Required */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Action Required <span className="text-muted-foreground font-normal normal-case">(what staff must do)</span>
          </label>
          <textarea
            value={form.actionRequired}
            onChange={e => set('actionRequired', e.target.value)}
            rows={3}
            placeholder="e.g. Update policy #IC-04 by June 30. Brief all nursing staff by July 15. Complete attestation in training system."
            className="w-full px-3 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60 transition resize-none"
          />
        </div>

        {/* Affected Areas */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Affected Operational Areas
          </label>
          <div className="flex flex-wrap gap-2">
            {AFFECTED_AREA_OPTIONS.map(area => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  affectedAreas.includes(area)
                    ? 'bg-teal-950/40 border-teal-600/50 text-teal-300'
                    : 'bg-muted/20 border-border/50 text-muted-foreground hover:border-teal-700/40'
                }`}
              >
                {affectedAreas.includes(area) && <X className="w-2.5 h-2.5" />}
                {area}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-700/30 rounded-lg px-4 py-3">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-teal-500/20"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Send className="w-4 h-4" /> Publish &amp; Notify All Users</>}
          </button>
          <Link href="/regulatory-updates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
