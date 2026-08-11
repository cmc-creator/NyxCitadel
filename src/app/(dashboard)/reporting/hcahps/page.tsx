'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Users } from 'lucide-react';

/**
 * CMS HCAHPS - Hospital Consumer Assessment of Healthcare Providers and Systems
 * For psychiatric / behavioral health hospitals (quarterly reporting)
 *
 * 8 composite domains + 2 global ratings
 * Data comes from survey vendor; enter summary stats from the survey period.
 */

const COMPOSITE_DOMAINS = [
  {
    id: 'COM_NURSES',
    label: 'Communication with Nurses',
    description: 'How often nurses communicated well with patients.',
  },
  {
    id: 'COM_DOCTORS',
    label: 'Communication with Doctors',
    description: 'How often doctors communicated well with patients.',
  },
  {
    id: 'RESPONSIVENESS',
    label: 'Responsiveness of Hospital Staff',
    description: 'How often patients received help quickly when needed.',
  },
  {
    id: 'COM_MEDICINES',
    label: 'Communication about Medicines',
    description: 'How often nurses and doctors explained new medications.',
  },
  {
    id: 'CLEANLINESS',
    label: 'Cleanliness of Hospital Environment',
    description: 'How often the hospital room and bathrooms were clean.',
  },
  {
    id: 'QUIETNESS',
    label: 'Quietness of Hospital Environment',
    description: 'How often the area around the room was quiet at night.',
  },
  {
    id: 'DISCHARGE_INFO',
    label: 'Discharge Information',
    description: 'Whether patients received written info about symptoms and planned care.',
  },
  {
    id: 'CARE_TRANSITIONS',
    label: 'Care Transition',
    description: 'How well staff prepared patients for post-discharge care.',
  },
] as const;

type DomainValues = {
  numerator: string;
  denominator: string;
};

type FormState = {
  period: string;
  domains: Record<string, DomainValues>;
  overallRatingSum: string;
  overallRatingCount: string;
  wouldRecommendYes: string;
  wouldRecommendTotal: string;
  notes: string;
};

function emptyDomains(): Record<string, DomainValues> {
  const d: Record<string, DomainValues> = {};
  for (const dom of COMPOSITE_DOMAINS) {
    d[dom.id] = { numerator: '', denominator: '' };
  }
  return d;
}

function calcPct(num: string, den: string) {
  const n = parseFloat(num);
  const d = parseFloat(den);
  if (!isFinite(n) || !isFinite(d) || d === 0) return null;
  return ((n / d) * 100).toFixed(1);
}

