'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * CMS Conditions of Participation — Psychiatric Hospital (42 CFR Part 482)
 *
 * Required CoPs for psychiatric hospitals:
 *   482.13  Patient Rights
 *   482.21  QAPI (Quality Assessment and Performance Improvement)
 *   482.22  Medical Staff
 *   482.23  Nursing Services
 *   482.24  Medical Record Services
 *   482.25  Pharmaceutical Services
 *   482.41  Physical Environment
 *   482.42  Infection Control
 */

const CONDITIONS = [
  {
    id: 'COP_482_13',
    cfr: '§482.13',
    label: 'Patient Rights',
    description: 'Facility must protect and promote each patient\'s rights including informed consent, privacy, freedom from restraint/seclusion abuse, and grievance rights.',
    standards: [
      '§482.13(a) Notice of rights',
      '§482.13(b) Exercise of rights',
      '§482.13(c) Privacy and safety',
      '§482.13(d) Confidentiality of patient records',
      '§482.13(e) Restraint or seclusion',
      '§482.13(f) Safe implementation of restraint or seclusion',
      '§482.13(g) Death reporting',
    ],
  },
  {
    id: 'COP_482_21',
    cfr: '§482.21',
    label: 'Quality Assessment and Performance Improvement (QAPI)',
    description: 'Facility must maintain an effective, ongoing, hospital-wide data-driven quality assessment and performance improvement program.',
    standards: [
      '§482.21(a) Program scope',
      '§482.21(b) Program data',
      '§482.21(c) Program activities',
      '§482.21(d) Performance improvement projects',
      '§482.21(e) Executive responsibilities',
    ],
  },
  {
    id: 'COP_482_22',
    cfr: '§482.22',
    label: 'Medical Staff',
    description: 'Facility must have a well-organized medical staff responsible for quality of care provided to patients under the direction of the governing body.',
    standards: [
      '§482.22(a) Composition of the medical staff',
      '§482.22(b) Medical staff bylaws',
      '§482.22(c) Credentialing',
    ],
  },
  {
    id: 'COP_482_23',
    cfr: '§482.23',
    label: 'Nursing Services',
    description: 'Facility must have an organized nursing service providing 24-hour nursing care in accordance with patient needs.',
    standards: [
      '§482.23(a) Organization',
      '§482.23(b) Staffing and delivery of care',
      '§482.23(c) Preparation and administration of drugs',
    ],
  },
  {
    id: 'COP_482_24',
    cfr: '§482.24',
    label: 'Medical Record Services',
    description: 'Facility must have a medical record service maintaining a medical record system for every patient.',
    standards: [
      '§482.24(a) Organization and staffing',
      '§482.24(b) Form and retention of record',
      '§482.24(c) Content of record',
    ],
  },
  {
    id: 'COP_482_25',
    cfr: '§482.25',
    label: 'Pharmaceutical Services',
    description: 'Facility must have pharmaceutical services that meet the needs of patients, including policies and procedures governing safe and effective drug therapy.',
    standards: [
      '§482.25(a) Pharmacy management and administration',
      '§482.25(b) Delivery of services',
    ],
  },
  {
    id: 'COP_482_41',
    cfr: '§482.41',
    label: 'Physical Environment',
    description: 'Facility must be constructed, arranged, and maintained to ensure patient safety and provide facilities for diagnosis and treatment.',
    standards: [
      '§482.41(a) Buildings',
      '§482.41(b) Life safety from fire',
      '§482.41(c) Facilities',
    ],
  },
  {
    id: 'COP_482_42',
    cfr: '§482.42',
    label: 'Infection Control',
    description: 'Facility must provide a sanitary environment to avoid sources and transmission of infection.',
    standards: [
      '§482.42(a) Organization and policies',
      '§482.42(b) Responsibilities of chief medical officer, chief nursing officer, administrator',
    ],
  },
] as const;

type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW' | '';

interface CopEntry {
  status: ComplianceStatus;
  evidence: string;
  actionRequired: string;
  targetDate: string;
}

function blankEntry(): CopEntry {
  return { status: '', evidence: '', actionRequired: '', targetDate: '' };
}

function statusBadge(s: ComplianceStatus) {
  switch (s) {
    case 'COMPLIANT':     return <span className="px-2 py-0.5 rounded-full text-xs bg-teal-900/40 text-teal-300 font-medium">Compliant</span>;
    case 'NON_COMPLIANT': return <span className="px-2 py-0.5 rounded-full text-xs bg-red-900/40 text-red-300 font-medium">Non-Compliant</span>;
    case 'NEEDS_REVIEW':  return <span className="px-2 py-0.5 rounded-full text-xs bg-amber-900/40 text-amber-300 font-medium">Needs Review</span>;
    default:              return <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-muted-foreground font-medium">Not Assessed</span>;
  }
}

