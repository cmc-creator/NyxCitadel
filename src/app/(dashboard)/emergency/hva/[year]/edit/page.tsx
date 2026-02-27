'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';

const HAZARD_TYPES = [
  ['NATURAL',        'Natural (earthquake, flood, tornado, extreme heat)'],
  ['TECHNOLOGICAL',  'Technological (power, IT failure, chemical spill)'],
  ['HUMAN',          'Human (mass casualty, active threat, civil unrest)'],
  ['HAZMAT',         'Hazmat (chemical, biological, radiological)'],
  ['INFRASTRUCTURE', 'Infrastructure (water, HVAC, structural)'],
];

const HVA_STATUSES = [
  ['IN_PROGRESS', 'In Progress'],
  ['COMPLETED',   'Completed'],
  ['REVIEWED',    'Reviewed'],
  ['APPROVED',    'Approved'],
];

const DEFAULT_HAZARDS = [
  { hazardName: 'Earthquake',            hazardType: 'NATURAL',        probability: 1, magnitude: 3, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'Flash Flood',           hazardType: 'NATURAL',        probability: 1, magnitude: 2, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'Extreme Heat',          hazardType: 'NATURAL',        probability: 3, magnitude: 2, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'Power Outage',          hazardType: 'TECHNOLOGICAL',  probability: 2, magnitude: 3, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'IT System Failure',     hazardType: 'TECHNOLOGICAL',  probability: 2, magnitude: 2, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'Active Shooter',        hazardType: 'HUMAN',          probability: 1, magnitude: 3, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'Patient Elopement',     hazardType: 'HUMAN',          probability: 2, magnitude: 2, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'Hazardous Material',    hazardType: 'HAZMAT',         probability: 1, magnitude: 2, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'Water System Failure',  hazardType: 'INFRASTRUCTURE', probability: 1, magnitude: 3, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
  { hazardName: 'HVAC Failure',          hazardType: 'INFRASTRUCTURE', probability: 2, magnitude: 2, preparedness: 2, mitigationPlan: '', responsibleParty: '' },
];

interface HazardRow {
  hazardName:       string;
  hazardType:       string;
  probability:      number;
  magnitude:        number;
  preparedness:     number;
  mitigationPlan:   string;
  responsibleParty: string;
}

function calcScore(p: number, m: number, prep: number) {
  return Math.round(((p * m * prep) / 27) * 100);
}

function RiskBadge({ pct }: { pct: number }) {
  if (pct >= 70) return <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">HIGH {pct}%</span>;
  if (pct >= 40) return <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">MED {pct}%</span>;
  return <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700">LOW {pct}%</span>;
}

export default function HvaEditPage() {
  const params = useParams();
  const router = useRouter();
  const year = Number(params.year);

  const [hazards, setHazards] = useState<HazardRow[]>([]);
  const [status, setStatus] = useState('IN_PROGRESS');
  const [reviewedBy, setReviewedBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/hva');
      const data: Array<{
        assessmentYear: number;
        status: string;
        reviewedBy?: string;
        approvedBy?: string;
        completedDate?: string;
        notes?: string;
        documentUrl?: string;
        hazards: HazardRow[];
      }> = await res.json();
      const existing = data.find(a => a.assessmentYear === year);
      if (existing) {
        setStatus(existing.status);
        setReviewedBy(existing.reviewedBy ?? '');
        setApprovedBy(existing.approvedBy ?? '');
        setCompletedDate(existing.completedDate ? existing.completedDate.slice(0, 10) : '');
        setNotes(existing.notes ?? '');
        setDocumentUrl(existing.documentUrl ?? '');
        setHazards(existing.hazards.map(h => ({
          ...h,
          mitigationPlan:   h.mitigationPlan ?? '',
          responsibleParty: h.responsibleParty ?? '',
        })));
      } else {
        setHazards(DEFAULT_HAZARDS);
      }
    } catch {
      setError('Failed to load HVA data.');
    } finally {
      setLoaded(true);
    }
  }, [year]);

  useEffect(() => { load(); }, [load]);

  function updateHazard(idx: number, field: keyof HazardRow, value: string | number) {
    setHazards(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  }

  function addHazard() {
    setHazards(prev => [...prev, {
      hazardName: '', hazardType: 'NATURAL', probability: 1, magnitude: 1, preparedness: 1,
      mitigationPlan: '', responsibleParty: '',
    }]);
  }

  function removeHazard(idx: number) {
    setHazards(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/hva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentYear: year,
          status,
          reviewedBy: reviewedBy || null,
          approvedBy: approvedBy || null,
          completedDate: completedDate || null,
          notes: notes || null,
          documentUrl: documentUrl || null,
          hazards,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Save failed');
      router.push('/emergency/hva');
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  if (!loaded) {
    return <div className="text-sm text-slate-400 py-12 text-center">Loading HVA…</div>;
  }

  const sortedByScore = [...hazards].sort((a, b) =>
    calcScore(b.probability, b.magnitude, b.preparedness) - calcScore(a.probability, a.magnitude, a.preparedness)
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/emergency/hva" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to HVA
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-slate-900">{year} Hazard Vulnerability Analysis</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save HVA'}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-1 ml-9">
          Kaiser Permanente–style scoring · JC EM.01.01.01 · {hazards.length} hazards
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">{error}</div>}

      {/* Assessment metadata */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Assessment Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              {HVA_STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Reviewed By</label>
            <input value={reviewedBy} onChange={e => setReviewedBy(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Approved By</label>
            <input value={approvedBy} onChange={e => setApprovedBy(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Completed Date</label>
            <input type="date" value={completedDate} onChange={e => setCompletedDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Document URL</label>
            <input type="url" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Optional notes" />
          </div>
        </div>
      </div>

      {/* Scoring legend */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <strong>Scoring guide:</strong> Each dimension is rated 0–3.{' '}
        Probability: 0=N/A · 1=Low · 2=Moderate · 3=High.{' '}
        Magnitude: 0=No effect · 1=Limited · 2=Moderate · 3=Critical.{' '}
        Preparedness: 0=None · 1=Minimal · 2=Adequate · 3=Not Prepared (inverse).{' '}
        Risk Score = (P × M × Prep) / 27.
      </div>

      {/* Hazards table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Hazards ({hazards.length})</h2>
          <button onClick={addHazard}
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100">
            <Plus className="w-3.5 h-3.5" /> Add Hazard
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 min-w-[180px]">Hazard Name</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 min-w-[140px]">Type</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-slate-600 w-16">Prob.</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-slate-600 w-16">Mag.</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-slate-600 w-16">Prep.</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 w-24">Score</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 min-w-[200px]">Mitigation Plan</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-600 min-w-[120px]">Responsible</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {hazards.map((h, idx) => {
                const pct = calcScore(h.probability, h.magnitude, h.preparedness);
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <input
                        value={h.hazardName}
                        onChange={e => updateHazard(idx, 'hazardName', e.target.value)}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                        placeholder="Hazard name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={h.hazardType}
                        onChange={e => updateHazard(idx, 'hazardType', e.target.value)}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                      >
                        {HAZARD_TYPES.map(([v]) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </td>
                    {(['probability', 'magnitude', 'preparedness'] as const).map(field => (
                      <td key={field} className="px-3 py-2 text-center">
                        <select
                          value={h[field]}
                          onChange={e => updateHazard(idx, field, Number(e.target.value))}
                          className="w-14 border border-slate-200 rounded px-1 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-amber-400"
                        >
                          {[0,1,2,3].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <RiskBadge pct={pct} />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={h.mitigationPlan}
                        onChange={e => updateHazard(idx, 'mitigationPlan', e.target.value)}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                        placeholder="Mitigation actions…"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={h.responsibleParty}
                        onChange={e => updateHazard(idx, 'responsibleParty', e.target.value)}
                        className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                        placeholder="Role or name"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => removeHazard(idx)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save button (bottom) */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-sm bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : `Save ${year} HVA`}
        </button>
        <Link href="/emergency/hva"
          className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
          Cancel
        </Link>
      </div>
    </div>
  );
}