export default function HcahpsPage() {
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');

  const [form, setForm] = useState<FormState>({
    period: '',
    domains: emptyDomains(),
    overallRatingSum:   '',
    overallRatingCount: '',
    wouldRecommendYes:   '',
    wouldRecommendTotal: '',
    notes: '',
  });

  function setDomain(id: string, field: keyof DomainValues, value: string) {
    setForm(prev => ({
      ...prev,
      domains: {
        ...prev.domains,
        [id]: { ...prev.domains[id], [field]: value },
      },
    }));
  }

  function setField(key: keyof Omit<FormState, 'domains'>, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave(status: 'DRAFT' | 'READY') {
    setSaving(true);
    setSaved(false);
    setError('');

    const domainScores: Record<string, { numerator: number; denominator: number; pct: number | null }> = {};
    for (const dom of COMPOSITE_DOMAINS) {
      const { numerator, denominator } = form.domains[dom.id];
      const pct = calcPct(numerator, denominator);
      domainScores[dom.id] = {
        numerator: parseFloat(numerator) || 0,
        denominator: parseFloat(denominator) || 0,
        pct: pct !== null ? parseFloat(pct) : null,
      };
    }

    const overallRatingAvg =
      form.overallRatingCount && form.overallRatingSum
        ? (parseFloat(form.overallRatingSum) / parseFloat(form.overallRatingCount)).toFixed(2)
        : null;

    const wouldRecommendPct = calcPct(form.wouldRecommendYes, form.wouldRecommendTotal);

    const payload = {
      submissionType: 'CMS_HCAHPS',
      status,
      period: form.period,
      data: {
        domains: domainScores,
        overallRatingAvg: overallRatingAvg !== null ? parseFloat(overallRatingAvg) : null,
        wouldRecommendPct: wouldRecommendPct !== null ? parseFloat(wouldRecommendPct) : null,
        notes: form.notes,
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
              <Users className="w-6 h-6 text-violet-400" />
              CMS HCAHPS Patient Satisfaction
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Patient satisfaction survey results - enter composite domain numerators and denominators
              from your survey vendor report.
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
              className="px-4 py-2 rounded-lg text-sm bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Mark Ready
            </button>
          </div>
        </div>
      </div>

      {saved  && <div className="bg-teal-950/30 border border-teal-600/40 text-teal-300 rounded-lg px-4 py-3 text-sm">Submission saved successfully.</div>}
      {error  && <div className="bg-red-950/20 border border-red-700/40 text-red-300 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {/* Survey Period */}
      <div className="bg-card rounded-xl border border-border px-6 py-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Survey Period</h2>
        <div className="max-w-xs">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Period (e.g. Q1&nbsp;2026)</label>
          <input
            className="form-input w-full"
            placeholder="Q1 2026"
            value={form.period}
            onChange={e => setField('period', e.target.value)}
          />
        </div>
      </div>

      {/* Composite Domain Scores */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Composite Domain Scores</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Enter the number of &quot;top-box&quot; responses (numerator) and total eligible responses (denominator).</p>
        </div>
        {COMPOSITE_DOMAINS.map((dom) => {
          const vals = form.domains[dom.id];
          const pct  = calcPct(vals.numerator, vals.denominator);
          return (
            <div key={dom.id} className="px-6 py-4 flex items-start gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{dom.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{dom.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Numerator</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input w-28"
                    value={vals.numerator}
                    onChange={e => setDomain(dom.id, 'numerator', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Denominator</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input w-28"
                    value={vals.denominator}
                    onChange={e => setDomain(dom.id, 'denominator', e.target.value)}
                  />
                </div>
                <div className="w-16 text-right">
                  {pct !== null ? (
                    <span className={`text-lg font-bold ${parseFloat(pct) >= 70 ? 'text-teal-400' : parseFloat(pct) >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {pct}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Ratings */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border/30">
        <div className="px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Global Ratings</h2>
        </div>

        {/* Overall Rating */}
        <div className="px-6 py-4">
          <p className="text-sm font-medium text-foreground mb-1">Overall Hospital Rating (0-10)</p>
          <p className="text-xs text-muted-foreground mb-3">Enter the sum of all patient ratings and the total number of respondents to calculate the average.</p>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Sum of All Ratings</label>
              <input
                type="number"
                min="0"
                className="form-input w-36"
                value={form.overallRatingSum}
                onChange={e => setField('overallRatingSum', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Number of Respondents</label>
              <input
                type="number"
                min="0"
                className="form-input w-36"
                value={form.overallRatingCount}
                onChange={e => setField('overallRatingCount', e.target.value)}
              />
            </div>
            <div className="pt-4">
              {form.overallRatingSum && form.overallRatingCount && parseFloat(form.overallRatingCount) > 0 ? (
                <span className="text-lg font-bold text-violet-400">
                  {(parseFloat(form.overallRatingSum) / parseFloat(form.overallRatingCount)).toFixed(1)} / 10
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
        </div>

        {/* Would Recommend */}
        <div className="px-6 py-4">
          <p className="text-sm font-medium text-foreground mb-1">Would Recommend Hospital</p>
          <p className="text-xs text-muted-foreground mb-3">Patients who would &quot;Definitely Yes&quot; recommend (top-box).</p>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Definitely Yes (Numerator)</label>
              <input
                type="number"
                min="0"
                className="form-input w-36"
                value={form.wouldRecommendYes}
                onChange={e => setField('wouldRecommendYes', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Total Respondents</label>
              <input
                type="number"
                min="0"
                className="form-input w-36"
                value={form.wouldRecommendTotal}
                onChange={e => setField('wouldRecommendTotal', e.target.value)}
              />
            </div>
            <div className="pt-4">
              {(() => {
                const pct = calcPct(form.wouldRecommendYes, form.wouldRecommendTotal);
                return pct !== null ? (
                  <span className={`text-lg font-bold ${parseFloat(pct) >= 70 ? 'text-teal-400' : 'text-amber-400'}`}>{pct}%</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-card rounded-xl border border-border px-6 py-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Notes / Context</h2>
        <textarea
          rows={3}
          className="form-input w-full"
          placeholder="Survey vendor, response rate, notable trends, action plans…"
          value={form.notes}
          onChange={e => setField('notes', e.target.value)}
        />
      </div>

      {/* Footer actions */}
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
          className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Mark Ready to Submit'}
        </button>
      </div>
    </div>
  );
}