export default function CopPage() {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');
  const [period, setPeriod] = useState('');
  const [notes,  setNotes]  = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const [entries, setEntries] = useState<Record<string, CopEntry>>(() => {
    const e: Record<string, CopEntry> = {};
    for (const c of CONDITIONS) e[c.id] = blankEntry();
    return e;
  });

  function updateEntry(id: string, field: keyof CopEntry, value: string) {
    setEntries(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function toggleExpand(id: string) {
    setExpanded(prev => (prev === id ? null : id));
  }

  const summary = CONDITIONS.reduce(
    (acc, c) => {
      const s = entries[c.id].status;
      if (s === 'COMPLIANT')     acc.compliant++;
      else if (s === 'NON_COMPLIANT') acc.nonCompliant++;
      else if (s === 'NEEDS_REVIEW')  acc.needsReview++;
      else acc.unassessed++;
      return acc;
    },
    { compliant: 0, nonCompliant: 0, needsReview: 0, unassessed: 0 }
  );

  async function handleSave(status: 'DRAFT' | 'READY') {
    setSaving(true);
    setSaved(false);
    setError('');

    const payload = {
      submissionType: 'CMS_CONDITION_OF_PARTICIPATION',
      status,
      period,
      data: {
        entries,
        summary,
        notes,
      },
    };

    const res = await fetch('/api/regulatory-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setSaved(true);
    } else {
      const body = await res.json().catch(() => ({}));
      setError((body as { error?: string }).error ?? 'Save failed.');
    }
    setSaving(false);
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/reporting" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-teal-400 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Reporting Dashboard
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              CMS Conditions of Participation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Psychiatric hospital CoP self-assessment — 42 CFR Part 482. Document compliance status
              and corrective actions for each Condition.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-border transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave('READY')}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Mark Ready
            </button>
          </div>
        </div>
      </div>

      {saved && <div className="bg-teal-950/30 border border-teal-600/40 text-teal-300 rounded-lg px-4 py-3 text-sm">Submission saved successfully.</div>}
      {error && <div className="bg-red-950/20 border border-red-700/40 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {/* Assessment Period + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Assessment Period</h2>
          <input
            className="form-input w-full"
            placeholder="e.g. FY 2026 Annual Survey"
            value={period}
            onChange={e => setPeriod(e.target.value)}
          />
        </div>
        <div className="bg-card rounded-xl border border-border px-6 py-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">Summary</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Compliant</span>
              <span className="font-bold text-teal-400">{summary.compliant}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Non-Compliant</span>
              <span className="font-bold text-red-400">{summary.nonCompliant}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Needs Review</span>
              <span className="font-bold text-amber-400">{summary.needsReview}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Not Assessed</span>
              <span className="font-bold text-muted-foreground">{summary.unassessed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CoP Conditions Accordion */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Conditions of Participation</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Click each condition to expand and document compliance status, evidence, and action items.</p>
        </div>
        {CONDITIONS.map((cop) => {
          const entry   = entries[cop.id];
          const isOpen  = expanded === cop.id;
          return (
            <div key={cop.id}>
              {/* Row header */}
              <button
                type="button"
                className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
                onClick={() => toggleExpand(cop.id)}
              >
                <span className="font-mono text-xs text-indigo-400 w-16 shrink-0">{cop.cfr}</span>
                <span className="flex-1 text-sm font-medium text-foreground">{cop.label}</span>
                {statusBadge(entry.status)}
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-6 pb-5 space-y-4 border-t border-border/30 pt-4">
                  <p className="text-xs text-slate-400">{cop.description}</p>

                  {/* Standards checklist */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Standards under this Condition:</p>
                    <ul className="space-y-0.5 text-xs text-muted-foreground list-disc list-inside">
                      {cop.standards.map(s => <li key={s}>{s}</li>)}
                    </ul>
                  </div>

                  {/* Compliance status */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Compliance Status</label>
                    <select
                      className="form-input w-full max-w-xs"
                      value={entry.status}
                      onChange={e => updateEntry(cop.id, 'status', e.target.value)}
                    >
                      <option value="">-- Select --</option>
                      <option value="COMPLIANT">Compliant</option>
                      <option value="NON_COMPLIANT">Non-Compliant</option>
                      <option value="NEEDS_REVIEW">Needs Review</option>
                    </select>
                  </div>

                  {/* Evidence */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Evidence / Documentation</label>
                    <textarea
                      rows={2}
                      className="form-input w-full"
                      placeholder="Policies, audits, training records, survey findings…"
                      value={entry.evidence}
                      onChange={e => updateEntry(cop.id, 'evidence', e.target.value)}
                    />
                  </div>

                  {/* Action required */}
                  {(entry.status === 'NON_COMPLIANT' || entry.status === 'NEEDS_REVIEW') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Action Required / Plan of Correction</label>
                        <textarea
                          rows={2}
                          className="form-input w-full"
                          placeholder="Describe corrective actions…"
                          value={entry.actionRequired}
                          onChange={e => updateEntry(cop.id, 'actionRequired', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Target Completion Date</label>
                        <input
                          type="date"
                          className="form-input w-full"
                          value={entry.targetDate}
                          onChange={e => updateEntry(cop.id, 'targetDate', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes */}
      <div className="bg-card rounded-xl border border-border px-6 py-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Overall Notes</h2>
        <textarea
          rows={3}
          className="form-input w-full"
          placeholder="Surveyor findings, leadership sign-off, next survey date…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => handleSave('DRAFT')}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-border transition-colors disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSave('READY')}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Mark Ready to Submit'}
        </button>
      </div>
    </div>
  );
}
